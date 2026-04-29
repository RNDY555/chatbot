import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { trimiteDocumentInFlowise } from "../../../../lib/flowise";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const formData = await request.formData();

    const subiect = formData.get("subiect") as string | null;
    const descriere = formData.get("descriere") as string | null;
    const explicatie = formData.get("explicatie") as string | null;
    const file = formData.get("document") as File | null;

    if (!subiect || !descriere) {
      return NextResponse.json(
        { error: "Subiectul și descrierea sunt obligatorii." },
        { status: 400 }
      );
    }

    const tichetExistent = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!tichetExistent) {
      return NextResponse.json(
        { error: "Tichetul nu există." },
        { status: 404 }
      );
    }

    if (file && file.size > 0 && file.name !== "undefined") {
      if (!file.name.toLowerCase().endsWith(".docx")) {
        return NextResponse.json(
          { error: "Fișierul trebuie să fie de tip .docx." },
          { status: 400 }
        );
      }

      try {
        await trimiteDocumentInFlowise({
          ticketId: id,
          file,
        });
      } catch (e) {
        console.error("Eroare la trimiterea în flowise:", e);
      }
    }

    const tichetRezolvat = await prisma.ticket.update({
      where: { id },
      data: {
        subiect,
        descriere,
        documentText: explicatie || (file && file.size > 0 ? file.name : null),
        status: "Rezolvat",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(tichetRezolvat);
  } catch (error) {
    console.error("Eroare la rezolvarea tichetului:", error);

    return NextResponse.json(
      {
        error: "Eroare la rezolvarea tichetului.",
      },
      { status: 500 }
    );
  }
}