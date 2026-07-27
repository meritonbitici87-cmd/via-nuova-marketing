import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.create({
    data: {
      name: "Via Nuova",
      address: "Neue Straße 22, 89073 Ulm",
      specialties: [
        "Pizza",
        "Pasta",
        "Pizzabowl (Pizzateig-Bowl mit Pasta nach Wahl)",
        "Hausgemachtes Tiramisu mit Pistazien-Creme (wählbar)",
        "Hausgemachte Panna Cotta mit Pistazien-Creme (wählbar)",
      ],
      toneOfVoice: "modern, herzlich, lokal verwurzelt",
    },
  });
  console.log("Business angelegt:", business);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
