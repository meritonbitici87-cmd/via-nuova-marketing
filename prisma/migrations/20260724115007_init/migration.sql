-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('instagram', 'facebook', 'google_business', 'blog', 'review_reply');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'approved', 'posted');

-- CreateEnum
CREATE TYPE "ReviewPlatform" AS ENUM ('google', 'facebook');

-- CreateEnum
CREATE TYPE "ReplyStatus" AS ENUM ('pending', 'approved', 'posted');

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "specialties" TEXT[],
    "toneOfVoice" TEXT NOT NULL DEFAULT 'modern, herzlich, lokal verwurzelt',
    "googlePlaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "contentText" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "sourcePrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "platform" "ReviewPlatform" NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT NOT NULL,
    "reviewerName" TEXT,
    "replyText" TEXT,
    "replyStatus" "ReplyStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
