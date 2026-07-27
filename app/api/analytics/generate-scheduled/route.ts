import { NextRequest, NextResponse } from "next/server";
import { generateAnalyticsReport } from "@/lib/generateAnalyticsReport";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

// Für Vercel Cron gedacht (siehe vercel.json): ?period=weekly einmal pro Woche,
// ?period=monthly einmal pro Monat. Per CRON_SECRET geschützt, genau wie
// /api/social/publish-scheduled.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get("period");
  if (period !== "weekly" && period !== "monthly") {
    return NextResponse.json({ error: '?period muss "weekly" oder "monthly" sein.' }, { status: 400 });
  }

  try {
    const report = await generateAnalyticsReport(period);
    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim geplanten Analytics-Bericht:", error);
    return NextResponse.json({ error: `Interner Fehler: ${message}` }, { status: 500 });
  }
}
