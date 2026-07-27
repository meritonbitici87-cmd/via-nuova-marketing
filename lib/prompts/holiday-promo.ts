import { BusinessProfile, GenerationOptions } from "./types";

export function buildHolidayPromoPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { holiday } = options;
  return `Du bist Social-Media- und Marketing-Texter für eine lokale Pizzeria und schreibst
eine Aktion passend zu einem bestimmten Feiertag/Anlass.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Feiertag/Anlass: ${holiday}

Schreibe einen Aktionstext passend zu diesem Feiertag/Anlass.

Format der Antwort (genau so):
Aktionsidee: <kurze Beschreibung, was an diesem Tag konkret angeboten/gemacht wird>
Post-Text: <fertiger Social-Media-Text, 2-4 Sätze, mit Bezug zum Feiertag und Call-to-Action>
Deko-/Umsetzungstipp: <ein einfacher praktischer Tipp, wie die Aktion im Laden/online sichtbar
gemacht werden kann>

Anforderungen:
- Bezug zum Feiertag muss authentisch und nicht aufgesetzt wirken
- Passend zur Tonalität und den Spezialitäten der Pizzeria
- Realistisch umsetzbar für eine kleine, lokale Pizzeria (kein Großaufwand nötig)

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
