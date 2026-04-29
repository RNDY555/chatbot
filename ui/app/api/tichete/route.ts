import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { trimiteDocumentDocxInFlowise} from "../../lib/flowise";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const tichete = await prisma.ticket.findMany({
      where: userId ? { userId } : {},
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(tichete);
  } catch (error) {
    console.error("Eroare la citirea tichetelor:", error);

    return NextResponse.json(
      { error: "Eroare la citirea tichetelor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const subiect = formData.get("subiect") as string | null;
    const descriere = formData.get("descriere") as string | null;
    const userId = formData.get("userId") as string | null;
    const file = formData.get("document") as File | null;

    if (!subiect || !descriere) {
      return NextResponse.json(
        { error: "Subiectul si descrierea sunt obligatorii." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Documentul este obligatoriu." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { error: "Fisierul trebuie sa fie de tip .docx." },
        { status: 400 }
      );
    }

    // 1. Creezi tichetul in baza de date
    const tichetNou = await prisma.ticket.create({
      data: {
        subiect,
        descriere,
        userId: userId || null,
        documentText: file.name, // folosim campul existent ca sa tinem minte numele fisierului
        status: "NEREZOLVAT",
      },
    });

    try {
      // 2. Trimiti DOAR fisierul in Flowise
      await trimiteDocumentDocxInFlowise({
        ticketId: tichetNou.id,
        file,
      });

      // 3. Daca a mers, marchezi ticketul ca rezolvat
      const tichetActualizat = await prisma.ticket.update({
        where: { id: tichetNou.id },
        data: {
          status: "REZOLVAT",
          resolvedAt: new Date(),
        },
      });

      return NextResponse.json(tichetActualizat, { status: 201 });
    } catch (flowiseError) {
      console.error("Eroare Flowise:", flowiseError);

      // Ticketul ramane creat, dar nerezolvat
      return NextResponse.json(
        {
          error: "Tichetul a fost creat, dar documentul nu a putut fi trimis in Flowise.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Eroare la crearea tichetului:", error);

    return NextResponse.json(
      { error: "Eroare la crearea tichetului." },
      { status: 500 }
    );
  }
}