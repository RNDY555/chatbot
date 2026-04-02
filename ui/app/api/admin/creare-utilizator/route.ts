// app/api/admin/creare-utilizator/route.ts
import { NextResponse } from 'next/server';
// Aici importi instanta ta de Prisma (ex: import prisma from '@/lib/prisma')
import prisma from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nume, prenume, departament, rol } = body;

    // 1. Validare simpla
    if (!email || !password || !nume || !prenume) {
      return NextResponse.json({ error: "Lipsesc campuri obligatorii." }, { status: 400 });
    }

    // 2. Verificam daca email-ul exista deja
    const userExistent = await prisma.user.findUnique({
      where: { email: email }
    });

    if (userExistent) {
      return NextResponse.json({ error: "Acest email este deja folosit." }, { status: 409 });
    }

    // 3. Crearea utilizatorului in baza de date (SQLite)
    // NOTA DE HACKATHON: Aici ar trebui sa criptezi parola cu 'bcrypt',
    // dar pentru demo merge si text simplu.
    const nouUtilizator = await prisma.user.create({
      data: {
        email,
        password, // <--- PAROLA NECRIPTATA (doar pentru testare!)
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