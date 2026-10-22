import type { ComponentProps } from "react";

export interface CardProps extends ComponentProps<"div"> {
  tone?: "light" | "dark";
}

/** Rounded surface for dish, ingredient and step content. */
export function Card({ tone = "light", className = "", ...props }: CardProps) {
  const toneClass =
    tone === "dark"
      ? "bg-kitchen-surface text-kitchen-text"
      : "border-[1.5px] border-line bg-card text-ink";
  return (
    <div className={`rounded-card p-6 ${toneClass} ${className}`} {...props} />
  );
}
