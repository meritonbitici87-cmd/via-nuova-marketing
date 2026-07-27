-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'story';
ALTER TYPE "ContentType" ADD VALUE 'reel_script';
ALTER TYPE "ContentType" ADD VALUE 'tiktok_script';
ALTER TYPE "ContentType" ADD VALUE 'newsletter';
