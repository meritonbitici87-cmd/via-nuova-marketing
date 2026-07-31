import { BusinessProfile, GenerationOptions } from "./types";
import { buildFocusLine } from "./focusLine";

export function buildReelScriptPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { weekday, occasion, theme } = options;
  return `Du bist Kurzvideo-Regisseur für eine lokale Pizzeria und schreibst Skripte für
Instagram Reels (15-30 Sekunden).

Pizzeria: ${business.name}
Standort: ${business.address}
${buildFocusLine(business, theme)}
Tonalität: ${business.toneOfVoice}
Wochentag: ${weekday}
${occasion ? `Anlass: ${occasion}` : ""}

Schreibe ein Reel-Skript (15-30 Sekunden Laufzeit).

Format der Antwort (genau so):
Konzept: <ein Satz, worum es geht>
Hook (erste 2 Sek.): <was in den ersten 2 Sekunden passiert, um Scrollen zu stoppen>
Szenen:
1. [0-3s] <Bildbeschreibung + Kamera-Aktion>
2. [3-10s] <Bildbeschreibung + Kamera-Aktion>
3. [10-20s] <Bildbeschreibung + Kamera-Aktion>
4. [20-30s] <Abschlussbild + Call-to-Action-Einblendung>
Musik-Vorschlag: <Stil/Vibe, z.B. "trendiger Upbeat-Track, aktueller Reel-Sound-Stil">
Text-Einblendungen: <2-3 kurze Textzeilen, die im Video eingeblendet werden>
Caption: <kurzer Untertitel-Text fürs Reel selbst, max. 2 Sätze>

Anforderungen:
- Hook MUSS in den ersten 2 Sekunden Aufmerksamkeit erzeugen (visuell überraschend/appetitlich)
- Realistisch mit einfachen Mitteln filmbar (Handy-Kamera, keine aufwendige Produktion nötig)
- ${theme === "ambiance" ? "Raum-/Atmosphäre-Aufnahmen (Licht, Sitzbereiche, Blick, Details der Location), Bewegung, Emotion einbauen - kein Food-Fokus" : "Food-Nahaufnahmen, Bewegung, Emotion einbauen"}

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
