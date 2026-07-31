import { BusinessProfile, GenerationOptions } from "./types";
import { buildFocusLine } from "./focusLine";

export function buildFacebookPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { weekday, occasion, theme } = options;
  return `Du bist Social-Media-Texter für eine lokale Pizzeria.

Pizzeria: ${business.name}
Standort: ${business.address}
${buildFocusLine(business, theme)}
Tonalität: ${business.toneOfVoice}
Wochentag: ${weekday}
${occasion ? `Anlass: ${occasion}` : ""}

Schreibe einen Facebook-Post-Text (100-200 Wörter) für diese Pizzeria.

Anforderungen:
- Etwas ausführlicher und erzählerischer als ein Instagram-Post, Facebook-Publikum ist
  im Schnitt älter und schätzt einen persönlicheren, community-nahen Ton
- Lokalbezug und Community-Gefühl herstellen (z.B. Stammgäste, Nachbarschaft, Ulm)
- Enthält eine konkrete Handlungsaufforderung (z.B. "Kommt vorbei", "Jetzt anrufen und reservieren")
- Maximal 2-3 dezente Hashtags am Ende (Facebook-Nutzer nutzen weniger Hashtags als Instagram)
- Absätze kurz halten, keine Wall of Text

Antworte NUR mit dem fertigen Post-Text, keine Erklärungen, keine Einleitung.`;
}
