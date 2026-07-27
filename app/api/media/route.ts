import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadMediaFile, deleteMediaFile } from "@/lib/supabaseStorage";

const prisma = new PrismaClient();

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB, reicht für Handy-Fotos und kurze Clips

// GET: Liste aller hochgeladenen echten Fotos/Videos (neueste zuerst).
export async function GET() {
  const mediaAssets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ mediaAssets });
}

// POST: Nimmt eine echte Foto-/Video-Datei entgegen (multipart/form-data), lädt sie
// zu Supabase Storage hoch und legt einen MediaAsset-Datensatz an.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const description = formData.get("description");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Keine Datei erhalten." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Datei zu groß (max. 50 MB)." },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Nur Bild- oder Videodateien werden unterstützt." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { storagePath, url } = await uploadMediaFile(
      Buffer.from(arrayBuffer),
      file.name,
      file.type
    );

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        type: isVideo ? "video" : "photo",
        storagePath,
        url,
        description: typeof description === "string" && description ? description : null,
      },
    });

    return NextResponse.json({ mediaAsset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Medien-Upload:", error);
    return NextResponse.json(
      { error: `Interner Fehler beim Medien-Upload: ${message}` },
      { status: 500 }
    );
  }
}

// PATCH: Aktualisiert Metadaten eines MediaAsset (used-Status, Beschreibung,
// Verknüpfung mit einem Content-Item), z.B. wenn ein Foto in einem Post verwendet wurde.
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, used, description, contentItemId } = body;
    if (!id) {
      return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
    }

    const mediaAsset = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(typeof used === "boolean" ? { used } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(contentItemId !== undefined ? { contentItemId } : {}),
      },
    });

    return NextResponse.json({ mediaAsset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Aktualisieren des Medien-Eintrags:", error);
    return NextResponse.json(
      { error: `Interner Fehler: ${message}` },
      { status: 500 }
    );
  }
}

// DELETE: Löscht einen MediaAsset-Datensatz inkl. der Datei im Supabase-Bucket.
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
    }

    const mediaAsset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!mediaAsset) {
      return NextResponse.json({ error: "Medien-Eintrag nicht gefunden." }, { status: 404 });
    }

    await deleteMediaFile(mediaAsset.storagePath);
    await prisma.mediaAsset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler beim Löschen des Medien-Eintrags:", error);
    return NextResponse.json(
      { error: `Interner Fehler: ${message}` },
      { status: 500 }
    );
  }
}
