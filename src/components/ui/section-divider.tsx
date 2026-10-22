import { SahanMark } from "./logo";

/** Thin line with the pan mark in the middle, used between page sections. */
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center gap-6 py-6 ${className}`}
    >
      <span className="bg-line h-0.5 flex-1" />
      <SahanMark className="h-11 w-12" />
      <span className="bg-line h-0.5 flex-1" />
    </div>
  );
}
