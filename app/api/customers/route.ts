import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Einfache, manuell gepflegte Kundenliste (keine Kassen-/POS-Anbindung). Basis für
// personalisierte Kundenbindungs-Nachrichten (Geburtstag, Rückgewinnung).
export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, birthday, lastVisit, notes } = body;

  if (!name) {
    return NextResponse.json({ error: "name ist erforderlich." }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email: email ?? null,
      phone: phone ?? null,
      birthday: birthday ? new Date(birthday) : null,
      lastVisit: lastVisit ? new Date(lastVisit) : null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ customer }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, name, email, phone, birthday, lastVisit, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(birthday !== undefined ? { birthday: birthday ? new Date(birthday) : null } : {}),
      ...(lastVisit !== undefined ? { lastVisit: lastVisit ? new Date(lastVisit) : null } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json({ customer });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id ist erforderlich." }, { status: 400 });
  }

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
