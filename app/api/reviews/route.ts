import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ReviewPlatform } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

// Legt eine Bewertung manuell an. Simuliert vorerst, was später automatisch von der
// Google-Business-/Facebook-API reinkommen würde (siehe Phase 6 der Roadmap).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { platform, rating, reviewText, reviewerName } = body;

  if (!platform || !rating || !reviewText) {
    return NextResponse.json(
      { error: "platform, rating und reviewText sind erforderlich." },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      platform: platform as ReviewPlatform,
      rating,
      reviewText,
      reviewerName: reviewerName ?? null,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, replyStatus, replyText } = body;

  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      ...(replyStatus ? { replyStatus } : {}),
      ...(replyText ? { replyText } : {}),
    },
  });

  return NextResponse.json({ review: updated });
}
