import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { exchangeForLongLivedToken } from "@/lib/meta";

const prisma = new PrismaClient();
const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string; username: string };
}

// Callback des Facebook-Login-Dialogs: tauscht den Code gegen einen Access-Token,
// verlängert ihn, findet die richtige Page + verknüpften Instagram-Account und
// speichert beides als SocialConnection.
export async function GET(req: NextRequest) {
  const dashboardUrl = new URL("/dashboard", process.env.SITE_URL || req.nextUrl.origin);

  const errorParam = req.nextUrl.searchParams.get("error_description") || req.nextUrl.searchParams.get("error");
  if (errorParam) {
    dashboardUrl.searchParams.set("connect_error", errorParam);
    return NextResponse.redirect(dashboardUrl);
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    dashboardUrl.searchParams.set("connect_error", "Kein Code von Facebook erhalten.");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error("META_APP_ID / META_APP_SECRET sind nicht gesetzt.");
    }

    const baseUrl = process.env.SITE_URL || req.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/social/connect/facebook/callback`;

    const tokenRes = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error?.message ?? "Code-Umtausch fehlgeschlagen.");
    }

    const { accessToken: longLivedUserToken } = await exchangeForLongLivedToken(tokenData.access_token);

    const pagesRes = await fetch(
      `${GRAPH_API_BASE}/me/accounts?fields=name,access_token,instagram_business_account{id,username}&access_token=${longLivedUserToken}`
    );
    const pagesData = await pagesRes.json();
    if (!pagesRes.ok) {
      throw new Error(pagesData.error?.message ?? "Konnte Facebook-Pages nicht laden.");
    }
    const pages: FacebookPage[] = pagesData.data ?? [];
    if (pages.length === 0) {
      throw new Error("Keine Facebook-Page gefunden, für die du Admin bist.");
    }

    const business = await prisma.business.findFirst();
    const targetName = (business?.name ?? "Via Nuova").toLowerCase();
    const page = pages.find((p) => p.name.toLowerCase() === targetName) ?? pages[0];

    await prisma.socialConnection.upsert({
      where: { platform: "facebook" },
      create: {
        platform: "facebook",
        accountId: page.id,
        accountName: page.name,
        accessToken: page.access_token,
      },
      update: {
        accountId: page.id,
        accountName: page.name,
        accessToken: page.access_token,
        isActive: true,
      },
    });

    if (page.instagram_business_account) {
      await prisma.socialConnection.upsert({
        where: { platform: "instagram" },
        create: {
          platform: "instagram",
          accountId: page.instagram_business_account.id,
          accountName: page.instagram_business_account.username,
          accessToken: page.access_token,
        },
        update: {
          accountId: page.instagram_business_account.id,
          accountName: page.instagram_business_account.username,
          accessToken: page.access_token,
          isActive: true,
        },
      });
    }

    dashboardUrl.searchParams.set(
      "connected",
      page.instagram_business_account ? "facebook,instagram" : "facebook"
    );
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Facebook-Connect:", error);
    dashboardUrl.searchParams.set("connect_error", message);
    return NextResponse.redirect(dashboardUrl);
  }
}
