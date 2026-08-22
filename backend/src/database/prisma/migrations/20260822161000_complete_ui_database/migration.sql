-- DropIndex
DROP INDEX "reviews_orderItemId_idx";

-- AlterTable
ALTER TABLE "contact_inquiries" ADD COLUMN     "needType" TEXT,
ADD COLUMN     "productInterest" TEXT;

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "device" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(14,2) NOT NULL,
    "minimumOrderValue" DECIMAL(14,2),
    "maximumDiscount" DECIMAL(14,2),
    "usageLimit" INTEGER,
    "usageLimitPerUser" INTEGER DEFAULT 1,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_products" (
    "voucherId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "voucher_products_pkey" PRIMARY KEY ("voucherId","productId")
);

-- CreateTable
CREATE TABLE "voucher_categories" (
    "voucherId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "voucher_categories_pkey" PRIMARY KEY ("voucherId","categoryId")
);

-- CreateTable
CREATE TABLE "voucher_redemptions" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voucher_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "carrier" TEXT,
    "baseFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estimatedMinDays" INTEGER,
    "estimatedMaxDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shippingMethodId" TEXT,
    "carrier" TEXT,
    "trackingCode" TEXT,
    "trackingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedDelivery" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oauth_accounts_userId_idx" ON "oauth_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_providerAccountId_key" ON "oauth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_expiresAt_idx" ON "sessions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "sessions_revokedAt_expiresAt_idx" ON "sessions"("revokedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_expiresAt_idx" ON "password_reset_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_isActive_startsAt_expiresAt_idx" ON "vouchers"("isActive", "startsAt", "expiresAt");

-- CreateIndex
CREATE INDEX "voucher_redemptions_userId_voucherId_idx" ON "voucher_redemptions"("userId", "voucherId");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_redemptions_voucherId_orderId_key" ON "voucher_redemptions"("voucherId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_methods_code_key" ON "shipping_methods"("code");

-- CreateIndex
CREATE INDEX "shipping_methods_isActive_idx" ON "shipping_methods"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_orderId_key" ON "shipments"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingCode_key" ON "shipments"("trackingCode");

-- CreateIndex
CREATE INDEX "shipments_shippingMethodId_status_idx" ON "shipments"("shippingMethodId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_orderItemId_key" ON "reviews"("orderItemId");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_inquiries" ADD CONSTRAINT "contact_inquiries_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_products" ADD CONSTRAINT "voucher_products_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_products" ADD CONSTRAINT "voucher_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_categories" ADD CONSTRAINT "voucher_categories_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_categories" ADD CONSTRAINT "voucher_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "shipping_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Business invariants for authentication, vouchers, and shipping.
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_discount_type_valid" CHECK ("discountType" IN ('PERCENTAGE', 'FIXED'));
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_discount_value_positive" CHECK ("discountValue" > 0);
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_percentage_range" CHECK ("discountType" <> 'PERCENTAGE' OR "discountValue" <= 100);
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_valid_period" CHECK ("startsAt" < "expiresAt");
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_limits_positive" CHECK (("usageLimit" IS NULL OR "usageLimit" > 0) AND ("usageLimitPerUser" IS NULL OR "usageLimitPerUser" > 0));
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_amount_positive" CHECK ("discountAmount" > 0);
ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_fee_nonnegative" CHECK ("baseFee" >= 0);
ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_days_valid" CHECK (("estimatedMinDays" IS NULL OR "estimatedMinDays" >= 0) AND ("estimatedMaxDays" IS NULL OR "estimatedMaxDays" >= "estimatedMinDays"));
