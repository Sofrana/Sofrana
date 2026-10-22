"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  label: string;
  defaultId?: string;
}

/** Pill tabs (meal tabs on the home page). Arrow keys, Home and End move between tabs. */
export function Tabs({ items, label, defaultId }: TabsProps) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    const item = items[next];
    if (!item) return;
    setActive(item.id);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-2.5">
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`rounded-pill h-11 px-5 font-bold transition-colors ${
                selected
                  ? "bg-ink text-cream"
                  : "border-line text-ink hover:border-ink border-[1.5px]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) =>
        item.id === active ? (
          <div
            key={item.id}
            id={`${baseId}-panel-${item.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${item.id}`}
            tabIndex={0}
            className="mt-6"
          >
            {item.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
