export interface IngredientLine {
  /** The line as pasted from the source, kept for the normalization script */
  rawText: string;
  quantity: number | null;
  unit: string | null;
}

export const MAX_INGREDIENT_LINES = 60;

const BULLET = /^[\s\-–—•*·▪●]+/;

/** Splits a pasted ingredient list into trimmed, non-empty lines without bullets. */
export function splitIngredientLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(BULLET, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, MAX_INGREDIENT_LINES);
}

/** Reads "3", "1,5", "1/2" and "1 1/2". Returns null for anything else. */
export function parseQuantity(input: string): number | null {
  const text = input.trim().replace(",", ".");
  if (text === "") return null;

  const mixed = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(text);
  if (mixed) {
    const denominator = Number(mixed[3]);
    if (denominator === 0) return null;
    return Number(mixed[1] ?? 0) + Number(mixed[2]) / denominator;
  }

  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

function cleanQuantity(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function cleanUnit(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const unit = value.trim();
  return unit === "" ? null : unit;
}

/**
 * Checks the model's output against the pasted lines. The result always has
 * one entry per pasted line, so a bad answer never loses or invents ingredients.
 */
export function sanitizeParsedLines(
  raw: unknown,
  sourceLines: string[],
): IngredientLine[] {
  const items: unknown[] = Array.isArray(raw) ? raw : [];

  return sourceLines.map((source, index) => {
    const item = items[index];
    if (typeof item !== "object" || item === null) {
      return { rawText: source, quantity: null, unit: null };
    }
    const { rawText, quantity, unit } = item as Record<string, unknown>;
    return {
      rawText:
        typeof rawText === "string" && rawText.trim() !== ""
          ? rawText.trim()
          : source,
      quantity: cleanQuantity(quantity),
      unit: cleanUnit(unit),
    };
  });
}
