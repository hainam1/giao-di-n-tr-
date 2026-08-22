-- AlterTable
ALTER TABLE "users" ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsVersion" TEXT;

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "testimonials_rating_range" CHECK ("rating" BETWEEN 1 AND 5)
);

-- CreateIndex
CREATE INDEX "testimonials_status_isPinned_createdAt_idx" ON "testimonials"("status", "isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "testimonials_userId_idx" ON "testimonials"("userId");

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
