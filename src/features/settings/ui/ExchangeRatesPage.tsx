"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import {
  useExchangeRates,
  useSaveExchangeRates,
} from "../hooks/useExchangeRates";
import type { ExchangeRate } from "../types/exchangeRate";

/** inputCls without its w-full, for boxes with their own width (w-full would win and squash neighbours). */
const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

/** Suggested when the agency has none yet. INR is pegged 1:1 to BTN. */
const SUGGESTED = [
  { currency: "USD", btnPerUnit: "" },
  { currency: "INR", btnPerUnit: "1" },
  { currency: "EUR", btnPerUnit: "" },
];

type Row = { key: string; currency: string; btnPerUnit: string };

let seq = 0;
const key = () => `r-${++seq}`;
const toRows = (rates: ExchangeRate[]): Row[] =>
  (rates.length
    ? rates.map((r) => ({
        currency: r.currency,
        btnPerUnit: String(Number(r.btnPerUnit)),
      }))
    : SUGGESTED
  ).map((r) => ({ ...r, key: key() }));

const sameRows = (a: Row[], b: Row[]) =>
  JSON.stringify(
    a.map(({ currency, btnPerUnit }) => [
      currency.trim().toUpperCase(),
      Number(btnPerUnit),
    ]),
  ) ===
  JSON.stringify(
    b.map(({ currency, btnPerUnit }) => [
      currency.trim().toUpperCase(),
      Number(btnPerUnit),
    ]),
  );

export function ExchangeRatesPage() {
  const { data: rates, isPending, error } = useExchangeRates();
  const save = useSaveExchangeRates();
  const [rows, setRows] = useState<Row[]>([]);
  const [base, setBase] = useState<Row[]>([]);
  const [rowError, setRowError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fill the form only when the saved rates actually change (first load or
  // after saving). Depending on `rates` itself would reset the rows on every
  // re-render if the hook hands back a new array each time — wiping typing.
  const ratesKey = rates ? JSON.stringify(rates) : null;
  useEffect(() => {
    if (!rates) return;
    const r = toRows(rates);
    setRows(r);
    setBase(rates.length ? r : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratesKey]);

  const dirty = !sameRows(rows, base);

  function update(k: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === k ? { ...r, ...patch } : r)));
    setSaved(false);
  }

  function onSave() {
    const cleaned = rows
      .map((r) => ({
        currency: r.currency.trim().toUpperCase(),
        btnPerUnit: r.btnPerUnit.trim(),
      }))
      .filter((r) => r.currency || r.btnPerUnit);

    const bad = cleaned.find(
      (r) =>
        !/^[A-Z]{3}$/.test(r.currency) ||
        r.currency === "BTN" ||
        !(Number(r.btnPerUnit) > 0),
    );
    if (bad) {
      setRowError(
        bad.currency === "BTN"
          ? "BTN is always 1; remove that row."
          : !/^[A-Z]{3}$/.test(bad.currency)
            ? `"${bad.currency || "?"}" isn't a 3-letter currency code.`
            : `Enter a rate above 0 for ${bad.currency}.`,
      );
      return;
    }
    if (new Set(cleaned.map((r) => r.currency)).size !== cleaned.length) {
      setRowError("Each currency can only appear once.");
      return;
    }
    setRowError(null);
    save.mutate(cleaned, { onSuccess: () => setSaved(true) });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Exchange rates
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your working rates for quoting. Room, vehicle, guide and service rates
          are converted into each booking&apos;s currency with these. Bookings
          keep the rate they were priced at, so changing a rate here never
          changes an existing quote.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white">
        {isPending ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-mist" />
            ))}
          </div>
        ) : error ? (
          <p className="p-5 text-sm text-red-700">
            Couldn&apos;t load exchange rates: {error.message}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <span>1 unit of</span>
              <span>equals, in BTN</span>
            </div>

            <ul className="divide-y divide-line">
              <li className="flex items-center gap-3 px-5 py-3 text-sm text-ink-soft">
                <span className="w-24 font-mono font-semibold">BTN</span>
                <span className="flex-1 text-right">1 (always)</span>
                <span className="size-9" aria-hidden="true" />
              </li>
              {rows.map((r) => (
                <li key={r.key} className="flex items-center gap-3 px-5 py-2.5">
                  <input
                    aria-label="Currency code"
                    value={r.currency}
                    onChange={(e) =>
                      update(r.key, { currency: e.target.value.toUpperCase() })
                    }
                    maxLength={3}
                    placeholder="USD"
                    className={`${sizedInputCls} w-24 shrink-0 font-mono font-semibold uppercase`}
                  />
                  <span className="text-sm text-ink-soft">=</span>
                  <input
                    aria-label={`BTN per 1 ${r.currency || "unit"}`}
                    inputMode="decimal"
                    value={r.btnPerUnit}
                    onChange={(e) => {
                      // Digits and one decimal point only (85, 85.25).
                      const v = e.target.value.replace(/[^\d.]/g, "");
                      if (/^\d*\.?\d*$/.test(v))
                        update(r.key, { btnPerUnit: v });
                    }}
                    placeholder="e.g. 85"
                    className={`${inputCls} min-w-0 flex-1 text-right font-semibold tabular-nums`}
                  />
                  <span className="text-sm font-semibold text-ink-soft">
                    BTN
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRows((rs) => rs.filter((x) => x.key !== r.key))
                    }
                    aria-label={`Remove ${r.currency || "row"}`}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  setRows((rs) => [
                    ...rs,
                    { key: key(), currency: "", btnPerUnit: "" },
                  ])
                }
                className="inline-flex h-9 items-center gap-1.5 self-start rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
              >
                <Plus size={15} /> Add currency
              </button>
              <div className="flex items-center gap-3">
                {saved && !dirty && (
                  <span className="text-sm text-lagoon-deep">Saved</span>
                )}
                <button
                  type="button"
                  onClick={onSave}
                  disabled={save.isPending || (!dirty && base.length > 0)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-50"
                >
                  {save.isPending && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Save rates
                </button>
              </div>
            </div>

            {(rowError || save.error) && (
              <p
                role="alert"
                className="mx-5 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {rowError ?? save.error?.message}
              </p>
            )}
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-ink-soft">
        Example: with 1 USD = 85 BTN, a room costing Nu. 7,500 is $88.24 on a
        USD booking.
      </p>
    </div>
  );
}
