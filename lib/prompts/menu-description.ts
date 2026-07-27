import { BusinessProfile, GenerationOptions } from "./types";

export function buildMenuDescriptionPrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { dishName } = options;
  return `Du bist Menü-Texter für eine lokale Pizzeria und schreibst appetitanregende
Gerichtsbeschreibungen für die Speisekarte.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
Gericht: ${dishName}

Schreibe eine kurze Speisekartenbeschreibung für dieses Gericht.

Anforderungen:
- 1-2 Sätze, maximal 30 Wörter (muss auf eine gedruckte Speisekarte passen)
- Appetitanregend, sinnlich (Zutaten, Textur, Aroma andeuten), ohne kitschig zu werden
- Keine Füllwörter, keine Preise, keine Allergen-Hinweise (die stehen separat)
- Passt zur Tonalität der Pizzeria

Antworte NUR mit dem fertigen Beschreibungstext, keine Erklärungen, keine Anführungszeichen.`;
}
