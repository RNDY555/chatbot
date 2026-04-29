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
    const body = await request.json();

    const { subiect, descriere, documentText } = body;

    if (!subiect || !descriere || !documentText) {
      return NextResponse.json(
        { error: "Subiectul, descrierea si documentul sunt obligatorii." },
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
      subiect,
      descriere,
      documentText,
    });

    const tichetRezolvat = await prisma.ticket.update({
      where: { id },
      data: {
        subiect,
        descriere,
        documentText,
        status: "REZOLVAT",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(tichetRezolvat);
  } catch (error) {
    console.error("Eroare la rezolvarea tichetului:", error);

    return NextResponse.json(
      { error: "Eroare la rezolvarea tichetului sau la trimiterea in Flowise." },
      { status: 500 }
    );
  }
}