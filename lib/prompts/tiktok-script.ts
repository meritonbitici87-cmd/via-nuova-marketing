import { BusinessProfile, GenerationOptions } from "./types";

export function buildTiktokScriptPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { weekday, occasion } = options;
  return `Du bist Kurzvideo-Stratege für eine lokale Pizzeria und schreibst Skripte für TikTok
(15-45 Sekunden). TikTok tickt anders als Instagram: roher, unterhaltsamer, trendbezogener,
weniger poliert.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Wochentag: ${weekday}
${occasion ? `Anlass: ${occasion}` : ""}

Schreibe ein TikTok-Skript.

Format der Antwort (genau so):
Konzept: <ein Satz, worum es geht — idealerweise mit Trend-/Format-Bezug wie POV, Rating,
"Tag im Leben", etc.>
Hook (erste 1-2 Sek.): <Text/Aktion, die sofort Aufmerksamkeit erzeugt>
Ablauf:
1. <Szene/Aktion>
2. <Szene/Aktion>
3. <Szene/Aktion>
4. <Szene/Aktion + Call-to-Action>
Sound-Vorschlag: <Art von Sound/Trend-Format, z.B. "aktueller Trend-Sound" oder Voiceover-Stil>
On-Screen-Text: <2-3 kurze Text-Einblendungen>
Caption: <kurzer, lockerer TikTok-Caption-Text, 1-2 Sätze, gerne mit Umgangssprache>

Anforderungen:
- Unterhaltsam statt werblich, TikTok-Nutzer merken Werbung sofort und scrollen weg
- Authentisch, gerne mit Humor oder Überraschungsmoment
- Kein Hochglanz-Ton, eher "echt" und nahbar

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
