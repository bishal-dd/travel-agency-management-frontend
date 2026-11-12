"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Landmark,
  Loader2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/src/lib/format";
import { useRecalculateFees } from "../hooks/useRecalculateFees";
import type { BookingDetail, BookingFeeLine } from "../types/booking";

type Row = {
  key: string;
  name: string;
  sdf: BookingFeeLine | null;
  visa: BookingFeeLine | null;
};

/** One row per traveller: their SDF and visa side by side. */
function byTraveller(lines: BookingFeeLine[]): Row[] {
  const rows = new Map<string, Row>();
  for (const l of lines) {
    // "SDF · John · international rate" / "Visa · John"
    const name = l.description.split(" · ")[1] ?? l.description;
    const key = l.travellerId ?? name;
    const row = rows.get(key) ?? { key, name, sdf: null, visa: null };
    row[l.kind] = l;
    rows.set(key, row);
  }
  return [...rows.values()];
}

const cents = (v: string | null) =>
  v == null ? 0 : Math.round(Number(v) * 100);

/** SDF and visa per traveller, locked or live, with warnings and recalculation. */
export function GovernmentFees({
  booking,
  travellersDirty,
  readOnly,
}: {
  booking: BookingDetail;
  travellersDirty: boolean;
  readOnly: boolean;
}) {
  const recalc = useRecalculateFees();
  const fees = booking.fees;
  if (!fees) return null;

  const money = (v: string) => formatPrice(v, booking.currency);
  const rows = byTraveller(fees.lines);

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Landmark size={16} className="text-ink-soft" aria-hidden="true" />{" "}
          Government fees
          <span className="text-sm font-normal text-ink-soft">
            · {fees.nights} night{fees.nights === 1 ? "" : "s"}
          </span>
        </h3>
        {fees.frozen ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
            <Lock size={11} aria-hidden="true" /> Locked at confirmation
          </span>
        ) : (
          <span className="text-xs text-ink-soft">
            From today&apos;s rules · locks when confirmed
          </span>
        )}
      </div>

      {/* Notices */}
      {(fees.changedSinceFrozen ||
        fees.missingExchangeRate ||
        travellersDirty ||
        fees.warnings.length > 0) && (
        <div className="space-y-2 border-b border-line px-5 py-3 text-sm">
          {fees.frozen && fees.changedSinceFrozen && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-marigold/15 px-3 py-2">
              <span className="flex items-start gap-2 text-ink">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0 text-marigold"
                  aria-hidden="true"
                />
                Travellers, dates or fee rules changed since confirming.
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => recalc.mutate(booking.id)}
                  disabled={recalc.isPending}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-white hover:bg-lagoon-deep disabled:opacity-60"
                >
                  {recalc.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  Recalculate fees
                </button>
              )}
            </div>
          )}
          {recalc.error && (
            <p className="text-red-700">{recalc.error.message}</p>
          )}
          {fees.missingExchangeRate && (
            <p className="flex items-start gap-2 text-ink">
              <AlertTriangle
                size={15}
                className="mt-0.5 shrink-0 text-marigold"
                aria-hidden="true"
              />
              <span>
                No exchange rate for {fees.missingExchangeRate}, so some fees
                can&apos;t be worked out.{" "}
                <Link
                  href="/dashboard/settings/exchange-rates"
                  className="font-semibold text-lagoon-deep hover:underline"
                >
                  Add it
                </Link>
              </span>
            </p>
          )}
          {travellersDirty && (
            <p className="text-ink-soft">
              Save the booking to update fees for your traveller changes.
            </p>
          )}
          {fees.warnings.map((w) => (
            <p key={w} className="flex items-start gap-2 text-ink-soft">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />{" "}
              {w}
            </p>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-soft">
          {fees.nights === 0
            ? "No SDF for a same-day trip."
            : "No government fees for these travellers."}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th scope="col" className="px-5 pb-1 pt-3 font-semibold">
                Traveller
              </th>
              <th scope="col" className="px-3 pb-1 pt-3 font-semibold">
                SDF
              </th>
              <th scope="col" className="px-3 pb-1 pt-3 font-semibold">
                Visa
              </th>
              <th
                scope="col"
                className="px-5 pb-1 pt-3 text-right font-semibold"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const band = r.sdf?.description.split(" · ")[2];
              const missing =
                (r.sdf && r.sdf.amount == null) ||
                (r.visa && r.visa.amount == null);
              const amount =
                cents(r.sdf?.amount ?? null) + cents(r.visa?.amount ?? null);
              return (
                <tr key={r.key}>
                  <th
                    scope="row"
                    className="px-5 py-2.5 text-left font-medium text-ink"
                  >
                    {r.name}
                  </th>
                  <td className="px-3 py-2.5 text-ink-soft">
                    {r.sdf ? (
                      <>
                        <span className="tabular-nums">
                          {r.sdf.quantity} ×{" "}
                          {formatPrice(r.sdf.unitAmount, r.sdf.sourceCurrency)}
                        </span>
                        {band && <span className="block text-xs">{band}</span>}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-ink-soft">
                    {r.visa
                      ? formatPrice(r.visa.unitAmount, r.visa.sourceCurrency)
                      : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {missing ? (
                      <span className="text-xs font-normal text-marigold">
                        needs rate
                      </span>
                    ) : (
                      money((amount / 100).toFixed(2))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-line text-sm">
            <tr>
              <td colSpan={3} className="px-5 py-2.5 text-ink-soft">
                SDF {money(fees.sdf)} · Visa {money(fees.visa)} · passed on at
                cost
              </td>
              <td className="px-5 py-2.5 text-right font-bold tabular-nums text-ink">
                {money(fees.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
