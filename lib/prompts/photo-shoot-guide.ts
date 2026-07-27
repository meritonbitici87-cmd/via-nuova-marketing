import { BusinessProfile, GenerationOptions } from "./types";

// Erzeugt KEIN Bild, sondern eine konkrete Anleitung für ein ECHTES Foto-/Video-Shooting
// mit dem Handy. Hintergrund: Für eine lokale Pizzeria sind echte Aufnahmen (Vertrauen,
// Google-Business-Ranking, kein Irreführungs-Risiko nach §5 UWG) fast immer besser als
// KI-generierte Food-Bilder. Dieser Content-Typ hilft dabei, ohne Fotografie-Erfahrung
// trotzdem regelmäßig gute, echte Motive einzufangen.
export function buildPhotoShootGuidePrompt(
  business: BusinessProfile,
  options: GenerationOptions
): string {
  const { topic } = options;
  return `Du bist Social-Media- und Foto-Berater für eine lokale Pizzeria und hilfst dem
Inhaber (kein Profi-Fotograf, nutzt nur sein Smartphone), ein kurzes, echtes Foto-/Video-Shooting
im eigenen Laden zu planen.

Pizzeria: ${business.name}
Standort: ${business.address}
Spezialitäten: ${business.specialties.join(", ")}
Tonalität: ${business.toneOfVoice}
${topic ? `Fokus für dieses Shooting: ${topic}` : "Fokus: allgemeine Motiv-Bibliothek für die nächsten Wochen"}

Erstelle einen konkreten, umsetzbaren Shooting-Leitfaden für EIN Shooting (ca. 30-45 Minuten
Aufwand), das reale Fotos/kurze Videoclips liefert.

Format der Antwort (genau so):
Beste Uhrzeit: <konkrete Tageszeit-Empfehlung fürs beste natürliche Licht in einem Restaurant,
kurze Begründung>

Motivliste:
1. <Motiv-Name> – <was genau zeigen, z.B. "Pizza direkt aus dem Ofen, Dampf sichtbar">
   Licht/Winkel-Tipp: <ein konkreter, einfacher Tipp>
   Eignet sich für: <z.B. Instagram-Post, Story, Reel, Google Business>
(so 8-10 Motive, Mix aus Essen, Zubereitung/Prozess, Ambiente/Laden, ggf. Team)

Handy-Kamera-Tipps:
- <3-4 einfache, konkrete Tipps ohne Fachjargon, z.B. zu Belichtung, Fokus, Sauberkeit des Objektivs>

Nach dem Shooting:
- <1-2 Sätze, wie die Fotos/Clips am besten organisiert/wiederverwendet werden, z.B. Ordnerstruktur
  oder "reicht für ca. X Wochen Content">

Anforderungen:
- Alles muss mit einem normalen Smartphone ohne Zusatzequipment umsetzbar sein
- Konkret und direkt umsetzbar, keine allgemeinen Fotografie-Theorie-Ausführungen
- Motive passend zu den genannten Spezialitäten und zum Fokus (falls angegeben)

Antworte NUR in diesem Format, keine zusätzlichen Erklärungen.`;
}
