import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nume, prenume, departament, rol } = body;


    if (!email || !password || !nume || !prenume) {
      return NextResponse.json({ error: "Lipsesc campuri obligatorii." }, { status: 400 });
    }

    const userExistent = await prisma.user.findUnique({
      where: { email: email }
    });

    if (userExistent) {
      return NextResponse.json({ error: "Acest email este deja folosit." }, { status: 409 });
    }


    const nouUtilizator = await prisma.user.create({
      data: {
        email,
        password, 
        nume,
        prenume,
        departament: departament || "-",
        rol: rol || "MEMBRU"
      }
    });

    return NextResponse.json({ message: "Utilizator creat cu succes!", id: nouUtilizator.id }, { status: 201 });

  } catch (error) {
    console.error("Eroare la crearea utilizatorului:", error);
    return NextResponse.json({ error: "Eroare interna de server." }, { status: 500 });
  }
}