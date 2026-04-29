const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const [
    ,
    ,
    email,
    parola,
    nume = "Admin",
    prenume = "Principal",
    departament = "IT",
    rol = "ADMIN",
  ] = process.argv;

  if (!email || !parola) {
    console.log("Folosire:");
    console.log("node scripts/create-user.cjs email parola nume prenume departament rol");
    console.log("");
    console.log("Exemplu:");
    console.log('node scripts/create-user.cjs admin@test.com admin12345 Admin Principal IT ADMIN');
    process.exit(1);
  }

  if (parola.length < 8) {
    console.log("Parola trebuie sa aiba cel putin 8 caractere.");
    process.exit(1);
  }

  const parolaHashuita = await bcrypt.hash(parola, 12);

  const user = await prisma.user.upsert({
    where: {
      email: email,
    },
    update: {
      password: parolaHashuita,
      nume,
      prenume,
      departament,
      rol,
    },
    create: {
      email,
      password: parolaHashuita,
      nume,
      prenume,
      departament,
      rol,
    },
  });

  console.log("Utilizator creat/actualizat cu succes:");
  console.log({
    id: user.id,
    email: user.email,
    nume: user.nume,
    prenume: user.prenume,
    departament: user.departament,
    rol: user.rol,
  });
}

main()
  .catch((error) => {
    console.error("Eroare:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });