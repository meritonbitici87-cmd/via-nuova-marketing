import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateImage } from "@/lib/openai";
import { buildImagePrompt } from "@/lib/prompts/image";
import { uploadFile } from "@/lib/supabaseStorage";

const prisma = new PrismaClient();

// GET: Liste aller bisher generierten Bilder (neueste zuerst).
export async function GET() {
  const images = await prisma.generatedImage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ images });
}

// POST: Generiert ein neues Bild via OpenAI (gpt-image-1), lädt es in Supabase Storage
// hoch (kein lokales Dateisystem, da Vercel serverless/read-only ist) und legt einen
// GeneratedImage-Datensatz an.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, description, contentItemId } = body;

    if (!businessId || !description) {
      return NextResponse.json(
        { error: "businessId und description sind erforderlich." },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ error: "Business nicht gefunden." }, { status: 404 });
    }

    const prompt = buildImagePrompt(
      { name: business.name, address: business.address, specialties: business.specialties, toneOfVoice: business.toneOfVoice },
      description
    );

    const base64 = await generateImage(prompt);

    const fileName = `${Math.random().toString(36).slice(2, 8)}.png`;
    const { url } = await uploadFile("media", Buffer.from(base64, "base64"), fileName, "image/png");

    const image = await prisma.generatedImage.create({
      data: {
        prompt: description,
        imagePath: url,
        ...(contentItemId ? { contentItemId } : {}),
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler bei der Bildgenerierung:", error);
    return NextResponse.json(
      { error: `Interner Fehler bei der Bildgenerierung: ${message}` },
      { status: 500 }
    );
  }
}
