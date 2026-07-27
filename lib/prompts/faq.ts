import { BusinessProfile, GenerationOptions } from "./types";

export function buildFaqPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { topic } = options;
  return `Du bist Texter für die Website einer lokalen Pizzeria und erstellst einen Abschnitt
für die FAQ-Seite (häufig gestellte Fragen).

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Themenbereich: ${topic}

Erstelle 4-6 realistische, häufig gestellte Fragen zu diesem Themenbereich inklusive
kurzer, hilfreicher Antworten.

Format der Antwort (genau so, für jede Frage):
F: <Frage>
A: <Antwort, 1-3 Sätze, konkret und hilfreich>

(Leerzeile zwischen den Frage-Antwort-Paaren)

Anforderungen:
- Fragen so formulieren, wie echte Gäste sie stellen würden (nicht künstlich)
- Antworten kurz, konkret, keine Ausreden oder Marketing-Floskeln
- Passt zur Tonalität der Pizzeria, aber sachlich genug für eine FAQ-Seite
- Falls für den Themenbereich sinnvoll, konkrete Angaben nutzen (z.B. Standort/Adresse), aber
  keine erfundenen Details wie Öffnungszeiten oder Preise, die nicht gegeben wurden

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
