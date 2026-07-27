import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Callback des Google-Login-Dialogs: tauscht den Code gegen Access-/Refresh-Token,
// findet das Business-Konto + die Filiale (Location) und speichert alles als
// SocialConnection.
export async function GET(req: NextRequest) {
  const dashboardUrl = new URL("/dashboard", process.env.SITE_URL || req.nextUrl.origin);

  const errorParam = req.nextUrl.searchParams.get("error");
  if (errorParam) {
    dashboardUrl.searchParams.set("connect_error", errorParam);
    return NextResponse.redirect(dashboardUrl);
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    dashboardUrl.searchParams.set("connect_error", "Kein Code von Google erhalten.");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET sind nicht gesetzt.");
    }

    const baseUrl = process.env.SITE_URL || req.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/social/connect/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description ?? "Code-Umtausch fehlgeschlagen.");
    }
    const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = tokenData;
    if (!refreshToken) {
      throw new Error(
        "Kein refresh_token erhalten. Bitte den Zugriff für diese App unter myaccount.google.com/permissions entfernen und den Connect-Vorgang erneut starten."
      );
    }

    const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accountsData = await accountsRes.json();
    if (!accountsRes.ok) {
      throw new Error(accountsData.error?.message ?? "Konnte Google-Business-Konten nicht laden.");
    }
    const account = accountsData.accounts?.[0];
    if (!account) {
      throw new Error("Kein Google-Business-Konto gefunden.");
    }
    const accountId: string = account.name.split("/")[1];

    const locationsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const locationsData = await locationsRes.json();
    if (!locationsRes.ok) {
      throw new Error(locationsData.error?.message ?? "Konnte Google-Business-Filialen nicht laden.");
    }
    const location = locationsData.locations?.[0];
    if (!location) {
      throw new Error("Keine Google-Business-Filiale gefunden.");
    }
    const locationId: string = location.name.split("/")[1];

    await prisma.socialConnection.upsert({
      where: { platform: "google_business" },
      create: {
        platform: "google_business",
        accountId,
        locationId,
        accountName: location.title ?? "Via Nuova",
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      update: {
        accountId,
        locationId,
        accountName: location.title ?? "Via Nuova",
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        isActive: true,
      },
    });

    dashboardUrl.searchParams.set("connected", "google_business");
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Google-Business-Connect:", error);
    dashboardUrl.searchParams.set("connect_error", message);
    return NextResponse.redirect(dashboardUrl);
  }
}
