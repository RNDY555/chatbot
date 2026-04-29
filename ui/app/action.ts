"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; 

const prisma = new PrismaClient();


export async function checkLogin(email: string, parola: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, 
    });

    if (!user) {
      return { error: "Email-ul nu există în baza de date." };
    }

    let parolaCorecta = false;
    if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
      parolaCorecta = await bcrypt.compare(parola, user.password);
    } else {
      parolaCorecta = parola === user.password;
    }

    if (!parolaCorecta) {
      return { error: "Parola este incorectă." };
    }

    return { success: true, user };
    
  } catch (error) {
    console.error("Eroare la checkLogin:", error);
    return { error: "Eroare de sistem la conectare." };
  }
}


export async function saveMessage(userId: string, text: string, sender: "user" | "bot") {
  try {
    return await prisma.message.create({
      data: { userId, text, sender }
    });
  } catch (error) {
    console.error("Eroare la salvarea mesajului:", error);
    throw new Error("Nu s-a putut salva mesajul.");
  }
}

export async function getChatHistory(userId: string) {
  try {
    return await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' } 
    });
  } catch (error) {
    console.error("Eroare la recuperarea istoricului:", error);
    return [];
  }
}