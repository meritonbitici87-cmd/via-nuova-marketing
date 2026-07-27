import { NextRequest, NextResponse } from "next/server";
import { generateAnalyticsReport } from "@/lib/generateAnalyticsReport";

// Für einen Scheduler gedacht (Windows-Taskplaner + curl, Vercel Cron, ...):
// ?period=weekly einmal pro Woche, ?period=monthly einmal pro Monat aufrufen.
// Per CRON_SECRET geschützt, genau wie /api/social/publish-scheduled.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
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
