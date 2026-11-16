"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, X } from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import { useTripSettings, useUpdateTripSettings } from "../hooks/useTrips";
import type { ChecklistTemplateItem } from "../types/trip";

const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

type Row = { key: number; label: string; daysBefore: string };

let nextKey = 1;
const toRows = (items: ChecklistTemplateItem[]): Row[] =>
  items.map((i) => ({
    key: nextKey++,
    label: i.label,
    daysBefore: i.daysBefore == null ? "" : String(i.daysBefore),
  }));
const toItems = (rows: Row[]): ChecklistTemplateItem[] =>
  rows.map((r) => ({
    label: r.label.trim(),
    daysBefore: r.daysBefore === "" ? null : Number(r.daysBefore),
  }));

/** /dashboard/settings/trips — the checklist every new trip starts with. */
export function TripSettingsPage() {
  const { data: settings, isPending, error } = useTripSettings();
  const save = useUpdateTripSettings();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const key = settings ? JSON.stringify(settings.checklist) : null;
  useEffect(() => {
    if (settings) setRows(toRows(settings.checklist));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (isPending || (!rows && !error))
    return <div className="h-72 max-w-3xl animate-pulse rounded-2xl bg-mist" />;
  if (error || !rows)
    return (
      <p className="text-sm text-red-700">
        Couldn&apos;t load trip settings: {error?.message}
      </p>
    );

  const dirty =
    !!settings &&
    JSON.stringify(toItems(rows)) !== JSON.stringify(settings.checklist);
  const change = (next: Row[]) => {
    setRows(next);
    setSaved(false);
    setFormError(null);
  };
  const update = (key: number, patch: Partial<Row>) =>
    change(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + dir]] = [next[i + dir]!, next[i]!];
    change(next);
  };

  function onSave() {
    if (!rows) return;
    if (rows.some((r) => !r.label.trim()))
      return setFormError(
        "Every item needs a name (or remove the empty ones).",
      );
    if (rows.some((r) => r.daysBefore !== "" && Number(r.daysBefore) > 365))
      return setFormError("Use 365 days or fewer.");
    save.mutate(toItems(rows), { onSuccess: () => setSaved(true) });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Trip checklist
        </h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          What every confirmed trip needs before the guests arrive. Each trip
          gets its own copy that you can tick off and add to.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-white">
        <div className="hidden grid-cols-[minmax(0,1fr)_9.5rem_5.5rem] gap-3 border-b border-line bg-mist/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft sm:grid">
          <span>Item</span>
          <span>Due</span>
          <span className="sr-only">Actions</span>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-soft">
            No items. New trips will start with an empty checklist.
          </p>
        ) : (
          <ol className="divide-y divide-line">
            {rows.map((r, i) => (
              <li
                key={r.key}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_9.5rem_5.5rem]"
              >
                <input
                  value={r.label}
                  onChange={(e) => update(r.key, { label: e.target.value })}
                  aria-label={`Item ${i + 1}`}
                  placeholder="e.g. Visa clearance received"
                  maxLength={200}
                  className={`${inputCls} col-span-2 sm:col-span-1`}
                />
                <label className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <input
                    value={r.daysBefore}
                    onChange={(e) =>
                      update(r.key, {
                        daysBefore: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 3),
                      })
                    }
                    inputMode="numeric"
                    aria-label={`Days before arrival for item ${i + 1}`}
                    placeholder="–"
                    className={`${sizedInputCls} w-14 text-center tabular-nums`}
                  />
                  <span className="whitespace-nowrap">days before</span>
                </label>
                <div className="flex justify-end gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink disabled:opacity-30"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    aria-label="Move down"
                    className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink disabled:opacity-30"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => change(rows.filter((x) => x.key !== r.key))}
                    aria-label={`Remove ${r.label || "item"}`}
                    className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-700"
                  >
                    <X size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() =>
              change([...rows, { key: nextKey++, label: "", daysBefore: "" }])
            }
            disabled={rows.length >= 30}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-lagoon-deep hover:underline disabled:opacity-50"
          >
            <Plus size={15} aria-hidden="true" /> Add item
          </button>
        </div>

        <p className="mx-5 rounded-xl bg-lagoon-tint px-4 py-3 text-sm text-lagoon-deep">
          Leave &ldquo;days before&rdquo; empty for items with no deadline.
          Changes apply to trips opened from now on; trips that already have a
          checklist keep theirs.
        </p>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-line px-5 py-4">
          <p className="flex-1 text-sm">
            {formError || save.error ? (
              <span className="text-red-700">
                {formError ?? save.error?.message}
              </span>
            ) : saved && !dirty ? (
              <span className="text-lagoon-deep">Saved.</span>
            ) : settings?.isDefault && !dirty ? (
              <span className="text-ink-soft">
                This is HMT&apos;s suggested list.
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={save.isPending || !dirty}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep disabled:opacity-50"
          >
            {save.isPending && <Loader2 size={15} className="animate-spin" />}
            Save
          </button>
        </div>
      </section>
    </div>
  );
}
