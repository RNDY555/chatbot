import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nume, prenume, email, password, departament, rol } = body;

    if (!email || !password || !nume || !prenume) {
      return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
    }

    // Această linie transformă "1234" în "$2b$10$X..."
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        nume,
        prenume,
        email: email.toLowerCase().trim(),
        password: hashedPassword, // SALVĂM VARIANTA CRIPTATĂ
        departament: departament,
        rol: rol || "MEMBRU",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Acest email este deja înregistrat." }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare la baza de date." }, { status: 500 });
  }
}