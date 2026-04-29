import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: { departament: true }
        }
      }
    });

    const luni = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];
    const currentYear = new Date().getFullYear();

    let raportData: any[] = luni.map(luna => ({ name: luna, Total: 0 }));
    let departamenteUnice = new Set<string>();

    tickets.forEach(ticket => {
      const date = new Date(ticket.createdAt);
      if (date.getFullYear() === currentYear) {
        const lunaIndex = date.getMonth();
        const departament = ticket.user?.departament || "Necunoscut";
        
        departamenteUnice.add(departament);

        if (!raportData[lunaIndex][departament]) {
          raportData[lunaIndex][departament] = 0;
        }
        raportData[lunaIndex][departament] += 1;
        
        raportData[lunaIndex].Total += 1;
      }
    });

    const lunaCurenta = new Date().getMonth();
    const dateScurtate = raportData.slice(0, lunaCurenta + 1);

    return NextResponse.json({
      data: dateScurtate,
      departamente: Array.from(departamenteUnice)
    });

  } catch (error) {
    return NextResponse.json({ error: "Eroare la generarea raportului" }, { status: 500 });
  }
}