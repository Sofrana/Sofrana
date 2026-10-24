"use server";

import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { parseIngredientLines } from "@/lib/ai/parse-ingredients";
import {
  splitIngredientLines,
  type IngredientLine,
} from "@/lib/core/ingredient-lines";
import {
  slugify,
  validateVersionInput,
  type VersionField,
} from "@/lib/core/version-input";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: await getLocale() });
}

async function isSignedIn(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user !== null;
}

export type ParseResult =
  | { ok: true; lines: IngredientLine[] }
  | { ok: false; error: "unauthorized" | "empty" | "failed" };

/** "Paste and split": Claude Haiku turns pasted ingredient lines into rows. */
export async function parseIngredients(text: string): Promise<ParseResult> {
  if (!(await isSignedIn())) return { ok: false, error: "unauthorized" };

  const lines = splitIngredientLines(text);
  if (lines.length === 0) return { ok: false, error: "empty" };

  try {
    return { ok: true, lines: await parseIngredientLines(lines) };
  } catch (error) {
    console.error("parseIngredients failed", error);
    return { ok: false, error: "failed" };
  }
}

export type DishChoice =
  | { kind: "existing"; dishId: string }
  | {
      kind: "new";
      nameTr: string;
      nameEn: string;
      meal: "breakfast" | "soup" | "main" | "side" | "dessert";
    };

export interface SaveVersionPayload {
  dish: DishChoice;
  sourceUrl: string;
  rating: string;
  voteCount: string;
  lines: IngredientLine[];
}

export type SaveResult =
  | { ok: true; dishId: string }
  | {
      ok: false;
      error: "unauthorized" | "dish" | "failed" | VersionField;
    };

/** Saves one recipe version and its ingredient rows, creating the dish if needed. */
export async function saveVersion(
  payload: SaveVersionPayload,
): Promise<SaveResult> {
  if (!(await isSignedIn())) return { ok: false, error: "unauthorized" };

  const checked = validateVersionInput(payload);
  if (!checked.ok) return checked;
  const version = checked.value;

  const { dish } = payload;
  if (dish.kind === "new") {
    if (slugify(dish.nameTr) === "") return { ok: false, error: "dish" };
  } else if (dish.dishId === "") {
    return { ok: false, error: "dish" };
  }

  try {
    // Imported here so a missing DATABASE_URL does not break `next build`
    const { db, schema } = await import("@/lib/db");

    const dishId = await db.transaction(async (tx) => {
      let id: string;
      if (dish.kind === "new") {
        const nameTr = dish.nameTr.trim();
        const [created] = await tx
          .insert(schema.dishes)
          .values({
            slug: slugify(nameTr),
            nameTr,
            nameEn: dish.nameEn.trim() || nameTr,
            meal: dish.meal,
          })
          .returning({ id: schema.dishes.id });
        if (!created) throw new Error("dish insert failed");
        id = created.id;
      } else {
        const [existing] = await tx
          .select({ id: schema.dishes.id })
          .from(schema.dishes)
          .where(eq(schema.dishes.id, dish.dishId));
        if (!existing) throw new Error("dish not found");
        id = existing.id;
      }

      const [saved] = await tx
        .insert(schema.recipeVersions)
        .values({
          dishId: id,
          sourceUrl: version.sourceUrl,
          rating: version.rating,
          voteCount: version.voteCount,
        })
        .returning({ id: schema.recipeVersions.id });

      if (!saved) throw new Error("version insert failed");

      await tx.insert(schema.versionIngredients).values(
        version.lines.map((line) => ({
          versionId: saved.id,
          rawText: line.rawText.trim(),
          quantity: line.quantity,
          unit: line.unit,
        })),
      );

      return id;
    });

    return { ok: true, dishId };
  } catch (error) {
    console.error("saveVersion failed", error);
    return { ok: false, error: "failed" };
  }
}
