import { BusinessProfile, GenerationOptions } from "./types";
import { buildFocusLine } from "./focusLine";

export function buildGoogleBusinessPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { weekday, occasion, theme } = options;
  return `Du bist Texter für Google Business Profile Beiträge ("Google Posts") einer lokalen Pizzeria.

Pizzeria: ${business.name}
Standort: ${business.address}
${buildFocusLine(business, theme)}
Tonalität: ${business.toneOfVoice}
Wochentag: ${weekday}
${occasion ? `Anlass: ${occasion}` : ""}

Schreibe einen Google-Business-Profile-Beitrag (max. 1500 Zeichen, idealerweise 300-500 Zeichen
für gute Lesbarkeit in der Google-Suche/Maps-Vorschau).

Anforderungen:
- Sachlich-einladend, direkter als Social Media (Nutzer suchen aktiv nach einem Ort zum Essen)
- Enthält relevante lokale Suchbegriffe auf natürliche Weise (z.B. "Pizzeria in Ulm",
  "Pizza zum Mitnehmen", je nach Anlass)
- Klarer Call-to-Action am Ende (z.B. "Jetzt Tisch reservieren", "Route berechnen", "Anrufen")
- KEINE Hashtags (auf Google Business unüblich)
- Kurz, prägnant, keine Füllwörter

Antworte NUR mit dem fertigen Beitragstext, keine Erklärungen, keine Einleitung.`;
}
