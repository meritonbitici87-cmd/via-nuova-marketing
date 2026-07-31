import { GenerationOptions } from "./prompts/types";

// Rhythmus exakt nach Vorgabe aus der Spec (Abschnitt 5 "Content-Kalender").
// google_business: 2x/Woche -> Montag & Donnerstag
// blog: 1x/Woche -> Mittwoch
// newsletter: 1x/Monat -> jeweils am 1. des Monats
const WEEKDAYS_DE = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

export interface CalendarPlanItem {
  type: string;
  date: Date;
  options: GenerationOptions;
}

interface BusinessForTopics {
  name: string;
  specialties: string[];
  ambianceHighlights: string[];
}

const BLOG_TOPIC_IDEAS = (business: BusinessForTopics) => [
  `Warum unsere ${business.specialties[0]} bei den Gästen so beliebt ist`,
  `Ein Blick hinter die Kulissen der Küche von ${business.name}`,
  `So findest du die perfekte Kombination auf unserer Karte`,
  `Was unsere Stammgäste an ${business.name} lieben`,
  `Saisonale Empfehlungen aus unserer Küche`,
];

function pickBlogTopic(business: BusinessForTopics, weekOfYearSeed: number): string {
  const ideas = BLOG_TOPIC_IDEAS(business);
  return ideas[weekOfYearSeed % ideas.length];
}

function weekOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.floor(diffDays / 7);
}

/**
 * Baut den Content-Plan für einen Zeitraum, exakt nach der Frequenz-Vorgabe aus der Spec:
 * - 3x Instagram täglich
 * - 5x Story täglich
 * - 1x Reel-Skript täglich
 * - 1x TikTok-Skript täglich
 * - 2x Google Business wöchentlich (Mo + Do)
 * - 1x Blogartikel wöchentlich (Mi)
 * - 1x Newsletter monatlich (1. des Monats)
 */
// Ungefähr jeder dritte visuelle Post bekommt statt eines Essen-Fokus das Ambiente-Thema
// (Location/Atmosphäre), damit gezielt Bekanntheit für den Ort selbst aufgebaut wird -
// nur wenn im Business-Profil überhaupt Ambiente-Highlights hinterlegt sind.
const AMBIANCE_EVERY = 3;

export function buildCalendarPlan(
  startDate: Date,
  days: number,
  business: BusinessForTopics
): CalendarPlanItem[] {
  const plan: CalendarPlanItem[] = [];
  const hasAmbiance = business.ambianceHighlights.length > 0;
  let visualCount = 0;

  function nextTheme(): GenerationOptions["theme"] {
    visualCount++;
    return hasAmbiance && visualCount % AMBIANCE_EVERY === 0 ? "ambiance" : undefined;
  }

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const weekday = WEEKDAYS_DE[date.getDay()];

    for (let n = 1; n <= 3; n++) {
      plan.push({ type: "instagram", date, options: { weekday, theme: nextTheme() } });
    }
    for (let n = 1; n <= 5; n++) {
      plan.push({ type: "story", date, options: { weekday, theme: nextTheme() } });
    }
    plan.push({ type: "reel_script", date, options: { weekday, theme: nextTheme() } });
    plan.push({ type: "tiktok_script", date, options: { weekday, theme: nextTheme() } });

    if (date.getDay() === 1 || date.getDay() === 4) {
      plan.push({
        type: "google_business",
        date,
        options: { weekday, occasion: "Wochenaktion", theme: nextTheme() },
      });
    }

    if (date.getDay() === 3) {
      plan.push({
        type: "blog",
        date,
        options: { topic: pickBlogTopic(business, weekOfYear(date)) },
      });
    }

    if (date.getDate() === 1) {
      plan.push({
        type: "newsletter",
        date,
        options: { topic: `Neuigkeiten des Monats bei ${business.name}` },
      });
    }
  }

  return plan;
}
