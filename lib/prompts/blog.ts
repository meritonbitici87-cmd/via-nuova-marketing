import { BusinessProfile, GenerationOptions } from "./types";

export function buildBlogPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { topic } = options;
  return `Du bist SEO-Texter und Content-Stratege für eine lokale Pizzeria.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Thema des Blogartikels: ${topic}

Schreibe einen SEO-optimierten Blogartikel (500-700 Wörter) zu diesem Thema für die Website
der Pizzeria.

Anforderungen:
- Beginne mit einer Zeile "Titel: <SEO-optimierter Titel, max. 60 Zeichen>"
- Danach eine Leerzeile, dann der Artikeltext mit klaren Zwischenüberschriften (## Format)
- Lokale Suchbegriffe natürlich einbauen (Stadt/Region, "Pizzeria", relevante Spezialitäten)
- Informativ UND verkaufsfördernd — Leser soll am Ende Lust haben, die Pizzeria zu besuchen
  oder zu bestellen
- Am Ende einen klaren Call-to-Action-Absatz (z.B. Tisch reservieren, Öffnungszeiten, Adresse)
- Danach eine Zeile "Meta-Beschreibung: <SEO-Meta-Beschreibung, max. 155 Zeichen>"
- Klare Absätze, keine langen Textblöcke, gut lesbar

Antworte NUR mit dem fertigen Artikel in diesem Format, keine zusätzlichen Erklärungen.`;
}
