import { NextRequest } from "next/server";

// Prüft den CRON_SECRET entweder im von Vercel Cron automatisch gesetzten
// "Authorization: Bearer <secret>"-Header oder (für manuelle Aufrufe/Tests)
// als "x-cron-secret"-Header bzw. "?secret="-Query-Parameter.
export function isAuthorizedCronRequest(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const provided = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  return provided === cronSecret;
}
