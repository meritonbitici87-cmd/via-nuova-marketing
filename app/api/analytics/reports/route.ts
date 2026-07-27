import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateAnalyticsReport } from "@/lib/generateAnalyticsReport";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  const reports = await prisma.analyticsReport.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reports });
}

// Erzeugt sofort einen neuen Bericht (Dashboard-Button "Jetzt erstellen").
export async function POST(req: NextRequest) {
  try {
    const { periodType } = await req.json();
    if (periodType !== "weekly" && periodType !== "monthly") {
      return NextResponse.json(
        { error: 'periodType muss "weekly" oder "monthly" sein.' },
        { status: 400 }
      );
    }

    const report = await generateAnalyticsReport(periodType);
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Erstellen des Analytics-Berichts:", error);
    return NextResponse.json({ error: `Interner Fehler: ${message}` }, { status: 500 });
  }
}
