import { BusinessProfile } from "./types";

// Reichert eine kurze Nutzer-Beschreibung (z.B. "Pizza Margherita") mit Stil-Vorgaben an,
// damit die Bild-KI konsistent hochwertige, für Social Media/Website nutzbare Food-Fotos liefert.
export function buildImagePrompt(business: BusinessProfile, description: string): string {
  return `Professionelle Food-Fotografie für eine italienische Pizzeria namens ${business.name}.

Motiv: ${description}

Stil-Vorgaben:
- Appetitlich, warmes natürliches Licht, wie in einem hochwertigen Restaurant-Marketing-Foto
- Realistische, appetitanregende Textur (Käse, Kruste, frische Zutaten deutlich erkennbar)
- Flache Schärfentiefe, Fokus auf das Hauptgericht, dezent unscharfer Hintergrund
- Rustikal-modernes Ambiente im Hintergrund (Holztisch, dezente Requisiten), keine Personen
- KEIN Text, KEIN Logo, KEINE Schrift im Bild
- Quadratisches Format, gut geeignet für Instagram/Google Business`;
}
