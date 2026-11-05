"use client";

import { Loader2 } from "lucide-react";

/** Shared form pieces for the dashboard's add / edit dialogs. */

export const inputCls =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/70 focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20 aria-[invalid=true]:border-red-500";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
      )}
    </div>
  );
}

export type Status = "active" | "inactive";

export function StatusToggle({
  value,
  onChange,
}: {
  value: Status;
  onChange: (s: Status) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-full bg-mist p-1"
      role="group"
      aria-label="Status"
    >
      {(["active", "inactive"] as const).map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          className={`h-8 flex-1 rounded-full text-sm font-semibold capitalize transition-colors ${
            value === s
              ? "bg-white text-ink shadow-sm"
              : "text-ink-soft hover:text-ink"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/** One-click options that fill a text field, plus free typing below. */
export function ChipPicker({
  options,
  value,
  onPick,
  label,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value.toLowerCase() === o.toLowerCase();
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(o)}
            className={`h-8 rounded-full px-3.5 text-sm font-semibold transition-colors ${
              on ? "bg-ink text-white" : "bg-mist text-ink-soft hover:text-ink"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ServerError({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {error.message}
    </p>
  );
}

export function FormFooter({
  onCancel,
  isPending,
  submitLabel,
}: {
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-60"
      >
        {isPending && <Loader2 size={15} className="animate-spin" />}
        {isPending ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
