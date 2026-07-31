import { NextRequest, NextResponse } from "next/server";
import { generateContentItem } from "@/lib/generateContentItem";
import { validateOptions } from "@/lib/contentTypes";
import { GenerationOptions } from "@/lib/prompts/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessId,
      weekday,
      occasion,
      topic,
      dishName,
      offerDetails,
      season,
      holiday,
      theme,
      type = "instagram",
    } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId ist erforderlich." },
        { status: 400 }
      );
    }

    const options: GenerationOptions = {
      weekday,
      occasion,
      topic,
      dishName,
      offerDetails,
      season,
      holiday,
      ...(theme === "ambiance" ? { theme } : {}),
    };
    const missingFields = validateOptions(type, options);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Für Content-Typ "${type}" fehlen Pflichtfelder: ${missingFields.join(", ")}.` },
        { status: 400 }
      );
    }

    const contentItem = await generateContentItem({ businessId, type, options });

    return NextResponse.json({ contentItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error("Fehler bei der Content-Generierung:", error);

    if (message === "Business nicht gefunden.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.startsWith("Unbekannter Content-Typ")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Interner Fehler bei der Content-Generierung." },
      { status: 500 }
    );
  }
}
