import { BusinessProfile, GenerationOptions } from "./types";

export function buildBirthdayMessagePrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { customerName, customerContext } = options;
  return `Du bist Texter für persönliche Kundenbindungs-Nachrichten einer lokalen Pizzeria
(versendet per E-Mail oder SMS an einzelne Stammgäste, nicht öffentlich).

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Kunde: ${customerName}
${customerContext ? `Zusätzlicher Kontext: ${customerContext}` : ""}

Schreibe eine kurze, persönliche Geburtstagsnachricht an diesen Kunden.

Anforderungen:
- Direkte, persönliche Anrede mit dem Namen des Kunden
- Herzlich und warm, aber nicht aufdringlich verkäuferisch
- Enthält ein kleines, konkretes Geschenk/Angebot (z.B. "ein Dessert aufs Haus" oder
  "10% Rabatt an deinem Ehrentag") als Geste
- Maximal 4-5 Sätze, wirkt wie von den Inhabern persönlich geschrieben, nicht wie Massenmail
- Enthält einen einfachen Hinweis, wie/bis wann das Geschenk eingelöst werden kann

Antworte NUR mit dem fertigen Nachrichtentext, keine Betreffzeile, keine Erklärungen.`;
}
