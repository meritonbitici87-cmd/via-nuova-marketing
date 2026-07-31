-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('food', 'ambiance');

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "category" "MediaCategory" NOT NULL DEFAULT 'food';
