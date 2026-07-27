import { BusinessProfile, GenerationOptions } from "./types";

export function buildSeasonalCampaignPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { season } = options;
  return `Du bist Marketing-Stratege für eine lokale Pizzeria und entwickelst das Grundkonzept
für eine saisonale Kampagne.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Saison: ${season}

Entwickle ein kompaktes Kampagnenkonzept für diese Saison.

Format der Antwort (genau so):
Kampagnenname: <kurzer, einprägsamer Name der Kampagne>
Kernbotschaft: <1-2 Sätze, worum es in der Kampagne inhaltlich geht>
Saisonaler Aufhänger: <was an dieser Saison konkret genutzt wird, z.B. Zutaten, Anlässe, Wetter>
Beispiel-Post: <ein fertiger Beispiel-Social-Media-Text, 2-3 Sätze, der die Kampagne umsetzt>

Anforderungen:
- Nutzt die Saison glaubwürdig (z.B. saisonale Zutaten, typische Anlässe der Jahreszeit)
- Konzept muss sich über mehrere Wochen mit unterschiedlichen Einzel-Posts bespielen lassen
- Passt zur Tonalität und den Spezialitäten der Pizzeria

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
