import sharp from "sharp";

// Schneidet ein Foto automatisch mittig auf ein Quadrat zu (1080x1080) und komprimiert
// es als JPEG - das Format, mit dem Instagram/Facebook/Google Business am zuverlässigsten
// arbeiten (Feed-Beiträge sind quadratisch oder hochformatig, nie extrem breit/schmal).
// "cover" schneidet die überstehenden Ränder ab, statt das Bild zu verzerren.
export async function cropToSquare(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // respektiert die EXIF-Ausrichtung von Handy-Fotos (sonst oft seitlich verdreht)
    .resize(1080, 1080, { fit: "cover", position: "attention" })
    .jpeg({ quality: 88 })
    .toBuffer();
}
