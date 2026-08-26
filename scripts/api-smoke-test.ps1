param(
  [string]$BaseUrl = 'http://localhost:5000',
  [string]$AdminEmail = 'admin@tradao.vn',
  [string]$AdminPassword = 'admin123',
  [string]$CustomerEmail = 'khachhang@gmail.com',
  [string]$CustomerPassword = 'user123'
)

$ErrorActionPreference = 'Stop'
$script:Passed = 0
$script:Failed = 0

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body,
    [string]$Token
  )
  $headers = @{}
  if ($Token) { $headers.Authorization = "Bearer $Token" }
  $params = @{ Method = $Method; Uri = "$BaseUrl$Path"; Headers = $headers; TimeoutSec = 15; UseBasicParsing = $true }
  if ($null -ne $Body) {
    $params.ContentType = 'application/json'
    $params.Body = $Body | ConvertTo-Json -Depth 10
  }
  try {
    $response = Invoke-WebRequest @params
    return @{ Status = [int]$response.StatusCode; Json = ($response.Content | ConvertFrom-Json) }
  }
  catch {
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
      $stream = $_.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $content = $reader.ReadToEnd()
      $json = if ($content) { $content | ConvertFrom-Json } else { $null }
      return @{ Status = $status; Json = $json }
    }
    throw
  }
}

function Assert-Status {
  param([string]$Name, [hashtable]$Response, [int[]]$Expected)
  if ($Expected -contains $Response.Status) {
    $script:Passed++
    Write-Host "[PASS] $Name (HTTP $($Response.Status))" -ForegroundColor Green
    return
  }
  $script:Failed++
  Write-Host "[FAIL] $Name - expected $($Expected -join '/') but received $($Response.Status)" -ForegroundColor Red
}

$health = Invoke-Api GET '/health'
Assert-Status 'Health check' $health @(200)

$customerLogin = Invoke-Api POST '/api/v1/auth/login' @{ email = $CustomerEmail; password = $CustomerPassword }
Assert-Status 'Customer login' $customerLogin @(200)
$customerToken = $customerLogin.Json.data.token

$adminLogin = Invoke-Api POST '/api/v1/auth/login' @{ email = $AdminEmail; password = $AdminPassword }
Assert-Status 'Admin login' $adminLogin @(200)
$adminToken = $adminLogin.Json.data.token

Assert-Status 'Authenticated profile' (Invoke-Api GET '/api/v1/auth/profile' $null $customerToken) @(200)
Assert-Status 'Profile without token' (Invoke-Api GET '/api/v1/auth/profile') @(401)
Assert-Status 'Invalid login' (Invoke-Api POST '/api/v1/auth/login' @{ email = $CustomerEmail; password = 'wrong-password' }) @(401)

$categories = Invoke-Api GET '/api/v1/categories'
Assert-Status 'List categories' $categories @(200)
$products = Invoke-Api GET '/api/v1/products'
Assert-Status 'List products' $products @(200)

$product = $products.Json.data | Where-Object { $_.variants.Count -gt 0 -and $_.variants[0].inventory.quantity -gt 0 } | Select-Object -First 1
if (-not $product) { throw 'Seed data has no in-stock product variant for the checkout smoke test.' }
$variant = $product.variants[0]
Assert-Status 'Product detail' (Invoke-Api GET "/api/v1/products/$($product.slug)") @(200)
Assert-Status 'Missing product' (Invoke-Api GET '/api/v1/products/not-a-real-product') @(404)

Assert-Status 'Cart without token' (Invoke-Api GET '/api/v1/cart') @(401)
Assert-Status 'Reject invalid cart' (Invoke-Api PUT '/api/v1/cart' @{ items = @(@{ variantId = $variant.id; quantity = 0 }) } $customerToken) @(400)
Assert-Status 'Update cart' (Invoke-Api PUT '/api/v1/cart' @{ items = @(@{ variantId = $variant.id; quantity = 1 }) } $customerToken) @(200)
Assert-Status 'Get cart' (Invoke-Api GET '/api/v1/cart' $null $customerToken) @(200)

$orderValue = [double]$variant.price
Assert-Status 'Validate voucher XATON20' (Invoke-Api POST '/api/v1/vouchers/validate' @{ code = 'XATON20'; orderValue = $orderValue }) @(200)
Assert-Status 'Reject missing voucher' (Invoke-Api POST '/api/v1/vouchers/validate' @{ code = 'DOES-NOT-EXIST'; orderValue = $orderValue }) @(404)

$checkoutBody = @{
  customerName = 'Khach hang Smoke Test'
  customerEmail = $CustomerEmail
  customerPhone = '0900000000'
  shippingAddress = '123 Tan Cuong'
  shippingWard = 'Tan Cuong'
  shippingDistrict = 'Thanh pho Thai Nguyen'
  shippingProvince = 'Thai Nguyen'
  customerNote = 'Automated order created by scripts/api-smoke-test.ps1'
  shippingFee = 30000
  paymentMethod = 'COD'
}
$checkout = Invoke-Api POST '/api/v1/orders' $checkoutBody $customerToken
Assert-Status 'Customer checkout' $checkout @(201)
$orderId = $checkout.Json.data.id

Assert-Status 'Customer order history' (Invoke-Api GET '/api/v1/orders/my' $null $customerToken) @(200)
Assert-Status 'Customer forbidden from Admin' (Invoke-Api GET '/api/v1/admin/dashboard' $null $customerToken) @(403)
Assert-Status 'Admin dashboard' (Invoke-Api GET '/api/v1/admin/dashboard' $null $adminToken) @(200)
Assert-Status 'Admin order list' (Invoke-Api GET '/api/v1/admin/orders' $null $adminToken) @(200)

if ($orderId) {
  Assert-Status 'Admin confirms order' (Invoke-Api PATCH "/api/v1/admin/orders/$orderId/status" @{ status = 'CONFIRMED'; note = 'Smoke test confirmation' } $adminToken) @(200)
  $tracking = "SMOKE-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  Assert-Status 'Admin creates shipment' (Invoke-Api POST "/api/v1/admin/orders/$orderId/shipment" @{
    carrier = 'TEST-CARRIER'; trackingCode = $tracking; status = 'SHIPPING'
  } $adminToken) @(200)
}

Write-Host "Smoke test complete: $script:Passed passed, $script:Failed failed." -ForegroundColor Cyan
if ($script:Failed -gt 0) { exit 1 }
