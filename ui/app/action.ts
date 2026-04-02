"use server";

import prisma from './lib/prisma'; 

export async function checkLogin(email: string, parola: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user || user.password !== parola) {
      return { error: "Email sau parolă incorectă!" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nume: user.nume,
        prenume: user.prenume,
        departament: user.departament,
        rol: user.rol
      }
    };

  } catch (error) {
    console.error("Eroare Baza de date:", error);
    return { error: "Eroare la conectarea cu baza de date." };
  }
}