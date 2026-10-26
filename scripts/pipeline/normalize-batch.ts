import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { eq } from "drizzle-orm";

import { sanitizeMatch } from "../../src/lib/core/ambiguous-match";
import { toGrams } from "../../src/lib/core/normalize";

config({ path: ".env.local" });

const MODEL = "claude-haiku-5-5";
const UNMATCHED_FILE = "scripts/pipeline/unmatched.json";
const BATCH_FILE = "scripts/pipeline/batch.json";
const REVIEW_FILE = "scripts/pipeline/batch-review.json";

const TOOL_NAME = "record_match";

interface Unmatched {
  id: string;
  rawText: string;
}

interface ReviewItem extends Unmatched {
  /** Proposed ingredient slug, null when Claude found no match. Edit by hand. */
  slug: string | null;
}

function readJson<T>(path: string): T {
  if (!existsSync(path)) throw new Error(`${path} yok`);
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

async function loadSlugs(): Promise<string[]> {
  const { db, schema } = await import("../../src/lib/db");
  const rows = await db
    .select({ slug: schema.ingredients.slug })
    .from(schema.ingredients);
  return rows.map((r) => r.slug);
}

/** Sends the unmatched lines to the Batch API, one request per line. */
async function submit() {
  const lines = readJson<Unmatched[]>(UNMATCHED_FILE);
  const slugs = await loadSlugs();
  const client = new Anthropic();

  const batch = await client.messages.batches.create({
    requests: lines.map((line) => ({
      custom_id: line.id,
      params: {
        model: MODEL,
        max_tokens: 256,
        system: [
          "You match one recipe ingredient line to an ingredient slug.",
          "Pick a slug only from the given list. If none fits, answer null. Do not invent slugs.",
          `Slugs: ${slugs.join(", ")}`,
        ].join(" "),
        tools: [
          {
            name: TOOL_NAME,
            description: "Record the matching slug.",
            input_schema: {
              type: "object" as const,
              properties: { slug: { type: ["string", "null"] } },
              required: ["slug"],
            },
          },
        ],
        tool_choice: { type: "tool" as const, name: TOOL_NAME },
        messages: [{ role: "user" as const, content: line.rawText }],
      },
    })),
  });

  writeFileSync(BATCH_FILE, JSON.stringify({ id: batch.id }, null, 2));
  console.log(`Batch gönderildi: ${batch.id} (${lines.length} satır).`);
}

/** Downloads finished results into a review file for manual checking. */
async function collect() {
  const { id } = readJson<{ id: string }>(BATCH_FILE);
  const lines = readJson<Unmatched[]>(UNMATCHED_FILE);
  const known = new Set(await loadSlugs());
  const client = new Anthropic();

  const batch = await client.messages.batches.retrieve(id);
  if (batch.processing_status !== "ended") {
    console.log(`Batch henüz bitmedi (${batch.processing_status}).`);
    return;
  }

  const slugById = new Map<string, string | null>();
  for await (const entry of await client.messages.batches.results(id)) {
    if (entry.result.type !== "succeeded") continue;
    const toolUse = entry.result.message.content.find(
      (block) => block.type === "tool_use",
    );
    slugById.set(entry.custom_id, sanitizeMatch(toolUse?.input, known));
  }

  const review: ReviewItem[] = lines.map((line) => ({
    ...line,
    slug: slugById.get(line.id) ?? null,
  }));
  writeFileSync(REVIEW_FILE, JSON.stringify(review, null, 2));
  console.log(
    `${review.filter((r) => r.slug).length}/${review.length} satır için öneri var. ${REVIEW_FILE} dosyasını elle kontrol et, sonra "apply" çalıştır.`,
  );
}

/** Writes the hand-checked review file to the database. */
async function apply() {
  const review = readJson<ReviewItem[]>(REVIEW_FILE);
  const { db, schema } = await import("../../src/lib/db");
  const ingredients = await db.select().from(schema.ingredients);
  const bySlug = new Map(ingredients.map((i) => [i.slug, i]));

  let updated = 0;
  for (const item of review) {
    const ingredient = item.slug ? bySlug.get(item.slug) : undefined;
    if (!ingredient) continue;

    const [line] = await db
      .select()
      .from(schema.versionIngredients)
      .where(eq(schema.versionIngredients.id, item.id));
    if (!line) continue;

    await db
      .update(schema.versionIngredients)
      .set({
        ingredientId: ingredient.id,
        grams: toGrams(line.quantity, line.unit, ingredient),
      })
      .where(eq(schema.versionIngredients.id, item.id));
    updated += 1;
  }
  console.log(`${updated} satır güncellendi.`);
}

const commands = { submit, collect, apply };

async function main() {
  const name = process.argv[2];
  const command = commands[name as keyof typeof commands];
  if (!command) {
    throw new Error(
      "Kullanım: tsx scripts/pipeline/normalize-batch.ts submit|collect|apply",
    );
  }
  await command();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
