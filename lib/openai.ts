import OpenAI from "openai";

// Separater API-Key/Anbieter für Bildgenerierung (OpenAI), unabhängig vom Anthropic-Key
// für Text. Wird ausschließlich serverseitig genutzt.
//
// Der Client wird bewusst erst innerhalb der Funktion (statt auf Modulebene) erstellt:
// Ohne gesetzten Key wirft der OpenAI-Konstruktor sofort einen Fehler. Auf Modulebene
// würde das schon beim Import passieren (noch bevor der try/catch der aufrufenden Route
// greifen kann) und zu einem harten 500-Fehler statt einer sauberen JSON-Fehlermeldung führen.
export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY ist nicht gesetzt. Bitte in .env/.env.local eintragen und Server neu starten."
    );
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("Keine Bilddaten von der OpenAI API erhalten.");
  }
  return b64;
}
