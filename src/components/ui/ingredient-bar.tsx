import {
  ingredientTier,
  recipeCount,
  ringDots,
} from "@/lib/core/consensus-ring";

export interface IngredientBarProps {
  name: string;
  amount: string;
  /** Share of source recipes that use this ingredient, 0–100. */
  share: number;
  totalRecipes: number;
  /** Ring colour, ideally one of the ingredient tokens, e.g. "var(--color-tomato)". */
  color: string;
  /** Visible line under the amount, e.g. "13 tarifin 12'sinde". */
  caption: string;
}

/**
 * One ingredient with its consensus ring: one dot per source recipe, filled when that
 * recipe uses the ingredient. Optional ingredients get a dashed outline.
 */
export function IngredientBar({
  name,
  amount,
  share,
  totalRecipes,
  color,
  caption,
}: IngredientBarProps) {
  const count = recipeCount(share, totalRecipes);
  const optional = ingredientTier(share) !== "core";
  const dots = ringDots(count, totalRecipes, 28, 36);

  return (
    <div
      className={`rounded-card flex items-center gap-4 px-5 py-4 ${
        optional
          ? "border-line border-[1.5px] border-dashed"
          : "border-line bg-card border-[1.5px]"
      }`}
    >
      <span className="relative size-[4.5rem] flex-none">
        <svg viewBox="0 0 72 72" className="size-full" aria-hidden="true">
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={4}
              fill={d.filled ? color : "var(--color-line)"}
            />
          ))}
        </svg>
        <span className="font-display absolute inset-0 flex items-center justify-center text-lg font-extrabold">
          {count}
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-h3 font-bold">{name}</span>
        <span className="font-bold tabular-nums">{amount}</span>
        <span className="text-small text-muted">{caption}</span>
      </span>
    </div>
  );
}
