/** How an ingredient is treated in the consensus recipe, based on how many source recipes use it. */
export type IngredientTier = "core" | "optional" | "dropped";

export interface RingDot {
  x: number;
  y: number;
  filled: boolean;
}

/** Share thresholds (percent of source recipes) shown in the "Neden böyle?" panel. */
export const CORE_THRESHOLD = 60;
export const OPTIONAL_THRESHOLD = 25;

/** Number of source recipes that a share (0–100) stands for, rounded to a whole recipe. */
export function recipeCount(
  sharePercent: number,
  totalRecipes: number,
): number {
  if (totalRecipes <= 0) return 0;
  const share = Math.min(100, Math.max(0, sharePercent));
  return Math.round((share / 100) * totalRecipes);
}

export function ingredientTier(sharePercent: number): IngredientTier {
  if (sharePercent >= CORE_THRESHOLD) return "core";
  if (sharePercent >= OPTIONAL_THRESHOLD) return "optional";
  return "dropped";
}

/**
 * Positions for the consensus ring: one dot per source recipe, laid out on a circle
 * starting at 12 o'clock and going clockwise. The first `filled` dots are marked filled.
 */
export function ringDots(
  filled: number,
  total: number,
  radius: number,
  center: number,
): RingDot[] {
  const dots: RingDot[] = [];
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    dots.push({
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      filled: i < filled,
    });
  }
  return dots;
}
