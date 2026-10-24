import type { IngredientLine } from "./ingredient-lines";
import { parseQuantity } from "./ingredient-lines";

export interface VersionInput {
  sourceUrl: string;
  /** Raw form values, empty when not entered */
  rating: string;
  voteCount: string;
  lines: IngredientLine[];
}

export interface ValidVersion {
  sourceUrl: string;
  rating: number | null;
  voteCount: number | null;
  lines: IngredientLine[];
}

export type VersionField = "sourceUrl" | "rating" | "voteCount" | "lines";

export type VersionResult =
  { ok: true; value: ValidVersion } | { ok: false; error: VersionField };

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Checks the admin form values before they are written to the database. */
export function validateVersionInput(input: VersionInput): VersionResult {
  const sourceUrl = input.sourceUrl.trim();
  if (!isHttpUrl(sourceUrl)) return { ok: false, error: "sourceUrl" };

  let rating: number | null = null;
  if (input.rating.trim() !== "") {
    rating = parseQuantity(input.rating);
    if (rating === null || rating > 5) return { ok: false, error: "rating" };
  }

  let voteCount: number | null = null;
  if (input.voteCount.trim() !== "") {
    const votes = parseQuantity(input.voteCount);
    if (votes === null || !Number.isInteger(votes)) {
      return { ok: false, error: "voteCount" };
    }
    voteCount = votes;
  }

  const lines = input.lines.filter((line) => line.rawText.trim() !== "");
  if (lines.length === 0) return { ok: false, error: "lines" };

  return { ok: true, value: { sourceUrl, rating, voteCount, lines } };
}

const TURKISH: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** URL-safe dish slug from a Turkish name. */
export function slugify(name: string): string {
  return name
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (char) => TURKISH[char] ?? char)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
