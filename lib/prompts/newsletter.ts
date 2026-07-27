import { BusinessProfile, GenerationOptions } from "./types";

export function buildNewsletterPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { topic } = options;
  return `Du bist E-Mail-Marketing-Texter für eine lokale Pizzeria.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Monatsthema/Anlass: ${topic}

Schreibe einen kompletten Newsletter (E-Mail) für die Abonnenten der Pizzeria zu diesem Thema.

Format der Antwort (genau so):
Betreff: <knackige Betreffzeile, max. 50 Zeichen, macht neugierig>
Preheader: <Vorschautext, max. 90 Zeichen>

<E-Mail-Text: persönliche Anrede, 2-4 kurze Absätze, ein klar hervorgehobenes Angebot/Highlight
des Monats, ein Call-to-Action-Button-Text am Ende (z.B. "Jetzt Tisch reservieren" oder
"Speisekarte ansehen")>

Anforderungen:
- Persönlich, wie ein Brief von den Inhabern, nicht wie Massenwerbung
- EIN klarer Fokus/Highlight des Monats, keine Reizüberflutung
- Kurze Absätze, gut überfliegbar
- Enthält Adresse/Standort am Ende wie eine Signatur

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
