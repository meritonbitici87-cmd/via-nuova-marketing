"use client";

import { useEffect, useMemo, useState } from "react";

interface Business {
  id: string;
  name: string;
  address: string;
  specialties: string[];
  toneOfVoice: string;
}

interface ContentItem {
  id: string;
  type: string;
  status: "draft" | "approved" | "posted";
  contentText: string;
  scheduledDate: string | null;
  customerId: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  lastVisit: string | null;
  notes: string | null;
  createdAt: string;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  imagePath: string;
  createdAt: string;
}

interface MediaAsset {
  id: string;
  type: "photo" | "video";
  url: string;
  description: string | null;
  used: boolean;
  contentItemId: string | null;
  createdAt: string;
}

interface SocialConnection {
  id: string;
  platform: "facebook" | "instagram" | "google_business";
  accountId: string;
  accountName: string | null;
  isActive: boolean;
  tokenExpiresAt: string | null;
  updatedAt: string;
}

interface AnalyticsReport {
  id: string;
  periodType: "weekly" | "monthly";
  periodStart: string;
  periodEnd: string;
  metrics: {
    postsPublished: number;
    postsByPlatform: Record<string, number>;
    totalReach: number;
    totalEngagement: number;
    newReviews: number;
    avgRating: number | null;
    avgRatingPrevious: number | null;
    topPost: {
      contentType: string;
      platform: string;
      engagement: number;
      reach: number | null;
      excerpt: string;
    } | null;
  };
  summary: string;
  createdAt: string;
}

interface Review {
  id: string;
  platform: "google" | "facebook";
  rating: number;
  reviewText: string;
  reviewerName: string | null;
  replyText: string | null;
  replyStatus: "pending" | "approved" | "posted";
  createdAt: string;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google_business: "Google Business",
  blog: "Blog",
  review_reply: "Bewertungsantwort",
  story: "Story",
  reel_script: "Reel-Skript",
  tiktok_script: "TikTok-Skript",
  newsletter: "Newsletter",
  ad_copy: "Werbetext",
  menu_description: "Speisekartenbeschreibung",
  offer: "Angebot",
  seasonal_campaign: "Saisonale Kampagne",
  holiday_promo: "Feiertagsaktion",
  faq: "FAQ",
  customer_birthday: "Geburtstagsnachricht",
  customer_winback: "Rückgewinnungsnachricht",
  photo_shoot_guide: "Foto-Shooting-Leitfaden",
};

const STATUS_LABELS: Record<ContentItem["status"], string> = {
  draft: "Entwurf",
  approved: "Freigegeben",
  posted: "Gepostet",
};

const STATUS_BADGE_CLASSES: Record<ContentItem["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  posted: "bg-green-100 text-green-800",
};

const REPLY_STATUS_LABELS: Record<Review["replyStatus"], string> = {
  pending: "Ausstehend",
  approved: "Freigegeben",
  posted: "Gepostet",
};

const REPLY_STATUS_BADGE_CLASSES: Record<Review["replyStatus"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  posted: "bg-green-100 text-green-800",
};

const PLATFORM_LABELS: Record<Review["platform"], string> = {
  google: "Google",
  facebook: "Facebook",
};

const TABS = [
  { key: "overview", label: "Übersicht" },
  { key: "content", label: "Content" },
  { key: "calendar", label: "Kalender" },
  { key: "reviews", label: "Bewertungen" },
  { key: "customers", label: "Kunden" },
  { key: "images", label: "Bilder" },
  { key: "media", label: "Medien" },
  { key: "seo", label: "SEO" },
  { key: "connections", label: "Verbindungen" },
  { key: "analytics", label: "Analyse" },
] as const;

const CONNECTION_PLATFORM_LABELS: Record<SocialConnection["platform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google_business: "Google Business",
};

