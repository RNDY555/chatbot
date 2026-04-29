import { NextResponse } from "next/server";
import prisma from "../../lib/prisma"; // Asigură-te că calea către prisma e corectă

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const rol = searchParams.get("rol");
    const departament = searchParams.get("departament");

    let whereClause = {};

    if (rol === "ADMIN") {
      whereClause = {
        user: {
          departament: departament || ""
        }
      };
    } else if (userId) {
      whereClause = {
        userId: userId
      };
    }

    const tichete = await prisma.ticket.findMany({
      where: whereClause,
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
    // Acum backend-ul așteaptă text (JSON), nu fișiere (FormData)
    const body = await request.json();
    const { subiect, descriere, userId } = body;

    if (!subiect || !descriere) {
      return NextResponse.json(
        { error: "Subiectul si descrierea sunt obligatorii." },
        { status: 400 }
      );
    }

    // Creăm tichetul în baza de date fără documentText
    const tichetNou = await prisma.ticket.create({
      data: {
        subiect,
        descriere,
        userId: userId || null,
        status: "NEREZOLVAT",
      },
    });

    return NextResponse.json(tichetNou, { status: 201 });
  } catch (error) {
    console.error("Eroare la crearea tichetului:", error);
    return NextResponse.json(
      { error: "Eroare la crearea tichetului." },
      { status: 500 }
    );
  }
}