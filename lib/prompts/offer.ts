import { BusinessProfile, GenerationOptions } from "./types";

export function buildOfferPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { offerDetails } = options;
  return `Du bist Marketing-Texter für eine lokale Pizzeria und formulierst ein konkretes Angebot
für Social Media, Website und Aushang.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Angebotsdetails: ${offerDetails}

Schreibe einen Angebotstext, der dieses Angebot klar und attraktiv kommuniziert.

Format der Antwort (genau so):
Titel: <kurzer Angebotstitel, max. 8 Wörter>
Text: <2-4 Sätze, die erklären was das Angebot genau ist, für wen und ggf. bis wann es gilt>
Call-to-Action: <klare Handlungsaufforderung, z.B. "Jetzt sichern" oder "Jetzt reservieren">

Anforderungen:
- Angebot muss glasklar verständlich sein (kein Kleingedrucktes verstecken, aber auch nicht
  übertrieben ins Detail gehen)
- Dringlichkeit/Attraktivität vermitteln, ohne unseriös zu wirken
- Lokalbezug beibehalten, passend zur Tonalität der Pizzeria

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
