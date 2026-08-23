param(
  [string]$BackendUrl = 'http://localhost:5000',
  [string]$FrontendUrl = 'http://localhost:3000'
)

$ErrorActionPreference = 'Stop'

try {
  $backend = Invoke-RestMethod -Uri "$BackendUrl/health" -TimeoutSec 10
  if (-not $backend.success -or $backend.data.status -ne 'UP') {
    throw 'Backend responded but did not report status UP.'
  }
  Write-Host "[OK] Backend: $BackendUrl/health ($($backend.data.status))" -ForegroundColor Green
}
catch {
  Write-Host "[FAIL] Backend: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

try {
  $frontend = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -TimeoutSec 10
  if ($frontend.StatusCode -ne 200) {
    throw "Unexpected HTTP status $($frontend.StatusCode)."
  }
  Write-Host "[OK] Frontend: $FrontendUrl (HTTP $($frontend.StatusCode))" -ForegroundColor Green
}
catch {
  Write-Host "[FAIL] Frontend: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host 'All services are healthy.' -ForegroundColor Green
