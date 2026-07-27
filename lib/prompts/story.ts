import { BusinessProfile, GenerationOptions } from "./types";

export function buildStoryPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { weekday, occasion } = options;
  return `Du bist Social-Media-Stratege für eine lokale Pizzeria und entwickelst Ideen für
Instagram/Facebook-Stories (kurzlebige 24h-Inhalte, kein Feed-Post).

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Wochentag: ${weekday}
${occasion ? `Anlass: ${occasion}` : ""}

Entwickle 1 konkrete Story-Idee für heute.

Format der Antwort (genau so):
Story-Idee: <kurzer Titel der Idee>
Visuell: <was man sehen sollte, z.B. "Nahaufnahme von frisch gezogenem Käse auf der Pizza">
Text/Sticker: <kurzer Text der in der Story stehen soll, max. 15 Wörter>
Interaktion: <ein Story-Sticker-Vorschlag, z.B. Umfrage "Pizza oder Pasta heute?", Countdown,
Frage-Sticker>

Anforderungen:
- Spontan und authentisch wirkend, nicht wie ein durchgestylter Werbespot
- Nutzt das Story-Format aus (Interaktion, Vergänglichkeit, "jetzt gerade")
- Bezug zu Wochentag/Anlass falls sinnvoll

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
