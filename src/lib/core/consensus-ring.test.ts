import { describe, expect, it } from "vitest";
import { ingredientTier, recipeCount, ringDots } from "./consensus-ring";

describe("recipeCount", () => {
  it("turns a share into a whole number of recipes", () => {
    expect(recipeCount(100, 13)).toBe(13);
    expect(recipeCount(92, 13)).toBe(12);
    expect(recipeCount(46, 13)).toBe(6);
    expect(recipeCount(0, 13)).toBe(0);
  });

  it("clamps shares outside 0–100", () => {
    expect(recipeCount(140, 13)).toBe(13);
    expect(recipeCount(-5, 13)).toBe(0);
  });

  it("returns 0 when there are no recipes", () => {
    expect(recipeCount(80, 0)).toBe(0);
  });
});

describe("ingredientTier", () => {
  it("puts 60% and above in the core list", () => {
    expect(ingredientTier(60)).toBe("core");
    expect(ingredientTier(100)).toBe("core");
  });

  it("makes 25% up to 60% optional", () => {
    expect(ingredientTier(25)).toBe("optional");
    expect(ingredientTier(59.9)).toBe("optional");
  });

  it("drops anything under 25%", () => {
    expect(ingredientTier(24.9)).toBe("dropped");
    expect(ingredientTier(0)).toBe("dropped");
  });
});

describe("ringDots", () => {
  it("returns one dot per recipe, filled for those that use the ingredient", () => {
    const dots = ringDots(12, 13, 28, 36);
    expect(dots).toHaveLength(13);
    expect(dots.filter((d) => d.filled)).toHaveLength(12);
    expect(dots[12]?.filled).toBe(false);
  });

  it("starts at the top and goes clockwise", () => {
    const dots = ringDots(1, 4, 10, 20);
    expect(dots[0]).toEqual({ x: 20, y: 10, filled: true });
    expect(dots[1]?.x).toBeCloseTo(30);
    expect(dots[1]?.y).toBeCloseTo(20);
  });

  it("returns no dots when there are no recipes", () => {
    expect(ringDots(0, 0, 28, 36)).toEqual([]);
  });
});
