// Postet über die Meta Graph API auf die Via-Nuova Facebook-Page und den
// verknüpften Instagram-Business-Account. Braucht pro Aufruf die Page-/IG-User-ID
// und einen (long-lived) Access-Token aus der SocialConnection-Tabelle.

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface GraphErrorBody {
  error?: { message?: string };
}

async function graphFetch(path: string, body: Record<string, string>) {
  const res = await fetch(`${GRAPH_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = (data as GraphErrorBody).error?.message ?? res.statusText;
    throw new Error(message);
  }
  return data;
}

export async function postToFacebookPage(params: {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrl?: string;
  videoUrl?: string;
}): Promise<{ postId: string }> {
  const { pageId, accessToken, message, imageUrl, videoUrl } = params;

  try {
    if (videoUrl) {
      const data = await graphFetch(`/${pageId}/videos`, {
        file_url: videoUrl,
        description: message,
        access_token: accessToken,
      });
      return { postId: data.id };
    }

    if (imageUrl) {
      const data = await graphFetch(`/${pageId}/photos`, {
        url: imageUrl,
        caption: message,
        access_token: accessToken,
      });
      return { postId: data.post_id ?? data.id };
    }

    const data = await graphFetch(`/${pageId}/feed`, {
      message,
      access_token: accessToken,
    });
    return { postId: data.id };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
    throw new Error(`Facebook-Post fehlgeschlagen: ${detail}`);
  }
}

export async function postToInstagram(params: {
  igUserId: string;
  accessToken: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
}): Promise<{ postId: string }> {
  const { igUserId, accessToken, caption, imageUrl, videoUrl } = params;

  if (!imageUrl && !videoUrl) {
    throw new Error("Instagram-Posts benötigen zwingend ein Bild oder Video.");
  }

  try {
    const containerParams: Record<string, string> = { caption, access_token: accessToken };
    if (videoUrl) {
      containerParams.media_type = "REELS";
      containerParams.video_url = videoUrl;
    } else if (imageUrl) {
      containerParams.image_url = imageUrl;
    }

    const container = await graphFetch(`/${igUserId}/media`, containerParams);
    const creationId: string = container.id;

    if (videoUrl) {
      await waitForInstagramContainerReady(creationId, accessToken);
    }

    const published = await graphFetch(`/${igUserId}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });
    return { postId: published.id };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unbekannter Fehler";
    throw new Error(`Instagram-Post fehlgeschlagen: ${detail}`);
  }
}

// Instagram braucht bei Videos (Reels) etwas Zeit, um den Media-Container zu verarbeiten,
// bevor er veröffentlicht werden kann. Fragt den Status in Intervallen ab.
async function waitForInstagramContainerReady(
  creationId: string,
  accessToken: string,
  maxAttempts = 10
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(
      `${GRAPH_API_BASE}/${creationId}?fields=status_code&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error("Instagram Video-Verarbeitung fehlgeschlagen.");
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error("Instagram Video-Verarbeitung hat zu lange gedauert (Timeout).");
}

// Tauscht einen kurzlebigen Facebook-User-Access-Token (aus dem Login-Dialog)
// gegen einen long-lived Token (~60 Tage) um. Wird einmalig beim Verbinden gebraucht.
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresInSeconds: number;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID / META_APP_SECRET sind nicht gesetzt.");
  }

  const url =
    `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token` +
    `&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token-Umtausch fehlgeschlagen: ${data.error?.message ?? res.statusText}`);
  }
  return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
}
