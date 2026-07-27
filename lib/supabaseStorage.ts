import { createClient } from "@supabase/supabase-js";

// Server-seitiger Supabase-Client für Datei-Uploads (echte Fotos/Videos + KI-generierte
// Bilder). Nutzt den Service-Role-Key (volle Rechte, umgeht Row Level Security), daher
// NIEMALS im Frontend-Code verwenden oder an den Client senden.
const MEDIA_BUCKET = "media";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY sind nicht gesetzt. Bitte in .env.local eintragen und Server neu starten."
    );
  }
  return createClient(url, serviceRoleKey);
}

// Lädt eine Datei in den angegebenen Bucket hoch und gibt Pfad + öffentliche URL zurück.
// Generisch gehalten, da sowohl echte Uploads (MediaAsset) als auch KI-generierte Bilder
// (GeneratedImage) hierüber laufen - beide brauchen eine dauerhafte, öffentlich erreichbare
// URL (z.B. für Meta/Google-Postings), was ein lokales Dateisystem auf Vercel nicht bieten kann.
export async function uploadFile(
  bucket: string,
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ storagePath: string; url: string }> {
  const supabase = getSupabaseAdmin();
  const storagePath = `${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { contentType, upsert: false });

  if (uploadError) {
    throw new Error(`Upload zu Supabase Storage (${bucket}) fehlgeschlagen: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return { storagePath, url: data.publicUrl };
}

export async function deleteFile(bucket: string, storagePath: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    throw new Error(`Löschen aus Supabase Storage (${bucket}) fehlgeschlagen: ${error.message}`);
  }
}

export async function uploadMediaFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ storagePath: string; url: string }> {
  return uploadFile(MEDIA_BUCKET, file, fileName, contentType);
}

export async function deleteMediaFile(storagePath: string): Promise<void> {
  return deleteFile(MEDIA_BUCKET, storagePath);
}
