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
    const file = formData.get("document") as File | null;

    if (!subiect || !descriere) {
      return NextResponse.json(
        { error: "Subiectul si descrierea sunt obligatorii." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Trebuie sa incarci un fisier .docx." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { error: "Fisierul trebuie sa fie de tip .docx." },
        { status: 400 }
      );
    }

    const tichetExistent = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!tichetExistent) {
      return NextResponse.json(
        { error: "Tichetul nu exista." },
        { status: 404 }
      );
    }

    await trimiteDocumentInFlowise({
      ticketId: id,
      file,
    });
    const tichetRezolvat = await prisma.ticket.update({
      where: { id },
      data: {
        subiect,
        descriere,
        documentText: file.name,
        status: "REZOLVAT",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(tichetRezolvat);
  } catch (error) {
    console.error("Eroare la rezolvarea tichetului:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Eroare la rezolvarea tichetului.",
      },
      { status: 500 }
    );
  }
}