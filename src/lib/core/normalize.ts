export interface DensityInfo {
  gramsPerMl: number | null;
  gramsPerPiece: number | null;
}

/** Lowercases with Turkish rules, strips diacritics and collapses spaces. */
export function normalizeText(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const VOLUME_ML: Record<string, number> = {
  "su bardagi": 200,
  sb: 200,
  "cay bardagi": 100,
  cb: 100,
  "yemek kasigi": 15,
  yk: 15,
  "tatli kasigi": 10,
  tk: 10,
  "cay kasigi": 5,
  ck: 5,
  ml: 1,
  cl: 10,
  dl: 100,
  l: 1000,
  lt: 1000,
  litre: 1000,
};

const WEIGHT_G: Record<string, number> = {
  g: 1,
  gr: 1,
  gram: 1,
  kg: 1000,
  kilo: 1000,
  kilogram: 1000,
};

const PIECE_UNITS = new Set(["adet", "tane", "buyuk", "orta", "kucuk"]);

/** Milliliters in one unit, or null when the unit is not a volume. */
export function unitToMl(unit: string | null): number | null {
  if (unit === null) return null;
  return VOLUME_ML[normalizeText(unit)] ?? null;
}

/**
 * Converts a quantity to grams using the ingredient's density or piece weight.
 * Returns null whenever the data needed for a trustworthy answer is missing.
 */
export function toGrams(
  quantity: number | null,
  unit: string | null,
  density: DensityInfo | null,
): number | null {
  if (quantity === null) return null;

  const key = unit === null ? null : normalizeText(unit);

  if (key !== null && key in WEIGHT_G) return quantity * WEIGHT_G[key]!;

  const ml = unitToMl(unit);
  if (ml !== null) {
    if (density?.gramsPerMl == null) return null;
    return quantity * ml * density.gramsPerMl;
  }

  if (key === null || PIECE_UNITS.has(key)) {
    if (density?.gramsPerPiece == null) return null;
    return quantity * density.gramsPerPiece;
  }

  return null;
}

const LEADING_AMOUNT =
  /^[\d\s.,/]+(?:(?:adet|tane|gr|g|kg|ml|l|lt|litre|su bardagi|cay bardagi|yemek kasigi|tatli kasigi|cay kasigi)\b)?\s*/;

/**
 * Maps an ingredient name to its canonical slug through the synonym table
 * (keys are normalized names). Returns null when the name is unknown.
 */
export function canonicalName(
  name: string,
  synonyms: ReadonlyMap<string, string>,
): string | null {
  const normalized = normalizeText(name);
  const direct = synonyms.get(normalized);
  if (direct !== undefined) return direct;

  const stripped = normalized.replace(LEADING_AMOUNT, "").trim();
  return synonyms.get(stripped) ?? null;
}
