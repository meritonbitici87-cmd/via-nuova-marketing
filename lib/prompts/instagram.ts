import { BusinessProfile, GenerationOptions } from "./types";

export function buildInstagramPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { weekday, occasion } = options;
  return `Du bist Social-Media-Texter für eine lokale Pizzeria.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Wochentag: ${weekday}
${occasion ? `Anlass: ${occasion}` : ""}

Schreibe einen Instagram-Post-Text (max. 150 Wörter) für diese Pizzeria.

Anforderungen:
- Emotional und einladend, aber nicht übertrieben werblich
- Lokalbezug erwähnen (Standort/Community)
- Enthält einen klaren Call-to-Action (z.B. "Jetzt vorbeikommen" oder "Jetzt reservieren")
- Am Ende: 5-8 passende, relevante Hashtags (Mix aus lokal und Pizza/Food-bezogen)
- Kein Fließtext-Geschwafel, kurze Absätze, gut lesbar auf Mobile

Antworte NUR mit dem fertigen Post-Text, keine Erklärungen, keine Einleitung.`;
}
