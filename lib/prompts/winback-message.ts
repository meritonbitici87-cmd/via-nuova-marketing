import { BusinessProfile, GenerationOptions } from "./types";

export function buildWinbackMessagePrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { customerName, customerContext } = options;
  return `Du bist Texter für persönliche Kundenbindungs-Nachrichten einer lokalen Pizzeria
(versendet per E-Mail oder SMS an einzelne Kunden, die länger nicht mehr da waren).

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Kunde: ${customerName}
${customerContext ? `Zusätzlicher Kontext: ${customerContext}` : ""}

Schreibe eine kurze "Wir vermissen dich"-Rückgewinnungsnachricht an diesen Kunden, der eine
Weile nicht mehr da war.

Anforderungen:
- Direkte, persönliche Anrede mit dem Namen des Kunden
- Warmherzig, neugierig machend, NICHT vorwurfsvoll oder aufdringlich
- Erinnert kurz daran, was die Pizzeria besonders macht (z.B. eine Spezialität)
- Enthält einen konkreten kleinen Anreiz zur Rückkehr (z.B. "20% auf deine nächste Bestellung"
  oder "eine Vorspeise aufs Haus beim nächsten Besuch")
- Maximal 4-5 Sätze, persönlich wie von den Inhabern geschrieben, nicht wie Massenmail

Antworte NUR mit dem fertigen Nachrichtentext, keine Betreffzeile, keine Erklärungen.`;
}
