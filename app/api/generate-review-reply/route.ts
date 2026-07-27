import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateText } from "@/lib/claude";
import { buildReviewReplyPrompt } from "@/lib/prompts/review-reply";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, reviewId } = body;

    if (!businessId || !reviewId) {
      return NextResponse.json(
        { error: "businessId und reviewId sind erforderlich." },
        { status: 400 }
      );
    }

    const [business, review] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.review.findUnique({ where: { id: reviewId } }),
    ]);

    if (!business) {
      return NextResponse.json({ error: "Business nicht gefunden." }, { status: 404 });
    }
    if (!review) {
      return NextResponse.json({ error: "Bewertung nicht gefunden." }, { status: 404 });
    }

    const prompt = buildReviewReplyPrompt(
      {
        name: business.name,
        address: business.address,
        specialties: business.specialties,
        toneOfVoice: business.toneOfVoice,
      },
      {
        platform: review.platform,
        rating: review.rating,
        reviewText: review.reviewText,
        reviewerName: review.reviewerName,
      }
    );

    const generatedReply = await generateText(prompt);

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { replyText: generatedReply },
    });

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error("Fehler bei der Bewertungsantwort-Generierung:", error);
    return NextResponse.json(
      { error: "Interner Fehler bei der Bewertungsantwort-Generierung." },
      { status: 500 }
    );
  }
}
