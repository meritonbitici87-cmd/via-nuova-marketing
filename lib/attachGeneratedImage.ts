import { PrismaClient } from "@prisma/client";
import { generateImage } from "./openai";
import { uploadFile } from "./supabaseStorage";
import { buildImagePrompt } from "./prompts/image";

const prisma = new PrismaClient();

// Generiert ein KI-Bild zu einem Motiv (z.B. eine Spezialität aus dem Business-Profil)
// und verknüpft es direkt mit einem ContentItem. Wird von der automatischen
// Kalender-Generierung genutzt, damit neue Posts nicht nur aus Text bestehen.
export async function generateAndAttachImage(
  contentItemId: string,
  businessId: string,
  motif: string
) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    throw new Error("Business nicht gefunden.");
  }

  const prompt = buildImagePrompt(
    {
      name: business.name,
      address: business.address,
      specialties: business.specialties,
      toneOfVoice: business.toneOfVoice,
    },
    motif
  );

  const base64 = await generateImage(prompt);
  const fileName = `${Math.random().toString(36).slice(2, 8)}.png`;
  const { url } = await uploadFile("media", Buffer.from(base64, "base64"), fileName, "image/png");

  return prisma.generatedImage.create({
    data: { prompt: motif, imagePath: url, contentItemId },
  });
}
