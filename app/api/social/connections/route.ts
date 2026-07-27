import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Liste der Social-Media-Verbindungen für die Anzeige im Dashboard.
// Gibt bewusst KEINE Access-/Refresh-Tokens ans Frontend zurück.
export async function GET() {
  const connections = await prisma.socialConnection.findMany({
    select: {
      id: true,
      platform: true,
      accountId: true,
      accountName: true,
      isActive: true,
      tokenExpiresAt: true,
      updatedAt: true,
    },
    orderBy: { platform: "asc" },
  });
  return NextResponse.json({ connections });
}
