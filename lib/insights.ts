// Lädt echte Performance-Kennzahlen für bereits veröffentlichte Posts nach (Reichweite,
// Impressions, Likes, Kommentare, Shares). Wird vom Report-Generator genutzt, um die
// wöchentlichen/monatlichen Analysen mit echten Zahlen statt Schätzungen zu füttern.
//
// Für Google Business gibt es bewusst keine Post-Insights hier: Googles Local-Post-Insights-API
// ist wenig dokumentiert und ändert sich häufig. Der Report stützt sich für Google stattdessen
// auf Bewertungen + Anzahl veröffentlichter Beiträge, die zuverlässig verfügbar sind.

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

export interface PostInsights {
  reach: number | null;
  impressions: number | null;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
}

function findMetricValue(metrics: { name: string; values: { value: number }[] }[] | undefined, name: string) {
  const metric = metrics?.find((m) => m.name === name);
  return metric?.values?.[0]?.value ?? null;
}

export async function fetchFacebookPostInsights(
  postId: string,
  accessToken: string
): Promise<PostInsights> {
  const res = await fetch(
    `${GRAPH_API_BASE}/${postId}?fields=shares,likes.summary(true),comments.summary(true),insights.metric(post_impressions,post_impressions_unique)&access_token=${accessToken}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message ?? "Facebook-Insights konnten nicht geladen werden.");
  }

  return {
    likeCount: data.likes?.summary?.total_count ?? null,
    commentCount: data.comments?.summary?.total_count ?? null,
    shareCount: data.shares?.count ?? null,
    impressions: findMetricValue(data.insights?.data, "post_impressions"),
    reach: findMetricValue(data.insights?.data, "post_impressions_unique"),
  };
}

export async function fetchInstagramMediaInsights(
  mediaId: string,
  accessToken: string
): Promise<PostInsights> {
  const res = await fetch(
    `${GRAPH_API_BASE}/${mediaId}/insights?metric=impressions,reach,likes,comments,saved&access_token=${accessToken}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message ?? "Instagram-Insights konnten nicht geladen werden.");
  }

  return {
    impressions: findMetricValue(data.data, "impressions"),
    reach: findMetricValue(data.data, "reach"),
    likeCount: findMetricValue(data.data, "likes"),
    commentCount: findMetricValue(data.data, "comments"),
    shareCount: null,
  };
}
