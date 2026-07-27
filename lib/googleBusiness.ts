// Postet über die Google Business Profile API ("Local Post") auf das Via-Nuova
// Google-Unternehmensprofil. Google Access-Tokens sind nur 1 Stunde gültig, deshalb
// wird hier bei jedem Aufruf über den gespeicherten refreshToken ein frischer
// Access-Token geholt.

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_BUSINESS_API_BASE = "https://mybusiness.googleapis.com/v4";

async function getFreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET sind nicht gesetzt.");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google Access-Token-Refresh fehlgeschlagen: ${data.error_description ?? res.statusText}`);
  }
  return data.access_token;
}

export async function postToGoogleBusiness(params: {
  accountId: string;
  locationId: string;
  refreshToken: string;
  summary: string;
  imageUrl?: string;
}): Promise<{ postName: string }> {
  const { accountId, locationId, refreshToken, summary, imageUrl } = params;

  try {
    const accessToken = await getFreshAccessToken(refreshToken);

    const body: Record<string, unknown> = {
      languageCode: "de",
      summary,
      topicType: "STANDARD",
    };
    if (imageUrl) {
      body.media = [{ mediaFormat: "PHOTO", sourceUrl: imageUrl }];
    }

    const res = await fetch(
      `${GOOGLE_BUSINESS_API_BASE}/accounts/${accountId}/locations/${locationId}/localPosts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message ?? res.statusText);
    }
    return { postName: data.name };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
    throw new Error(`Google-Business-Post fehlgeschlagen: ${detail}`);
  }
}
