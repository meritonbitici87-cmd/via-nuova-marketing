-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'ad_copy';
ALTER TYPE "ContentType" ADD VALUE 'menu_description';
ALTER TYPE "ContentType" ADD VALUE 'offer';
ALTER TYPE "ContentType" ADD VALUE 'seasonal_campaign';
ALTER TYPE "ContentType" ADD VALUE 'holiday_promo';
ALTER TYPE "ContentType" ADD VALUE 'faq';
