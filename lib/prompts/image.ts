import { BusinessProfile } from "./types";

// Reichert eine kurze Nutzer-Beschreibung (z.B. "Pizza Margherita") mit Stil-Vorgaben an,
// damit die Bild-KI konsistent hochwertige, für Social Media/Website nutzbare Fotos liefert.
// isAmbiance=true schaltet von Food-Nahaufnahme auf Raum-/Atmosphäre-Fotografie um.
export function buildImagePrompt(
  business: BusinessProfile,
  description: string,
  isAmbiance = false
): string {
  if (isAmbiance) {
    return `Professionelle Interieur-/Ambiente-Fotografie für eine italienische Pizzeria namens ${business.name}.

Motiv: ${description}

Stil-Vorgaben:
- Einladende, warme Raumatmosphäre wie in einem hochwertigen Restaurant-Magazin-Foto
- Zeigt Sitzbereiche, Licht, Details der Einrichtung - macht Lust, den Ort selbst zu besuchen
- Natürliches oder warmes Kunstlicht, gemütliche Stimmung, keine grelle Beleuchtung
- Keine erkennbaren Gesichter/Personen im Bild
- KEIN Text, KEIN Logo, KEINE Schrift im Bild
- Quadratisches Format, gut geeignet für Instagram/Google Business`;
  }

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
