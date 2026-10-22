export interface LogoProps {
  /** Text colour of the wordmark. The pan keeps its own colours. */
  tone?: "light" | "dark";
  className?: string;
  label: string;
}

/** The pan-and-egg mark that stands in for the "o" in Sofrana. */
export function SahanMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 40"
      aria-hidden="true"
      className={`overflow-visible ${className}`}
    >
      <rect
        x="0"
        y="17.5"
        width="7"
        height="5"
        rx="2.5"
        fill="var(--color-copper)"
      />
      <rect
        x="37"
        y="17.5"
        width="7"
        height="5"
        rx="2.5"
        fill="var(--color-copper)"
      />
      <circle
        cx="22"
        cy="20"
        r="16"
        fill="var(--color-kitchen-surface)"
        stroke="var(--color-copper)"
        strokeWidth="3.5"
      />
      <path
        d="M11.5 19.5c0-6.2 5-10.6 11-10.3 6.6.3 10.4 4.6 10 10.6-.5 5.6-5.4 9.8-11.2 9.5-5.6-.3-9.8-4.1-9.8-9.8z"
        fill="var(--color-kitchen-text)"
      />
      <circle cx="22.5" cy="19.5" r="6" fill="var(--color-saffron)" />
      <circle cx="20.6" cy="17.6" r="1.7" fill="var(--color-yolk-light)" />
    </svg>
  );
}

/** Sofrana wordmark. Size it with a text-* class; the mark scales with the font size. */
export function Logo({ tone = "dark", className = "", label }: LogoProps) {
  const color = tone === "light" ? "text-kitchen-text" : "text-ink";
  return (
    <span
      role="img"
      aria-label={label}
      className={`group font-display inline-flex items-baseline font-extrabold tracking-[-0.02em] ${color} ${className}`}
    >
      S
      <SahanMark className="mx-[0.02em] inline-block h-[0.73em] w-[0.8em] translate-y-[0.1em] transition-transform duration-500 group-hover:rotate-[-14deg] motion-reduce:transition-none" />
      frana
    </span>
  );
}
