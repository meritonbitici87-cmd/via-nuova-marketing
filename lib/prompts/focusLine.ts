import { BusinessProfile, GenerationOptions } from "./types";

// Baut die Zeile, die dem Prompt sagt, worauf sich der Post inhaltlich konzentrieren
// soll: normalerweise die Spezialitäten (Essen), bei theme "ambiance" stattdessen die
// Location/Atmosphäre selbst. So lässt sich gezielt Bekanntheit für den Ort aufbauen,
// nicht nur für einzelne Gerichte.
export function buildFocusLine(business: BusinessProfile, theme: GenerationOptions["theme"]): string {
  if (theme === "ambiance" && business.ambianceHighlights.length > 0) {
    return `Fokus-Thema: NICHT das Essen in den Vordergrund stellen, sondern die Location/das Ambiente selbst - ${business.ambianceHighlights.join(
      ", "
    )}. Ziel: Menschen zeigen, dass sie sich hier wegen des Ortes und der Atmosphäre wohlfühlen werden, nicht nur wegen des Essens.`;
  }
  return `Spezialitäten: ${business.specialties.join(", ")}`;
}
