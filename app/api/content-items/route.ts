import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.contentItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { mediaAssets: true, images: true },
  });
  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, contentText } = body;

  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  const updated = await prisma.contentItem.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(contentText ? { contentText } : {}),
    },
  });

  return NextResponse.json({ item: updated });
}
