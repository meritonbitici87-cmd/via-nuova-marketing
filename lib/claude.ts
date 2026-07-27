import Anthropic from "@anthropic-ai/sdk";

// Der API-Key wird ausschließlich serverseitig aus der Umgebungsvariable gelesen.
// Niemals im Frontend-Code verwenden oder an den Client senden.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateText(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    // 800 war zu knapp für längere Formate (z.B. Blog ~700 Wörter, Foto-Shooting-Leitfaden
    // mit 8-10 Motiven inkl. Detail-Tipps pro Motiv) und hat Antworten mitten im Format
    // abgeschnitten (erst bei 1600 immer noch). 2500 gibt genug Puffer für die längsten
    // Formate, ohne die Kosten pro Aufruf nennenswert zu erhöhen (kürzere Typen wie Instagram
    // brauchen davon ohnehin nur einen Bruchteil, max_tokens ist nur eine Obergrenze).
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Keine Textantwort von der Claude API erhalten.");
  }
  return textBlock.text;
}
