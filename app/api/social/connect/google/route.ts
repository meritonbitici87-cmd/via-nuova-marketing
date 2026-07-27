import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Startet den Google-Login-Dialog, um Zugriff auf das Via-Nuova Google-Unternehmensprofil
// zu bekommen. Einmalig aufrufen, sobald die Google-Business-Profile-API-Freigabe da ist.
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID ist nicht gesetzt." }, { status: 500 });
  }

  const baseUrl = process.env.SITE_URL || req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/social/connect/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage",
    access_type: "offline",
    // "consent" erzwingt, dass Google jedes Mal einen refresh_token mitschickt
    // (sonst nur beim allerersten Consent).
    prompt: "consent",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
