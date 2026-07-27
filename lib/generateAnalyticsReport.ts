import { PrismaClient, ReportPeriod, Review, PostLog, ContentItem, SocialConnection } from "@prisma/client";
import { generateText } from "@/lib/claude";
import { fetchFacebookPostInsights, fetchInstagramMediaInsights } from "@/lib/insights";

const prisma = new PrismaClient();

type PostLogWithRelations = PostLog & { contentItem: ContentItem; socialConnection: SocialConnection };

function getPeriodRange(periodType: "weekly" | "monthly"): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  if (periodType === "weekly") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setMonth(start.getMonth() - 1);
  }
  return { start, end };
}

// Lädt für jeden im Zeitraum erfolgreich veröffentlichten Post (Facebook/Instagram) die
// aktuellen Kennzahlen nach. Best effort: ein einzelner Fehler (z.B. Token abgelaufen)
// darf den restlichen Bericht nicht verhindern.
async function refreshInsights(postLogs: PostLogWithRelations[]): Promise<void> {
  for (const log of postLogs) {
    if (!log.externalPostId) continue;
    try {
      let insights = null;
      if (log.socialConnection.platform === "facebook") {
        insights = await fetchFacebookPostInsights(log.externalPostId, log.socialConnection.accessToken);
      } else if (log.socialConnection.platform === "instagram") {
        insights = await fetchInstagramMediaInsights(log.externalPostId, log.socialConnection.accessToken);
      }
      if (insights) {
        await prisma.postLog.update({
          where: { id: log.id },
          data: { ...insights, insightsFetchedAt: new Date() },
        });
      }
    } catch (error) {
      console.error(`Insights für PostLog ${log.id} konnten nicht geladen werden:`, error);
    }
  }
}

function buildReportPrompt(
  businessName: string,
  businessAddress: string,
  periodType: "weekly" | "monthly",
  metrics: Record<string, unknown>,
  reviews: Review[]
): string {
  const periodLabel = periodType === "weekly" ? "Wochenbericht" : "Monatsbericht";
  const reviewLines =
    reviews
      .map((r) => `- ${r.rating}/5 Sterne (${r.platform}): "${r.reviewText}"`)
      .join("\n") || "Keine neuen Bewertungen in diesem Zeitraum.";

  return `Du bist eine erfahrene Social-Media- und Marketing-Analystin einer Agentur, die für ${businessName} (${businessAddress}) einen professionellen ${periodLabel} schreibt - genau in der Qualität, die ein bezahlter Marketing-Dienstleister für einen zahlenden Kunden liefern würde.

Echte Rohdaten aus diesem Zeitraum (JSON):
${JSON.stringify(metrics, null, 2)}

Neue Kundenbewertungen in diesem Zeitraum:
${reviewLines}

Schreib einen strukturierten Bericht auf Deutsch mit genau diesen Abschnitten:
1. Kurzfassung (3-4 Sätze, die wichtigsten Erkenntnisse)
2. Performance-Übersicht (was lief gut, was schlecht - beziehe dich konkret auf die Zahlen oben)
3. Content-Empfehlungen für die nächste Periode (konkret und umsetzbar, kein generisches Marketing-Blabla)
4. SEO & lokale Sichtbarkeit: 5-8 konkrete Keyword-/Themenvorschläge rund um Pizzeria/italienisches Essen in und um Ulm, die sich für die nächsten Beiträge eignen, inkl. kurzer Begründung warum

Wichtig: Wenn Kennzahlen fehlen, 0 sind oder es noch keine Vergleichsdaten aus der Vorperiode gibt, sag das ehrlich, statt es zu beschönigen oder Zahlen zu erfinden.`;
}

export async function generateAnalyticsReport(periodType: "weekly" | "monthly") {
  const { start, end } = getPeriodRange(periodType);

  const postLogs = (await prisma.postLog.findMany({
    where: { status: "success", postedAt: { gte: start, lte: end } },
    include: { contentItem: true, socialConnection: true },
  })) as PostLogWithRelations[];

  await refreshInsights(postLogs);

  const refreshedLogs = (await prisma.postLog.findMany({
    where: { id: { in: postLogs.map((l) => l.id) } },
    include: { contentItem: true, socialConnection: true },
  })) as PostLogWithRelations[];

  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
  const reviews = await prisma.review.findMany({ where: { createdAt: { gte: start, lte: end } } });
  const previousReviews = await prisma.review.findMany({
    where: { createdAt: { gte: previousStart, lt: start } },
  });

  const postsByPlatform: Record<string, number> = {};
  let totalReach = 0;
  let totalEngagement = 0;
  let topPost: PostLogWithRelations | null = null;
  let topPostScore = -1;

  for (const log of refreshedLogs) {
    const platform = log.socialConnection.platform;
    postsByPlatform[platform] = (postsByPlatform[platform] ?? 0) + 1;
    const engagement = (log.likeCount ?? 0) + (log.commentCount ?? 0) + (log.shareCount ?? 0);
    totalReach += log.reach ?? 0;
    totalEngagement += engagement;
    if (engagement > topPostScore) {
      topPostScore = engagement;
      topPost = log;
    }
  }

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  const avgRatingPrevious =
    previousReviews.length > 0
      ? previousReviews.reduce((sum, r) => sum + r.rating, 0) / previousReviews.length
      : null;

  const business = await prisma.business.findFirst();

  const metrics = {
    periodType,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    postsPublished: refreshedLogs.length,
    postsByPlatform,
    totalReach,
    totalEngagement,
    newReviews: reviews.length,
    newReviewsPrevious: previousReviews.length,
    avgRating,
    avgRatingPrevious,
    topPost: topPost
      ? {
          contentType: topPost.contentItem.type,
          platform: topPost.socialConnection.platform,
          engagement: topPostScore,
          reach: topPost.reach,
          excerpt: topPost.contentItem.contentText.slice(0, 140),
        }
      : null,
  };

  const summary = await generateText(
    buildReportPrompt(
      business?.name ?? "die Pizzeria",
      business?.address ?? "",
      periodType,
      metrics,
      reviews
    )
  );

  return prisma.analyticsReport.create({
    data: {
      periodType: periodType === "weekly" ? ReportPeriod.weekly : ReportPeriod.monthly,
      periodStart: start,
      periodEnd: end,
      metrics,
      summary,
    },
  });
}
