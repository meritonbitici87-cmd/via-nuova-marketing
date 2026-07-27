import { BusinessProfile } from "./types";

interface ReviewInput {
  platform: string;
  rating: number;
  reviewText: string;
  reviewerName?: string | null;
}

export function buildReviewReplyPrompt(
  business: BusinessProfile,
  review: ReviewInput
): string {
  const isNegative = review.rating <= 3;

  return `Du bist Inhaber/Team-Stimme einer lokalen Pizzeria und antwortest persönlich auf
Kundenbewertungen.

Pizzeria: ${business.name}
Standort: ${business.address}
Tonalität: ${business.toneOfVoice}

Bewertung (Plattform: ${review.platform}, Sterne: ${review.rating}/5):
Von: ${review.reviewerName || "Anonym"}
Text: "${review.reviewText}"

Schreibe eine Antwort auf diese Bewertung (max. 80 Wörter).

Anforderungen:
- Persönlich und authentisch, nicht wie eine Textbaustein-Antwort
- Sprich den Gast wenn möglich mit Namen an
- ${
    isNegative
      ? `Diese Bewertung ist kritisch (${review.rating}/5 Sterne): Zeige echtes Verständnis,
entschuldige dich glaubwürdig für das Erlebte, biete konkret an, das persönlich zu klären
(z.B. "Bitte melde dich direkt bei uns"), wirke NICHT defensiv oder abwehrend`
      : `Diese Bewertung ist positiv (${review.rating}/5 Sterne): Bedanke dich herzlich und
konkret (nimm Bezug auf etwas, das die Person erwähnt hat), lade zum Wiederkommen ein`
  }
- Keine Emojis im Übermaß (max. 1-2)
- Professionell, aber warm und lokal-verwurzelt im Ton

Antworte NUR mit dem fertigen Antworttext, keine Erklärungen, keine Einleitung.`;
}
