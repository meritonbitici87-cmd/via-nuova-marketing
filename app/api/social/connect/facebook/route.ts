import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Startet den Facebook-Login-Dialog, um Zugriff auf die Via-Nuova-Page (und die
// verknüpfte Instagram-Seite) zu bekommen. Einmalig aufrufen (im Browser öffnen),
// sobald die Meta Developer App fertig eingerichtet ist.
const SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export async function GET(req: NextRequest) {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "META_APP_ID ist nicht gesetzt." }, { status: 500 });
  }

  const baseUrl = process.env.SITE_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/social/connect/facebook/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: "code",
  });

  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
}
