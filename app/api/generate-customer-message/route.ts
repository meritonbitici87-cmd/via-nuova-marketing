import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateContentItem } from "@/lib/generateContentItem";

const prisma = new PrismaClient();

// Generiert eine personalisierte Kundenbindungs-Nachricht (Geburtstag oder Rückgewinnung)
// für einen konkreten Eintrag aus der Kundenliste. Nutzt dieselbe Kern-Pipeline wie alle
// anderen Content-Typen (generateContentItem), speichert zusätzlich die customerId.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, customerId, type } = body;

    if (!businessId || !customerId) {
      return NextResponse.json(
        { error: "businessId und customerId sind erforderlich." },
        { status: 400 }
      );
    }
    if (type !== "customer_birthday" && type !== "customer_winback") {
      return NextResponse.json(
        { error: 'type muss "customer_birthday" oder "customer_winback" sein.' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Kunde nicht gefunden." }, { status: 404 });
    }

    let customerContext: string | undefined;
    if (type === "customer_winback" && customer.lastVisit) {
      const daysSince = Math.floor(
        (Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );
      customerContext = `War seit ${daysSince} Tagen nicht mehr da.`;
    }
    if (customer.notes) {
      customerContext = customerContext
        ? `${customerContext} ${customer.notes}`
        : customer.notes;
    }

    const contentItem = await generateContentItem({
      businessId,
      type,
      options: { customerName: customer.name, customerContext },
      customerId: customer.id,
    });

    return NextResponse.json({ contentItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler bei der Kundennachricht-Generierung:", error);
    if (message === "Business nicht gefunden.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Interner Fehler bei der Kundennachricht-Generierung." },
      { status: 500 }
    );
  }
}
