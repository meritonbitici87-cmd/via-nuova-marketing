import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Die App ist aktuell single-tenant (nur "Via Nuova"), daher reicht es, das erste
// (und einzige) Business zurückzugeben. Falls später Mandantenfähigkeit gebraucht wird,
// kann hier ein echter Auth-Kontext ergänzt werden.
export async function GET() {
  const business = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!business) {
    return NextResponse.json({ error: "Kein Business angelegt." }, { status: 404 });
  }

  return NextResponse.json({ business });
}