type TabKey = (typeof TABS)[number]["key"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE");
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 text-sm">
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [business, setBusiness] = useState<Business | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [seoScriptTag, setSeoScriptTag] = useState<string>("");
  const [seoCopied, setSeoCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [generatingReplyId, setGeneratingReplyId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    platform: "google" as Review["platform"],
    rating: 5,
    reviewerName: "",
    reviewText: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    lastVisit: "",
    notes: "",
  });
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [generatingMessageFor, setGeneratingMessageFor] = useState<string | null>(null);

  const [imageDescription, setImageDescription] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaDescription, setMediaDescription] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [postingItemId, setPostingItemId] = useState<string | null>(null);
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});

  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [connectBanner, setConnectBanner] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [generatingReport, setGeneratingReport] = useState<"weekly" | "monthly" | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();

    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const connectError = params.get("connect_error");
    if (connected) {
      setConnectBanner({ type: "success", text: `Verbunden: ${connected}` });
      setActiveTab("connections");
    } else if (connectError) {
      setConnectBanner({ type: "error", text: connectError });
      setActiveTab("connections");
    }
    if (connected || connectError) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function fetchAll() {
    setLoading(true);
    const biz = await fetchBusiness();
    await Promise.all([
      fetchItems(),
      fetchReviews(),
      fetchCustomers(),
      fetchImages(),
      fetchMediaAssets(),
      fetchConnections(),
      fetchReports(),
      biz ? fetchSeoSchema(biz.id) : Promise.resolve(),
    ]);
    setLoading(false);
  }

  async function fetchBusiness(): Promise<Business | null> {
    const res = await fetch("/api/business");
    if (!res.ok) return null;
    const data = await res.json();
    setBusiness(data.business ?? null);
    return data.business ?? null;
  }

  async function fetchItems() {
    const res = await fetch("/api/content-items");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  async function fetchReviews() {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
  }

  async function fetchCustomers() {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data.customers ?? []);
  }

  async function fetchImages() {
    const res = await fetch("/api/generate-image");
    const data = await res.json();
    setImages(data.images ?? []);
  }

  async function fetchMediaAssets() {
    const res = await fetch("/api/media");
    const data = await res.json();
    setMediaAssets(data.mediaAssets ?? []);
  }

  async function fetchConnections() {
    const res = await fetch("/api/social/connections");
    const data = await res.json();
    setConnections(data.connections ?? []);
  }

  async function fetchReports() {
    const res = await fetch("/api/analytics/reports");
    const data = await res.json();
    setReports(data.reports ?? []);
  }

  async function generateReport(periodType: "weekly" | "monthly") {
    setGeneratingReport(periodType);
    setReportError(null);
    try {
      const res = await fetch("/api/analytics/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReportError(data.error ?? "Bericht konnte nicht erstellt werden.");
        return;
      }
      await fetchReports();
    } finally {
      setGeneratingReport(null);
    }
  }

  async function fetchSeoSchema(businessId: string) {
    const res = await fetch(`/api/seo-schema?businessId=${businessId}`);
    if (!res.ok) return;
    const data = await res.json();
    setSeoScriptTag(data.scriptTag ?? "");
  }

  async function updateContentStatus(id: string, status: ContentItem["status"]) {
    await fetch("/api/content-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchItems();
  }

  const POSTABLE_TYPES = ["facebook", "instagram", "google_business"];

  async function postContentItem(id: string) {
    setPostingItemId(id);
    setPostErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      const res = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentItemId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPostErrors((prev) => ({ ...prev, [id]: data.error ?? "Posten fehlgeschlagen." }));
        return;
      }
      await fetchItems();
    } finally {
      setPostingItemId(null);
    }
  }

  async function updateReviewStatus(id: string, replyStatus: Review["replyStatus"]) {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, replyStatus }),
    });
    fetchReviews();
  }

  async function generateReply(reviewId: string) {
    if (!business) return;
    setGeneratingReplyId(reviewId);
    try {
      await fetch("/api/generate-review-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, reviewId }),
      });
      await fetchReviews();
    } finally {
      setGeneratingReplyId(null);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      setReviewForm({ platform: "google", rating: 5, reviewerName: "", reviewText: "" });
      await fetchReviews();
    } finally {
      setSubmittingReview(false);
    }
  }

  async function submitCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!customerForm.name.trim()) return;
    setSubmittingCustomer(true);
    try {
      await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerForm),
      });
      setCustomerForm({ name: "", email: "", phone: "", birthday: "", lastVisit: "", notes: "" });
      await fetchCustomers();
    } finally {
      setSubmittingCustomer(false);
    }
  }

  async function deleteCustomer(id: string) {
    await fetch(`/api/customers?id=${id}`, { method: "DELETE" });
    await fetchCustomers();
  }

  async function generateCustomerMessage(
    customerId: string,
    type: "customer_birthday" | "customer_winback"
  ) {
    if (!business) return;
    const key = `${customerId}-${type}`;
    setGeneratingMessageFor(key);
    try {
      await fetch("/api/generate-customer-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, customerId, type }),
      });
      await fetchItems();
    } finally {
      setGeneratingMessageFor(null);
    }
  }

  async function submitImage(e: React.FormEvent) {
    e.preventDefault();
    if (!business || !imageDescription.trim()) return;
    setGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, description: imageDescription }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setImageError(data.error ?? "Bildgenerierung fehlgeschlagen.");
        return;
      }
      setImageDescription("");
      await fetchImages();
    } finally {
      setGeneratingImage(false);
    }
  }

  async function submitMediaUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!mediaFile) return;
    setUploadingMedia(true);
    setMediaError(null);
    try {
      const formData = new FormData();
      formData.append("file", mediaFile);
      if (mediaDescription.trim()) formData.append("description", mediaDescription.trim());

      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMediaError(data.error ?? "Upload fehlgeschlagen.");
        return;
      }
      setMediaFile(null);
      setMediaDescription("");
      const fileInput = document.getElementById("media-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await fetchMediaAssets();
    } finally {
      setUploadingMedia(false);
    }
  }

  async function toggleMediaUsed(asset: MediaAsset) {
    await fetch("/api/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: asset.id, used: !asset.used }),
    });
    await fetchMediaAssets();
  }

  async function deleteMediaAsset(id: string) {
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    await fetchMediaAssets();
  }

  function copySeoScript() {
    if (!seoScriptTag) return;
    navigator.clipboard.writeText(seoScriptTag);
    setSeoCopied(true);
    setTimeout(() => setSeoCopied(false), 2000);
  }

  const stats = useMemo(() => {
    const byStatus = { draft: 0, approved: 0, posted: 0 };
    const byType: Record<string, number> = {};
    for (const item of items) {
      byStatus[item.status]++;
      byType[item.type] = (byType[item.type] ?? 0) + 1;
    }
    const pendingReplies = reviews.filter((r) => r.replyStatus === "pending").length;
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "–";
    return { byStatus, byType, pendingReplies, avgRating };
  }, [items, reviews]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [items, typeFilter, statusFilter]);

  const calendarGroups = useMemo(() => {
    const scheduled = items.filter((item) => item.scheduledDate);
    const groups = new Map<string, ContentItem[]>();
    for (const item of scheduled) {
      const key = item.scheduledDate!.slice(0, 10);
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {business ? `${business.name} – Marketing-Dashboard` : "Marketing-Dashboard"}
        </h1>
        {business && <p className="text-sm text-gray-500">{business.address}</p>}
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p>Lädt...</p>}

      {!loading && activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Gesamt Content</p>
              <p className="text-2xl font-semibold">{items.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Entwürfe</p>
              <p className="text-2xl font-semibold text-yellow-700">{stats.byStatus.draft}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Freigegeben</p>
              <p className="text-2xl font-semibold text-blue-700">{stats.byStatus.approved}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Gepostet</p>
              <p className="text-2xl font-semibold text-green-700">{stats.byStatus.posted}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Bewertungen</p>
              <p className="text-2xl font-semibold">{reviews.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Antworten ausstehend</p>
              <p className="text-2xl font-semibold text-yellow-700">{stats.pendingReplies}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase">Ø Bewertung</p>
              <p className="text-2xl font-semibold">{stats.avgRating} ★</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-3">Content nach Typ</p>
            {Object.keys(stats.byType).length === 0 && (
              <p className="text-sm text-gray-500">Noch kein Content generiert.</p>
            )}
            <div className="space-y-1">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{CONTENT_TYPE_LABELS[type] ?? type}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === "content" && (
        <div>
          <div className="flex gap-3 mb-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="all">Alle Typen</option>
              {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="all">Alle Status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length === 0 && (
            <p className="text-gray-500">
              Kein Content gefunden. Rufe /api/generate-content oder /api/generate-calendar auf.
            </p>
          )}

          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium uppercase text-gray-500">
                      {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    {item.scheduledDate && (
                      <span className="text-xs text-gray-400">
                        · {formatDateShort(item.scheduledDate)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${STATUS_BADGE_CLASSES[item.status]}`}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm mb-3">{item.contentText}</p>
                {postErrors[item.id] && (
                  <p className="text-xs text-red-600 mb-2">Fehler: {postErrors[item.id]}</p>
                )}
                {item.status === "draft" && (
                  <button
                    onClick={() => updateContentStatus(item.id, "approved")}
                    className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700"
                  >
                    Freigeben
                  </button>
                )}
                {item.status === "approved" && POSTABLE_TYPES.includes(item.type) && (
                  <button
                    onClick={() => postContentItem(item.id)}
                    disabled={postingItemId === item.id}
                    className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {postingItemId === item.id ? "Wird gepostet..." : "Jetzt posten"}
                  </button>
                )}
                {item.status === "approved" && !POSTABLE_TYPES.includes(item.type) && (
                  <button
                    onClick={() => updateContentStatus(item.id, "posted")}
                    className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md hover:bg-gray-900"
                  >
                    Als gepostet markieren
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === "calendar" && (
        <div className="space-y-6">
          {calendarGroups.length === 0 && (
            <p className="text-gray-500">
              Noch keine geplanten Inhalte. Nutze /api/generate-calendar, um einen Zeitraum zu
              planen.
            </p>
          )}
          {calendarGroups.map(([dateKey, dayItems]) => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                {formatDate(dateKey)}
              </h2>
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase text-gray-500">
                          {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[item.status]}`}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{item.contentText}</p>
                    </div>
                    {item.status === "draft" && (
                      <button
                        onClick={() => updateContentStatus(item.id, "approved")}
                        className="shrink-0 bg-teal-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-teal-700"
                      >
                        Freigeben
                      </button>
                    )}
                    {item.status === "approved" && (
                      <button
                        onClick={() => updateContentStatus(item.id, "posted")}
                        className="shrink-0 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md hover:bg-gray-900"
                      >
                        Gepostet
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === "reviews" && (
        <div className="space-y-6">
          <form onSubmit={submitReview} className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Neue Bewertung erfassen</p>
            <p className="text-xs text-gray-500">
              Simuliert vorerst die automatische Übernahme von Google/Facebook-Bewertungen.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={reviewForm.platform}
                onChange={(e) =>
                  setReviewForm((f) => ({
                    ...f,
                    platform: e.target.value as Review["platform"],
                  }))
                }
                className="border rounded-md px-2 py-1.5 text-sm"
              >
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
              </select>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))
                }
                className="border rounded-md px-2 py-1.5 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Sterne
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Name (optional)"
              value={reviewForm.reviewerName}
              onChange={(e) => setReviewForm((f) => ({ ...f, reviewerName: e.target.value }))}
              className="border rounded-md px-2 py-1.5 text-sm w-full"
            />
            <textarea
              placeholder="Bewertungstext"
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm((f) => ({ ...f, reviewText: e.target.value }))}
              className="border rounded-md px-2 py-1.5 text-sm w-full"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {submittingReview ? "Speichert..." : "Bewertung hinzufügen"}
            </button>
          </form>

          {reviews.length === 0 && <p className="text-gray-500">Noch keine Bewertungen.</p>}

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {PLATFORM_LABELS[review.platform]}
                    </span>
                    <Stars rating={review.rating} />
                    {review.reviewerName && (
                      <span className="text-xs text-gray-400">· {review.reviewerName}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${REPLY_STATUS_BADGE_CLASSES[review.replyStatus]}`}
                  >
                    {REPLY_STATUS_LABELS[review.replyStatus]}
                  </span>
                </div>
                <p className="text-sm mb-3">{review.reviewText}</p>

                {review.replyText ? (
                  <div className="bg-gray-50 border rounded-md p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Antwort-Entwurf</p>
                    <p className="text-sm whitespace-pre-wrap">{review.replyText}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => generateReply(review.id)}
                    disabled={generatingReplyId === review.id}
                    className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50 mb-3"
                  >
                    {generatingReplyId === review.id ? "Generiert..." : "Antwort generieren"}
                  </button>
                )}

                {review.replyText && review.replyStatus === "pending" && (
                  <button
                    onClick={() => updateReviewStatus(review.id, "approved")}
                    className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700"
                  >
                    Freigeben
                  </button>
                )}
                {review.replyText && review.replyStatus === "approved" && (
                  <button
                    onClick={() => updateReviewStatus(review.id, "posted")}
                    className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md hover:bg-gray-900"
                  >
                    Als gepostet markieren
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === "customers" && (
        <div className="space-y-6">
          <form onSubmit={submitCustomer} className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Neuen Kunden erfassen</p>
            <p className="text-xs text-gray-500">
              Manuelle Kundenliste (keine Kassen-/POS-Anbindung) als Basis für persönliche
              Geburtstags- und Rückgewinnungsnachrichten.
            </p>
            <input
              type="text"
              placeholder="Name *"
              value={customerForm.name}
              onChange={(e) => setCustomerForm((f) => ({ ...f, name: e.target.value }))}
              className="border rounded-md px-2 py-1.5 text-sm w-full"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="E-Mail (optional)"
                value={customerForm.email}
                onChange={(e) => setCustomerForm((f) => ({ ...f, email: e.target.value }))}
                className="border rounded-md px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Telefon (optional)"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm((f) => ({ ...f, phone: e.target.value }))}
                className="border rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-gray-500">
                Geburtstag
                <input
                  type="date"
                  value={customerForm.birthday}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, birthday: e.target.value }))}
                  className="border rounded-md px-2 py-1.5 text-sm w-full mt-1"
                />
              </label>
              <label className="text-xs text-gray-500">
                Letzter Besuch
                <input
                  type="date"
                  value={customerForm.lastVisit}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, lastVisit: e.target.value }))}
                  className="border rounded-md px-2 py-1.5 text-sm w-full mt-1"
                />
              </label>
            </div>
            <textarea
              placeholder="Notizen (optional, z.B. Lieblingsgericht, Stammgast seit ...)"
              value={customerForm.notes}
              onChange={(e) => setCustomerForm((f) => ({ ...f, notes: e.target.value }))}
              className="border rounded-md px-2 py-1.5 text-sm w-full"
              rows={2}
            />
            <button
              type="submit"
              disabled={submittingCustomer}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {submittingCustomer ? "Speichert..." : "Kunde hinzufügen"}
            </button>
          </form>

          {customers.length === 0 && <p className="text-gray-500">Noch keine Kunden erfasst.</p>}

          <div className="space-y-4">
            {customers.map((customer) => {
              const messages = items.filter((i) => i.customerId === customer.id);
              const birthdayKey = `${customer.id}-customer_birthday`;
              const winbackKey = `${customer.id}-customer_winback`;
              return (
                <div key={customer.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-gray-500">
                        {[customer.email, customer.phone].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {customer.birthday &&
                          `Geburtstag: ${formatDateShort(customer.birthday)}`}
                        {customer.birthday && customer.lastVisit && " · "}
                        {customer.lastVisit &&
                          `Letzter Besuch: ${formatDateShort(customer.lastVisit)}`}
                      </p>
                      {customer.notes && (
                        <p className="text-xs text-gray-400 mt-1">{customer.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Löschen
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => generateCustomerMessage(customer.id, "customer_birthday")}
                      disabled={generatingMessageFor === birthdayKey}
                      className="bg-teal-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
                    >
                      {generatingMessageFor === birthdayKey
                        ? "Generiert..."
                        : "Geburtstagsnachricht generieren"}
                    </button>
                    <button
                      onClick={() => generateCustomerMessage(customer.id, "customer_winback")}
                      disabled={generatingMessageFor === winbackKey}
                      className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md hover:bg-gray-900 disabled:opacity-50"
                    >
                      {generatingMessageFor === winbackKey
                        ? "Generiert..."
                        : "Rückgewinnungsnachricht generieren"}
                    </button>
                  </div>

                  {messages.length > 0 && (
                    <div className="space-y-2">
                      {messages.map((m) => (
                        <div key={m.id} className="bg-gray-50 border rounded-md p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            {CONTENT_TYPE_LABELS[m.type] ?? m.type}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{m.contentText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && activeTab === "images" && (
        <div className="space-y-6">
          <form onSubmit={submitImage} className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Neues Bild generieren</p>
            <p className="text-xs text-gray-500">
              Beschreibe ein Gericht oder Motiv (z.B. "Pizza Margherita mit frischem Basilikum").
              Die KI ergänzt automatisch professionellen Food-Fotografie-Stil.
            </p>
            <textarea
              placeholder="Beschreibung des Motivs"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm w-full"
              rows={2}
              required
            />
            {imageError && <p className="text-xs text-red-600">{imageError}</p>}
            <button
              type="submit"
              disabled={generatingImage}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {generatingImage ? "Generiert... (kann 10-20 Sek. dauern)" : "Bild generieren"}
            </button>
          </form>

          {images.length === 0 && <p className="text-gray-500">Noch keine Bilder generiert.</p>}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.imagePath} alt={image.prompt} className="w-full aspect-square object-cover" />
                <p className="text-xs text-gray-500 p-2 truncate" title={image.prompt}>
                  {image.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === "media" && (
        <div className="space-y-6">
          <form onSubmit={submitMediaUpload} className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Echtes Foto/Video hochladen</p>
            <p className="text-xs text-gray-500">
              Lade hier deine mit dem Handy aufgenommenen Fotos/Videos hoch (z.B. aus einem
              Foto-Shooting nach dem Foto-Shooting-Leitfaden). Diese echten Aufnahmen sind getrennt
              von den KI-generierten Bildern im "Bilder"-Reiter.
            </p>
            <input
              id="media-file-input"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
              className="text-sm w-full"
              required
            />
            <textarea
              placeholder="Beschreibung/Motiv (optional, z.B. 'Pizza aus dem Ofen, Dampf sichtbar')"
              value={mediaDescription}
              onChange={(e) => setMediaDescription(e.target.value)}
              className="border rounded-md px-2 py-1.5 text-sm w-full"
              rows={2}
            />
            {mediaError && <p className="text-xs text-red-600">{mediaError}</p>}
            <button
              type="submit"
              disabled={uploadingMedia || !mediaFile}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {uploadingMedia ? "Lädt hoch..." : "Hochladen"}
            </button>
          </form>

          {mediaAssets.length === 0 && (
            <p className="text-gray-500">Noch keine echten Fotos/Videos hochgeladen.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mediaAssets.map((asset) => (
              <div key={asset.id} className="border rounded-lg overflow-hidden">
                {asset.type === "video" ? (
                  <video src={asset.url} controls className="w-full aspect-square object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.description ?? "Foto"}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="p-2 space-y-1">
                  {asset.description && (
                    <p className="text-xs text-gray-600 truncate" title={asset.description}>
                      {asset.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleMediaUsed(asset)}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        asset.used
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {asset.used ? "Verwendet" : "Noch nicht verwendet"}
                    </button>
                    <button
                      onClick={() => deleteMediaAsset(asset.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === "seo" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Schema.org / JSON-LD für die Website</p>
            <p className="text-xs text-gray-500 mb-3">
              Dieser Code kann 1:1 in den <code>&lt;head&gt;</code>-Bereich der eigentlichen
              Via-Nuova-Website eingefügt werden, damit Google Business-Infos und Bewertungen
              korrekt in der Suche anzeigen kann. Basiert nur auf echten, gespeicherten Daten
              (Name, Adresse, Bewertungen) – nichts wird erfunden.
            </p>
            <button
              onClick={copySeoScript}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 mb-3"
            >
              {seoCopied ? "Kopiert!" : "In Zwischenablage kopieren"}
            </button>
            <pre className="bg-gray-50 border rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap">
              {seoScriptTag || "Lädt..."}
            </pre>
          </div>
        </div>
      )}

      {!loading && activeTab === "connections" && (
        <div className="space-y-4">
          {connectBanner && (
            <div
              className={`text-sm px-3 py-2 rounded-md ${
                connectBanner.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {connectBanner.type === "success"
                ? `Erfolgreich verbunden: ${connectBanner.text.replace("Verbunden: ", "")}`
                : `Fehler beim Verbinden: ${connectBanner.text}`}
            </div>
          )}

          <p className="text-sm text-gray-500">
            Hier werden die echten Zugriffstoken für Facebook, Instagram und Google Business
            hinterlegt, damit freigegebener Content automatisch gepostet werden kann.
          </p>

          <div className="space-y-3">
            {(["facebook", "instagram", "google_business"] as const).map((platform) => {
              const connection = connections.find((c) => c.platform === platform);
              return (
                <div key={platform} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{CONNECTION_PLATFORM_LABELS[platform]}</p>
                    {connection ? (
                      <p className="text-xs text-gray-500">
                        {connection.accountName ?? connection.accountId} · verbunden am{" "}
                        {formatDateShort(connection.updatedAt)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Noch nicht verbunden</p>
                    )}
                  </div>
                  {connection ? (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        connection.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {connection.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  ) : (
                    <a
                      href={platform === "google_business" ? "/api/social/connect/google" : "/api/social/connect/facebook"}
                      className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700"
                    >
                      Verbinden
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            Facebook und Instagram werden über einen einzigen Klick auf &quot;Facebook&quot; verbunden,
            da Instagram-Postings über die verknüpfte Facebook-Page laufen.
          </p>
        </div>
      )}

      {!loading && activeTab === "analytics" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Automatisch generierte Marketing-Berichte – wie von einer Agentur, nur auf Basis
            deiner echten Zahlen (Posts, Reichweite, Bewertungen) plus KI-gestützten
            Handlungsempfehlungen und SEO-Keyword-Vorschlägen.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => generateReport("weekly")}
              disabled={generatingReport !== null}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {generatingReport === "weekly" ? "Wird erstellt..." : "Wochenbericht jetzt erstellen"}
            </button>
            <button
              onClick={() => generateReport("monthly")}
              disabled={generatingReport !== null}
              className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {generatingReport === "monthly" ? "Wird erstellt..." : "Monatsbericht jetzt erstellen"}
            </button>
          </div>
          {reportError && <p className="text-xs text-red-600">{reportError}</p>}

          {reports.length === 0 && (
            <p className="text-gray-500">Noch keine Berichte erstellt.</p>
          )}

          <div className="space-y-4">
            {reports.map((report) => (
              <details key={report.id} className="border rounded-lg p-4">
                <summary className="cursor-pointer flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {report.periodType === "weekly" ? "Wochenbericht" : "Monatsbericht"} ·{" "}
                    {formatDateShort(report.periodStart)} – {formatDateShort(report.periodEnd)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {report.metrics.postsPublished} Posts · {report.metrics.totalReach} Reichweite
                  </span>
                </summary>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-lg font-semibold">{report.metrics.postsPublished}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-lg font-semibold">{report.metrics.totalReach}</p>
                    <p className="text-xs text-gray-500">Reichweite</p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-lg font-semibold">{report.metrics.totalEngagement}</p>
                    <p className="text-xs text-gray-500">Interaktionen</p>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2">
                    <p className="text-lg font-semibold">
                      {report.metrics.avgRating !== null ? report.metrics.avgRating.toFixed(1) : "–"}
                    </p>
                    <p className="text-xs text-gray-500">Ø Bewertung ({report.metrics.newReviews} neu)</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm">{report.summary}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
