"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  /** One-click suggestions; ones already added are hidden. */
  suggestions?: string[];
  placeholder?: string;
  invalid?: boolean;
  /** Capitalise the first letter of typed tags ("paro" → "Paro"). */
  capitalize?: boolean;
  maxTags?: number;
};

/**
 * Removable tags + a box to type more. Enter or comma adds, Backspace on an
 * empty box removes the last tag, duplicates are ignored (case-insensitive).
 */
export function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
  invalid,
  capitalize = false,
  maxTags = 50,
}: Props) {
  const [draft, setDraft] = useState("");
  const has = (t: string) =>
    value.some((v) => v.toLowerCase() === t.toLowerCase());

  function add(raw: string) {
    let tag = raw.trim().replace(/\s+/g, " ");
    if (!tag || has(tag) || value.length >= maxTags) return;
    if (capitalize) tag = tag.charAt(0).toUpperCase() + tag.slice(1);
    onChange([...value, tag]);
  }
  const remove = (t: string) => onChange(value.filter((v) => v !== t));
  const open = suggestions.filter((s) => !has(s));

  return (
    <div className="space-y-2">
      <div
        className={`flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 focus-within:border-lagoon-deep focus-within:ring-2 focus-within:ring-lagoon-deep/20 ${
          invalid ? "border-red-500" : "border-line"
        }`}
      >
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex h-7 max-w-full items-center gap-1 rounded-full bg-lagoon-tint pl-3 pr-1 text-sm font-semibold text-lagoon-deep"
          >
            <span className="truncate">{t}</span>
            <button
              type="button"
              onClick={() => remove(t)}
              aria-label={`Remove ${t}`}
              className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-lagoon-deep/10"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault(); // don't submit the surrounding form
              add(draft);
              setDraft("");
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]!);
            }
          }}
          onBlur={() => {
            add(draft);
            setDraft("");
          }}
          aria-invalid={invalid}
          placeholder={value.length ? "Add another…" : placeholder}
          className="h-7 min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-ink-soft/70"
        />
      </div>

      {open.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Suggestions"
        >
          {open.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-line px-2.5 text-xs font-medium text-ink-soft transition-colors hover:border-lagoon-deep hover:bg-lagoon-tint hover:text-lagoon-deep"
            >
              <Plus size={11} /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
