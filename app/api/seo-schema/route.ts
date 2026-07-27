import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildLocalBusinessSchema, buildScriptTag } from "@/lib/seoSchema";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Liefert fertigen schema.org/JSON-LD-Code (Typ "Restaurant" inkl. Bewertungen), der 1:1
// in den <head> der eigentlichen Website (separates Via-Nuova-Homepage-Projekt) eingefügt
// werden kann. Rein deterministisch aus den gespeicherten Business-/Review-Daten aufgebaut,
// keine KI-Generierung nötig (und keine erfundenen Angaben wie Öffnungszeiten/Preise).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json({ error: "businessId ist erforderlich." }, { status: 400 });
  }

  const [business, reviews] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.review.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!business) {
    return NextResponse.json({ error: "Business nicht gefunden." }, { status: 404 });
  }

  const schema = buildLocalBusinessSchema(
    { name: business.name, address: business.address, phone: business.phone },
    reviews
  );

  return NextResponse.json({ schema, scriptTag: buildScriptTag(schema) });
}
