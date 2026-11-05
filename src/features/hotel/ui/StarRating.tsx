"use client";

import { Star } from "lucide-react";

/** Read-only stars for the list. */
export function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-sm text-ink-soft">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} star`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          aria-hidden="true"
          className={i < value ? "fill-marigold text-marigold" : "text-line"}
        />
      ))}
    </span>
  );
}

/** Clickable 1–5 picker for the form. Click the current value again to clear it. */
export function StarPicker({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Star rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = !!value && n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(value === n ? undefined : n)}
            className="grid size-9 place-items-center rounded-lg transition-colors hover:bg-mist"
          >
            <Star
              size={20}
              className={on ? "fill-marigold text-marigold" : "text-line"}
            />
          </button>
        );
      })}
    </div>
  );
}
