"use client";

import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Status } from "./FormBits";

/** Page title + primary "Add" button, same as the Hotels page. */
export function ListHeader({
  title,
  description,
  addLabel,
  onAdd,
}: {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep sm:self-auto"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

export type Filter = "all" | Status;

/** Search box + All / Active / Inactive tabs with counts. */
export function ListToolbar({
  query,
  onQuery,
  placeholder,
  filter,
  onFilter,
  counts,
  busy,
}: {
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
  filter: Filter;
  onFilter: (f: Filter) => void;
  /** Optional per-tab counts (only possible when the whole list is loaded). */
  counts?: Record<Filter, number>;
  /** Shows a spinner in the search box while results load. */
  busy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30 sm:w-80">
        {busy ? (
          <Loader2
            size={14}
            aria-hidden="true"
            className="shrink-0 animate-spin"
          />
        ) : (
          <Search size={14} aria-hidden="true" className="shrink-0" />
        )}
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-soft"
        />
      </label>

      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex gap-1 self-start rounded-full bg-mist p-1 sm:self-auto"
      >
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={filter === f}
            onClick={() => onFilter(f)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-white text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {f}
            {counts && (
              <span className="text-xs text-ink-soft">{counts[f]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRows() {
  return (
    <div className="divide-y divide-line" aria-label="Loading">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="size-10 animate-pulse rounded-full bg-mist" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-mist" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-mist" />
          </div>
          <div className="hidden h-5 w-16 animate-pulse rounded-full bg-mist sm:block" />
        </div>
      ))}
    </div>
  );
}

export function ListMessage({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-16 text-center">
      {icon && (
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-lagoon-tint text-lagoon-deep">
          {icon}
        </span>
      )}
      <p className="font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function RowActions({
  label,
  onEdit,
  onDelete,
}: {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        title="Edit"
        className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        title="Delete"
        className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
