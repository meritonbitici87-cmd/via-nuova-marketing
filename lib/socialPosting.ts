import { PrismaClient, PostLog, ContentType } from "@prisma/client";
import { postToFacebookPage, postToInstagram } from "@/lib/meta";
import { postToGoogleBusiness } from "@/lib/googleBusiness";

const prisma = new PrismaClient();

// ContentType -> SocialPlatform. Nur diese drei Content-Typen werden direkt auf
// eine Social-Media-Plattform gepostet, alle anderen (Blog, Newsletter, ...) sind
// für andere Kanäle bestimmt und können hier nicht gepostet werden.
const PLATFORM_BY_CONTENT_TYPE: Record<string, "facebook" | "instagram" | "google_business"> = {
  facebook: "facebook",
  instagram: "instagram",
  google_business: "google_business",
};

export const POSTABLE_CONTENT_TYPES: ContentType[] = [
  ContentType.facebook,
  ContentType.instagram,
  ContentType.google_business,
];

// Baut aus einem relativen Pfad (z.B. "/generated-images/xyz.png") eine öffentlich
// erreichbare absolute URL, da Meta/Google die Datei von ihren Servern aus abrufen.
function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "SITE_URL ist nicht gesetzt. Wird gebraucht, um Bild-/Video-URLs für Meta/Google öffentlich erreichbar zu machen."
    );
  }
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

type PublishResult =
  | { ok: true; postLog: PostLog }
  | { ok: false; status: number; error: string; postLog: PostLog | null };

// Veröffentlicht ein einzelnes ContentItem auf der zu seinem Typ passenden Plattform
// und protokolliert das Ergebnis (Erfolg oder Fehler) als PostLog. Wird sowohl vom
// manuellen "Jetzt posten"-Button als auch vom täglichen Auto-Posting-Job genutzt.
export async function publishContentItem(contentItemId: string): Promise<PublishResult> {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: { mediaAssets: true, images: true },
  });
  if (!contentItem) {
    return { ok: false, status: 404, error: "Content-Item nicht gefunden.", postLog: null };
  }

  const platform = PLATFORM_BY_CONTENT_TYPE[contentItem.type];
  if (!platform) {
    return {
      ok: false,
      status: 400,
      error: `Content-Typ "${contentItem.type}" kann nicht direkt gepostet werden.`,
      postLog: null,
    };
  }

  const connection = await prisma.socialConnection.findUnique({ where: { platform } });
  if (!connection || !connection.isActive) {
    return {
      ok: false,
      status: 400,
      error: `Keine aktive Verbindung für "${platform}" hinterlegt.`,
      postLog: null,
    };
  }

  // Bevorzugt ein echtes Foto/Video (MediaAsset), sonst ein KI-generiertes Bild.
  const media = contentItem.mediaAssets[0];
  const generatedImage = contentItem.images[0];

  let imageUrl: string | undefined;
  let videoUrl: string | undefined;
  if (media) {
    if (media.type === "video") videoUrl = toAbsoluteUrl(media.url);
    else imageUrl = toAbsoluteUrl(media.url);
  } else if (generatedImage) {
    imageUrl = toAbsoluteUrl(generatedImage.imagePath);
  }

  try {
    let externalPostId: string;
    if (platform === "facebook") {
      const result = await postToFacebookPage({
        pageId: connection.accountId,
        accessToken: connection.accessToken,
        message: contentItem.contentText,
        imageUrl,
        videoUrl,
      });
      externalPostId = result.postId;
    } else if (platform === "instagram") {
      const result = await postToInstagram({
        igUserId: connection.accountId,
        accessToken: connection.accessToken,
        caption: contentItem.contentText,
        imageUrl,
        videoUrl,
      });
      externalPostId = result.postId;
    } else {
      if (!connection.locationId) {
        throw new Error("Für Google Business ist keine locationId hinterlegt.");
      }
      if (!connection.refreshToken) {
        throw new Error("Für Google Business ist kein refreshToken hinterlegt.");
      }
      const result = await postToGoogleBusiness({
        accountId: connection.accountId,
        locationId: connection.locationId,
        refreshToken: connection.refreshToken,
        summary: contentItem.contentText,
        imageUrl,
      });
      externalPostId = result.postName;
    }

    const postLog = await prisma.postLog.create({
      data: {
        contentItemId: contentItem.id,
        socialConnectionId: connection.id,
        externalPostId,
        status: "success",
        postedAt: new Date(),
      },
    });
    await prisma.contentItem.update({
      where: { id: contentItem.id },
      data: { status: "posted" },
    });

    return { ok: true, postLog };
  } catch (postError) {
    const message = postError instanceof Error ? postError.message : "Unbekannter Fehler";
    const postLog = await prisma.postLog.create({
      data: {
        contentItemId: contentItem.id,
        socialConnectionId: connection.id,
        status: "failed",
        errorMessage: message,
      },
    });
    return { ok: false, status: 502, error: message, postLog };
  }
}
