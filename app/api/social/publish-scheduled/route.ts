import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { publishContentItem, POSTABLE_CONTENT_TYPES } from "@/lib/socialPosting";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Für Vercel Cron gedacht (siehe vercel.json). Postet alle freigegebenen Content-Items,
// deren geplantes Datum erreicht ist. Per CRON_SECRET geschützt, damit nicht irgendwer
// über die öffentliche URL beliebig Beiträge auslösen kann.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const dueItems = await prisma.contentItem.findMany({
    where: {
      status: "approved",
      type: { in: POSTABLE_CONTENT_TYPES },
      scheduledDate: { lte: new Date() },
    },
  });

  const results = [];
  for (const item of dueItems) {
    const result = await publishContentItem(item.id);
    results.push({
      contentItemId: item.id,
      type: item.type,
      ok: result.ok,
      error: result.ok ? undefined : result.error,
    });
  }

  return NextResponse.json({ processed: results.length, results });
}
