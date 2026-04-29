import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const tichet = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!tichet) {
      return NextResponse.json(
        { error: "Tichetul nu exista." },
        { status: 404 }
      );
    }

    return NextResponse.json(tichet);
  } catch (error) {
    console.error("Eroare la citirea tichetului:", error);

    return NextResponse.json(
      { error: "Eroare la citirea tichetului." },
      { status: 500 }
    );
  }
}