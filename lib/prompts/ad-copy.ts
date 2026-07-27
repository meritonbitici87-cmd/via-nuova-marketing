import { BusinessProfile, GenerationOptions } from "./types";

export function buildAdCopyPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { topic } = options;
  return `Du bist Werbetexter für eine lokale Pizzeria und schreibst kanalübergreifende
Werbetexte (einsetzbar für Flyer, Plakat, Schaufenster-Aushang oder Online-Anzeige).

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Werbethema/Anlass: ${topic}

Schreibe einen kurzen, schlagkräftigen Werbetext zu diesem Thema.

Format der Antwort (genau so):
Headline: <kurzer, einprägsamer Blickfang, max. 8 Wörter>
Text: <2-4 knackige Sätze, die das Thema/Angebot erklären und Lust machen>
Call-to-Action: <eine kurze, klare Handlungsaufforderung, z.B. "Jetzt vorbeikommen" oder "Jetzt bestellen">

Anforderungen:
- Werbewirksam und verkaufsstark, aber glaubwürdig (keine leeren Superlative)
- Funktioniert gedruckt (Flyer/Plakat) genauso wie online
- Lokalbezug spürbar (Standort/Community)
- Kurz und plakativ, keine langen Schachtelsätze

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
