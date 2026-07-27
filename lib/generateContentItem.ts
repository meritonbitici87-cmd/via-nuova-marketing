import { PrismaClient, ContentType } from "@prisma/client";
import { generateText } from "./claude";
import { GenerationOptions } from "./prompts/types";
import { CONTENT_TYPES } from "./contentTypes";

const prisma = new PrismaClient();

interface GenerateParams {
  businessId: string;
  type: string;
  options: GenerationOptions;
  scheduledDate?: Date;
  customerId?: string;
}

// Gemeinsame Kernlogik, die sowohl von der Einzelgenerierung (/api/generate-content)
// als auch vom Kalender (/api/generate-calendar) genutzt wird. So bleibt die eigentliche
// "Business -> Prompt -> Claude -> DB" Pipeline an genau einer Stelle im Code.
export async function generateContentItem({
  businessId,
  type,
  options,
  scheduledDate,
  customerId,
}: GenerateParams) {
  const contentTypeConfig = CONTENT_TYPES[type];
  if (!contentTypeConfig) {
    throw new Error(`Unbekannter Content-Typ "${type}".`);
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    throw new Error("Business nicht gefunden.");
  }

  const prompt = contentTypeConfig.build(
    {
      name: business.name,
      address: business.address,
      specialties: business.specialties,
      toneOfVoice: business.toneOfVoice,
    },
    options
  );

  const generatedText = await generateText(prompt);

  return prisma.contentItem.create({
    data: {
      type: type as ContentType,
      status: "draft",
      contentText: generatedText,
      sourcePrompt: prompt,
      ...(scheduledDate ? { scheduledDate } : {}),
      ...(customerId ? { customerId } : {}),
    },
  });
}
