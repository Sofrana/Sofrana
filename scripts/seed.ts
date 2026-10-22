import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  // Imported after dotenv so DATABASE_URL is set when the client is created
  const { db, schema } = await import("../src/lib/db");

  await db
    .insert(schema.regions)
    .values([
      { slug: "gaziantep", nameTr: "Gaziantep", nameEn: "Gaziantep" },
      { slug: "hatay", nameTr: "Hatay", nameEn: "Hatay" },
      { slug: "izmir", nameTr: "İzmir", nameEn: "Izmir" },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.ingredients)
    .values([
      {
        slug: "patlican",
        nameTr: "patlıcan",
        nameEn: "eggplant",
        gramsPerPiece: 250,
      },
      { slug: "sogan", nameTr: "soğan", nameEn: "onion", gramsPerPiece: 110 },
      { slug: "un", nameTr: "un", nameEn: "flour", gramsPerMl: 0.5 },
    ])
    .onConflictDoNothing();

  console.log("Seed tamamlandı");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
