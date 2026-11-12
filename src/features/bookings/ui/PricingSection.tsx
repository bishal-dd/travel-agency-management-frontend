"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "../../shared/components/ConfirmDeleteDialog";
import { useDeleteBookingItem } from "../hooks/useBookingItemMutations";
import type { BookingDetail, BookingItem } from "../types/booking";
import type { BookingDraftDay } from "./bookingEditorState";
import type { LineTotals } from "./dayPlanState";
import { addDays, formatDayMonth } from "./bookingUi";
import { formatPrice } from "@/src/lib/format";
import { GovernmentFees } from "./GovernmentFees";

const cents = (v: string | null) =>
  v == null ? 0 : Math.round(Number(v) * 100);
const fromCents = (c: number) => (c / 100).toFixed(2);

/**
 * The trip's price, cost and profit, added up from each day's plan.
 * Prices are set on the day cards; this section only sums them up.
 * Includes unsaved changes, so the agent sees the effect before saving.
 */
export function PricingSection({
  booking,
  days,
  dayTotals,
  dirty,
  travellersDirty = false,
}: {
  booking: BookingDetail;
  days: BookingDraftDay[];
  dayTotals: LineTotals[];
  dirty: boolean;
  travellersDirty?: boolean;
}) {
  const remove = useDeleteBookingItem();
  const [deleting, setDeleting] = useState<BookingItem | null>(null);
  const { currency } = booking;
  const money = (v: string) => formatPrice(v, currency);
  const readOnly =
    booking.status === "completed" || booking.status === "cancelled";

  // Clear an old delete error each time the confirmation opens.
  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  // Lines added before day plans existed, not tied to a day.
  const extras = (booking.items ?? []).filter((i) => i.dayNumber == null);

  let price = 0;
  let cost = 0;
  let withoutCost = 0;
  let needsPrice = 0;
  let pending = 0;
  for (const t of dayTotals) {
    price += t.priceCents;
    cost += t.costCents;
    withoutCost += t.withoutCost;
    needsPrice += t.needsPrice;
    pending += t.pending;
  }
  for (const e of extras) {
    price += cents(e.lineTotal);
    cost += cents(e.lineCost);
    if (e.lineCost == null) withoutCost += 1;
  }
  const lineCount =
    days.reduce((n, d) => n + d.lines.length, 0) + extras.length;

  // GST on the (possibly unsaved) trip price, at the booking's rate.
  const gst = booking.gst ?? null;
  const bp = gst ? Math.round(Number(gst.rate) * 100) : 0; // 5% → 500
  const gstCents = !gst
    ? 0
    : gst.inclusive
      ? Math.round((price * bp) / (10_000 + bp))
      : Math.round((price * bp) / 10_000);
  const feesCents = cents(booking.fees?.total ?? null);
  const totalCents = price + (gst && !gst.inclusive ? gstCents : 0) + feesCents;
  // Profit leaves out GST (it's the government's) and fees (passed on at cost).
  const netPrice = price - (gst?.inclusive ? gstCents : 0);
  const profit = netPrice - cost;
  const margin =
    withoutCost === 0 && netPrice > 0
      ? Math.round((profit / netPrice) * 100)
      : null;

  return (
    <section aria-labelledby="pricing-heading" className="mt-8">
      <h2 id="pricing-heading" className="mb-3 text-lg font-bold text-ink">
        Trip pricing{" "}
        <span className="text-sm font-semibold text-ink-soft">
          · {currency}
        </span>
      </h2>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          {/* Day by day */}
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {lineCount === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold text-ink">Nothing priced yet</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                  On each day above, add the hotel, vehicle, guide and services.
                  Their rates fill in the price and cost, and the trip total
                  adds up here.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-semibold">
                      Day
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2.5 text-right font-semibold"
                    >
                      Cost
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2.5 text-right font-semibold"
                    >
                      Profit
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-2.5 text-right font-semibold"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {days.map((d, i) => {
                    const t = dayTotals[i]!;
                    return (
                      <tr key={d.key}>
                        <th
                          scope="row"
                          className="px-5 py-2.5 text-left font-normal"
                        >
                          <span className="font-semibold text-ink">
                            Day {i + 1}
                          </span>{" "}
                          <span className="text-ink-soft">
                            · {formatDayMonth(addDays(booking.startDate, i))} ·{" "}
                            {d.title || "Untitled"}
                          </span>
                          {(t.needsPrice > 0 || t.pending > 0) && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-marigold">
                              <AlertTriangle size={12} aria-hidden="true" />
                              {t.needsPrice > 0 ? "needs a price" : "pricing…"}
                            </span>
                          )}
                        </th>
                        <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                          {d.lines.length ? money(t.cost) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                          {d.lines.length ? money(t.profit) : "—"}
                        </td>
                        <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-ink">
                          {d.lines.length ? money(t.price) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {extras.map((e) => (
                    <tr key={e.id}>
                      <th
                        scope="row"
                        className="px-5 py-2.5 text-left font-normal"
                      >
                        <span className="font-semibold text-ink">Extra</span>{" "}
                        <span className="text-ink-soft">· {e.description}</span>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => setDeleting(e)}
                            aria-label={`Remove ${e.description}`}
                            className="ml-2 inline-grid size-6 place-items-center rounded align-middle text-ink-soft hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </th>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                        {e.lineCost != null ? money(e.lineCost) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                        {e.lineCost != null
                          ? money(
                              fromCents(cents(e.lineTotal) - cents(e.lineCost)),
                            )
                          : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-ink">
                        {money(e.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <GovernmentFees
            booking={booking}
            travellersDirty={travellersDirty}
            readOnly={readOnly}
          />
        </div>

        {/* Totals */}
        <aside
          aria-label="Totals"
          className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-20"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Total to pay
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-ink">
            {money(fromCents(totalCents))}
          </p>
          <p className="text-xs text-ink-soft">
            {days.length} day{days.length === 1 ? "" : "s"} · {lineCount} line
            {lineCount === 1 ? "" : "s"}
          </p>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Trip price</dt>
              <dd className="tabular-nums text-ink">
                {money(fromCents(price))}
              </dd>
            </div>
            {gst && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">
                  {gst.inclusive ? "Includes GST" : "GST"} {Number(gst.rate)}%
                </dt>
                <dd
                  className={`tabular-nums ${gst.inclusive ? "text-ink-soft" : "text-ink"}`}
                >
                  {gst.inclusive
                    ? `(${money(fromCents(gstCents))})`
                    : money(fromCents(gstCents))}
                </dd>
              </div>
            )}
            {booking.fees && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Government fees</dt>
                <dd className="tabular-nums text-ink">
                  {money(fromCents(feesCents))}
                </dd>
              </div>
            )}
          </dl>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Trip cost</dt>
              <dd className="tabular-nums text-ink">
                {money(fromCents(cost))}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Profit</dt>
              <dd
                className={`font-semibold tabular-nums ${profit < 0 ? "text-red-600" : "text-ink"}`}
              >
                {money(fromCents(profit))}
                {margin != null && (
                  <span className="ml-1 text-xs font-normal text-ink-soft">
                    ({margin}%)
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {(dirty ||
            needsPrice > 0 ||
            pending > 0 ||
            (lineCount > 0 && withoutCost > 0)) && (
            <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs text-ink-soft">
              {dirty && <li>Includes unsaved changes to the days.</li>}
              {pending > 0 && (
                <li>
                  Looking up {pending} rate{pending === 1 ? "" : "s"}…
                </li>
              )}
              {needsPrice > 0 && (
                <li className="flex gap-1.5">
                  <AlertTriangle
                    size={13}
                    className="mt-px shrink-0 text-marigold"
                    aria-hidden="true"
                  />
                  {needsPrice} line{needsPrice === 1 ? " has" : "s have"} no
                  rate and need{needsPrice === 1 ? "s" : ""} a price.
                </li>
              )}
              {withoutCost > 0 && (
                <li className="flex gap-1.5">
                  <AlertTriangle
                    size={13}
                    className="mt-px shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                  {withoutCost} line{withoutCost === 1 ? " has" : "s have"} no
                  cost, so profit is incomplete.
                </li>
              )}
            </ul>
          )}
        </aside>
      </div>

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Remove extra?"
        confirmLabel="Remove"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(
            { bookingId: booking.id, itemId: deleting.id },
            { onSuccess: () => setDeleting(null) },
          )
        }
      >
        <p>
          <span className="font-semibold text-ink">
            {deleting?.description}
          </span>
          {deleting && ` (${formatPrice(deleting.lineTotal, currency)})`} will
          be removed from this booking.
        </p>
      </ConfirmDeleteDialog>
    </section>
  );
}
