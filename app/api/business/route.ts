import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Die App ist aktuell single-tenant (nur "Via Nuova"), daher reicht es, das erste
// (und einzige) Business zurückzugeben. Falls später Mandantenfähigkeit gebraucht wird,
// kann hier ein echter Auth-Kontext ergänzt werden.
export async function GET() {
  const business = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!business) {
    return NextResponse.json({ error: "Kein Business angelegt." }, { status: 404 });
  }

  return NextResponse.json({ business });
}

// PATCH: Bearbeitet das Business-Profil (Spezialitäten, Ambiente-Highlights, Tonalität),
// z.B. über die Profil-Einstellungen im Dashboard.
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, specialties, ambianceHighlights, toneOfVoice } = body;
    if (!id) {
      return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        ...(Array.isArray(specialties) ? { specialties } : {}),
        ...(Array.isArray(ambianceHighlights) ? { ambianceHighlights } : {}),
        ...(typeof toneOfVoice === "string" && toneOfVoice ? { toneOfVoice } : {}),
      },
    });

    return NextResponse.json({ business });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Aktualisieren des Business-Profils:", error);
    return NextResponse.json({ error: `Interner Fehler: ${message}` }, { status: 500 });
  }
}
