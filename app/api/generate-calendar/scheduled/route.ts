import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildCalendarPlan } from "@/lib/contentCalendar";
import { generateContentItem } from "@/lib/generateContentItem";
import { generateAndAttachImage } from "@/lib/attachGeneratedImage";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Wie viele Tage pro Lauf nachgeneriert werden (wöchentlicher Cron -> 7 Tage reicht,
// damit der Vorrat nie ausgeht, ohne auf Vorrat für Monate zu generieren).
const DAYS_PER_RUN = 7;

// Nur für diese Typen wird automatisch auch ein KI-Bild generiert - das sind die,
// die tatsächlich auf Social Media gepostet werden und ohne Bild "langweilig" wirken.
const IMAGE_TYPES = ["instagram", "facebook", "google_business"];

// Für Vercel Cron gedacht (siehe vercel.json): generiert automatisch neue
// Content-Entwürfe für die nächsten Tage nach dem zuletzt geplanten Datum, damit
// der Entwurfs-Vorrat nie leer wird, ohne dass jemand manuell "Kalender generieren"
// aufrufen muss.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const business = await prisma.business.findFirst();
    if (!business) {
      return NextResponse.json({ error: "Kein Business gefunden." }, { status: 404 });
    }

    const latest = await prisma.contentItem.findFirst({
      where: { scheduledDate: { not: null } },
      orderBy: { scheduledDate: "desc" },
    });

    const startDate = latest?.scheduledDate ? new Date(latest.scheduledDate) : new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() + 1);

    const plan = buildCalendarPlan(startDate, DAYS_PER_RUN, business);

    const results: { type: string; date: string; id?: string; image?: boolean; error?: string }[] = [];
    let specialtyIndex = 0;
    for (const item of plan) {
      try {
        const contentItem = await generateContentItem({
          businessId: business.id,
          type: item.type,
          options: item.options,
          scheduledDate: item.date,
        });

        let visual: "real" | "generated" | null = null;
        if (IMAGE_TYPES.includes(item.type)) {
          const isAmbiance = item.options.theme === "ambiance";
          const wantedCategory = isAmbiance ? "ambiance" : "food";

          // Echtes Material geht immer vor KI-generiertem Bild - dafür wird zuerst nach
          // einem noch unbenutzten Foto/Video in der passenden Kategorie gesucht
          // (Essen- vs. Ambiente-Post), damit kein Essensfoto in einem Ambiente-Post landet.
          const realMedia = await prisma.mediaAsset.findFirst({
            where: { used: false, category: wantedCategory },
            orderBy: { createdAt: "asc" },
          });

          if (realMedia) {
            await prisma.mediaAsset.update({
              where: { id: realMedia.id },
              data: { used: true, contentItemId: contentItem.id },
            });
            visual = "real";
          } else {
            const motifPool = isAmbiance ? business.ambianceHighlights : business.specialties;
            if (motifPool.length > 0) {
              try {
                const motif = motifPool[specialtyIndex % motifPool.length];
                specialtyIndex++;
                await generateAndAttachImage(contentItem.id, business.id, motif, isAmbiance);
                visual = "generated";
              } catch (imgErr) {
                // Bild ist "nice to have" - ein Fehler hier (z.B. fehlender OPENAI_API_KEY)
                // soll den Text-Content nicht verwerfen.
                console.error(`Bild für ContentItem ${contentItem.id} konnte nicht generiert werden:`, imgErr);
              }
            }
          }
        }

        results.push({
          type: item.type,
          date: item.date.toISOString().slice(0, 10),
          id: contentItem.id,
          image: visual !== null,
        });
      } catch (err) {
        results.push({
          type: item.type,
          date: item.date.toISOString().slice(0, 10),
          error: err instanceof Error ? err.message : "Unbekannter Fehler",
        });
      }
    }

    const created = results.filter((r) => r.id).length;
    const failed = results.filter((r) => r.error).length;

    return NextResponse.json({ created, failed, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler bei der geplanten Kalender-Generierung:", error);
    return NextResponse.json({ error: `Interner Fehler: ${message}` }, { status: 500 });
  }
}
