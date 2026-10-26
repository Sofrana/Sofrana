import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { eq } from "drizzle-orm";

import {
  canonicalName,
  normalizeText,
  toGrams,
} from "../../src/lib/core/normalize";
import { SYNONYM_GROUPS } from "./synonyms";

config({ path: ".env.local" });

const REVIEW_FILE = "scripts/pipeline/unmatched.json";

/**
 * Fills ingredient_id and grams on version_ingredients. Lines that cannot be
 * matched are written to a review file instead of being guessed.
 */
async function main() {
  // Imported after dotenv so DATABASE_URL is set when the client is created
  const { db, schema } = await import("../../src/lib/db");

  const ingredients = await db.select().from(schema.ingredients);
  const bySlug = new Map(ingredients.map((i) => [i.slug, i]));

  const synonyms = new Map<string, string>();
  for (const i of ingredients) {
    synonyms.set(normalizeText(i.nameTr), i.slug);
    synonyms.set(normalizeText(i.nameEn), i.slug);
  }
  for (const [slug, names] of Object.entries(SYNONYM_GROUPS)) {
    for (const name of names) synonyms.set(normalizeText(name), slug);
  }

  const lines = await db.select().from(schema.versionIngredients);
  const unmatched: { id: string; rawText: string }[] = [];
  let updated = 0;

  for (const line of lines) {
    const slug = canonicalName(line.rawText, synonyms);
    const ingredient = slug ? bySlug.get(slug) : undefined;
    if (!ingredient) {
      unmatched.push({ id: line.id, rawText: line.rawText });
      continue;
    }

    await db
      .update(schema.versionIngredients)
      .set({
        ingredientId: ingredient.id,
        grams: toGrams(line.quantity, line.unit, ingredient),
      })
      .where(eq(schema.versionIngredients.id, line.id));
    updated += 1;
  }

  writeFileSync(REVIEW_FILE, JSON.stringify(unmatched, null, 2));
  console.log(
    `${updated} satır eşleşti, ${unmatched.length} satır elle bakılacak (${REVIEW_FILE}).`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
