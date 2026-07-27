import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildCalendarPlan } from "@/lib/contentCalendar";
import { generateContentItem } from "@/lib/generateContentItem";

const prisma = new PrismaClient();

// Sicherheitsnetz: verhindert versehentliche Massen-Generierung (= Massen-Kosten),
// falls z.B. "days": 365 übergeben wird. Wer wirklich einen längeren Zeitraum will,
// ruft die Route mehrfach mit kleineren Abschnitten auf.
const MAX_DAYS = 14;

function parseInput(body: unknown) {
  const { businessId, startDate, days = 1 } = (body ?? {}) as {
    businessId?: string;
    startDate?: string;
    days?: number;
  };
  const clampedDays = Math.min(Math.max(1, Number(days) || 1), MAX_DAYS);
  const parsedStartDate = startDate ? new Date(startDate) : new Date();
  parsedStartDate.setHours(0, 0, 0, 0);
  return { businessId, startDate: parsedStartDate, days: clampedDays };
}

// GET: reine Vorschau des Plans, ruft KEINE Claude-API auf, kostet nichts.
// Nützlich um vorher zu sehen, was generiert würde.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  const startDateParam = searchParams.get("startDate");
  const daysParam = searchParams.get("days");

  if (!businessId) {
    return NextResponse.json({ error: "businessId ist erforderlich." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
    return NextResponse.json({ error: "Business nicht gefunden." }, { status: 404 });
  }

  const { startDate, days } = parseInput({
    businessId,
    startDate: startDateParam ?? undefined,
    days: daysParam ? Number(daysParam) : undefined,
  });

  const plan = buildCalendarPlan(startDate, days, business);
  const summary = plan.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    totalItems: plan.length,
    summary,
    plan: plan.map((item) => ({
      type: item.type,
      date: item.date.toISOString().slice(0, 10),
      options: item.options,
    })),
  });
}

// POST: generiert den Plan wirklich (ruft Claude für jedes Item auf, sequentiell,
// um Rate-Limits zu vermeiden). Kann je nach Zeitraum mehrere Minuten dauern.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, startDate, days } = parseInput(body);

    if (!businessId) {
      return NextResponse.json({ error: "businessId ist erforderlich." }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ error: "Business nicht gefunden." }, { status: 404 });
    }

    const plan = buildCalendarPlan(startDate, days, business);

    const results: { type: string; date: string; id?: string; error?: string }[] = [];

    for (const item of plan) {
      try {
        const contentItem = await generateContentItem({
          businessId,
          type: item.type,
          options: item.options,
          scheduledDate: item.date,
        });
        results.push({
          type: item.type,
          date: item.date.toISOString().slice(0, 10),
          id: contentItem.id,
        });
      } catch (err) {
        results.push({
          type: item.type,
          date: item.date.toISOString().slice(0, 10),
          error: err instanceof Error ? err.message : "Unbekannter Fehler",
        });
      }
    }

    const created = results.filter((r) => r.id).length;
    const failed = results.filter((r) => r.error).length;

    return NextResponse.json({ created, failed, results });
  } catch (error) {
    console.error("Fehler bei der Kalender-Generierung:", error);
    return NextResponse.json(
      { error: "Interner Fehler bei der Kalender-Generierung." },
      { status: 500 }
    );
  }
}
