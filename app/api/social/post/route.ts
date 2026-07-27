import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { publishContentItem } from "@/lib/socialPosting";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { contentItemId } = await req.json();
    if (!contentItemId) {
      return NextResponse.json({ error: "contentItemId ist erforderlich." }, { status: 400 });
    }

    const result = await publishContentItem(contentItemId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, postLog: result.postLog }, { status: result.status });
    }
    return NextResponse.json({ postLog: result.postLog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Social-Media-Posting:", error);
    return NextResponse.json({ error: `Interner Fehler: ${message}` }, { status: 500 });
  }
}

// GET: Liste der letzten Posting-Versuche (neueste zuerst), z.B. für eine
// Status-Übersicht im Dashboard.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentItemId = searchParams.get("contentItemId");

  const postLogs = await prisma.postLog.findMany({
    where: contentItemId ? { contentItemId } : undefined,
    include: { socialConnection: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ postLogs });
}
