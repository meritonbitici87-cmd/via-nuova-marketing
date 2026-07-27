-- CreateEnum
CREATE TYPE "ReportPeriod" AS ENUM ('weekly', 'monthly');

-- AlterTable
ALTER TABLE "PostLog" ADD COLUMN     "commentCount" INTEGER,
ADD COLUMN     "impressions" INTEGER,
ADD COLUMN     "insightsFetchedAt" TIMESTAMP(3),
ADD COLUMN     "likeCount" INTEGER,
ADD COLUMN     "reach" INTEGER,
ADD COLUMN     "shareCount" INTEGER;

-- CreateTable
CREATE TABLE "AnalyticsReport" (
    "id" TEXT NOT NULL,
    "periodType" "ReportPeriod" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);
