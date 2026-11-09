"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BedDouble, Loader2, Plus, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "../../shared/components/ConfirmDeleteDialog";
import {
  useAddHotelsFromDays,
  useDeleteBookingItem,
} from "../hooks/useBookingItemMutations";
import {
  BOOKING_ITEM_TYPES,
  type BookingDetail,
  type BookingItem,
  type BookingItemType,
} from "../types/booking";
import { BookingItemDialog, ITEM_TYPE_META } from "./BookingItemDialog";
import { addDays, formatDateRange, formatDayDate } from "./bookingUi";
import { formatPrice } from "@/src/lib/format";

/** "12–14 Mar · 2 nights", "12–15 Mar · 4 days", "Fri 12 Mar" */
function itemWhen(item: BookingItem) {
  if (item.type === "hotel") {
    return `${formatDateRange(item.startDate, addDays(item.endDate, -1))} · ${item.units} night${item.units === 1 ? "" : "s"}`;
  }
  if (item.type === "vehicle" || item.type === "guide") {
    return `${formatDateRange(item.startDate, item.endDate)} · ${item.units} day${item.units === 1 ? "" : "s"}`;
  }
  return formatDayDate(item.startDate);
}

function ItemRow({
  item,
  currency,
  readOnly,
  onEdit,
  onDelete,
}: {
  item: BookingItem;
  currency: string;
  readOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const money = (v: string) => formatPrice(v, currency);
  const noPrice = Number(item.unitPrice) === 0;
  const unitWord =
    item.per === "unit"
      ? ""
      : ` × ${item.units} ${item.per}${item.units === 1 ? "" : "s"}`;

  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={onEdit}
        disabled={readOnly}
        className="min-w-0 flex-1 text-left disabled:cursor-default"
      >
        <p className="truncate font-medium text-ink">{item.description}</p>
        <p className="text-sm text-ink-soft">{itemWhen(item)}</p>
        <p className="text-xs text-ink-soft">
          {item.quantity}
          {unitWord} × {money(item.unitPrice)}
          {item.unitCost != null && ` · cost ${money(item.unitCost)}`}
        </p>
        {item.notes && (
          <p className="mt-0.5 line-clamp-1 text-xs italic text-ink-soft">
            {item.notes}
          </p>
        )}
      </button>

      <div className="shrink-0 text-right">
        {noPrice ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-marigold/20 px-2 py-0.5 text-xs font-semibold text-ink">
            <AlertTriangle size={12} aria-hidden="true" /> Needs a price
          </span>
        ) : (
          <p className="font-semibold tabular-nums text-ink">
            {money(item.lineTotal)}
          </p>
        )}
        {item.lineCost != null && !noPrice && (
          <p className="text-xs tabular-nums text-ink-soft">
            cost {money(item.lineCost)}
          </p>
        )}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove ${item.description}`}
          className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      )}
    </li>
  );
}

/** Items grouped by type, totals, and the add / fill-hotels actions. */
export function PricingSection({
  booking,
  readOnly,
}: {
  booking: BookingDetail;
  readOnly: boolean;
}) {
  const fillHotels = useAddHotelsFromDays();
  const remove = useDeleteBookingItem();

  const [dialog, setDialog] = useState<{
    item: BookingItem | null;
    type: BookingItemType;
  } | null>(null);
  const [deleting, setDeleting] = useState<BookingItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { items, totals, currency } = booking;

  // Clear an old delete error each time the confirmation opens.
  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);
  const money = (v: string) => formatPrice(v, currency);
  const hasSuggestedHotels = booking.days.some((d) => d.suggestedHotel);
  const costComplete = totals.itemCount > 0 && totals.itemsWithoutCost === 0;
  const margin =
    costComplete && Number(totals.price) > 0
      ? Math.round((Number(totals.profit) / Number(totals.price)) * 100)
      : null;

  const groups = BOOKING_ITEM_TYPES.map((type) => ({
    type,
    items: items.filter((i) => i.type === type),
  })).filter((g) => g.items.length);

  function runFillHotels() {
    setNotice(null);
    fillHotels.mutate(booking.id, {
      onSuccess: (res) => setNotice(res.message ?? null),
    });
  }

  return (
    <section aria-labelledby="pricing-heading" className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="pricing-heading" className="text-lg font-bold text-ink">
          Pricing{" "}
          <span className="text-sm font-semibold text-ink-soft">
            · {currency}
          </span>
        </h2>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {hasSuggestedHotels && (
              <button
                type="button"
                onClick={runFillHotels}
                disabled={fillHotels.isPending}
                title="Create hotel stays from each day's suggested hotel"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-60"
              >
                {fillHotels.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <BedDouble size={14} />
                )}
                Fill hotels from days
              </button>
            )}
            <button
              type="button"
              onClick={() => setDialog({ item: null, type: "hotel" })}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-lagoon-deep"
            >
              <Plus size={15} /> Add item
            </button>
          </div>
        )}
      </div>

      {(notice || fillHotels.error) && (
        <p
          role="status"
          className={`mb-3 rounded-lg px-4 py-2 text-sm ${fillHotels.error ? "bg-red-50 text-red-700" : "bg-lagoon-tint text-lagoon-deep"}`}
        >
          {fillHotels.error?.message ?? notice}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Items */}
        <div className="rounded-2xl border border-line bg-white">
          {groups.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-ink">Nothing priced yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Add the hotels, transport, guide and services for this trip to
                build the quote.
              </p>
              {!readOnly && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {(["hotel", "vehicle", "guide", "service"] as const).map(
                    (t) => {
                      const M = ITEM_TYPE_META[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDialog({ item: null, type: t })}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:bg-lagoon-tint hover:text-lagoon-deep hover:ring-lagoon-deep"
                        >
                          <M.icon size={14} aria-hidden="true" /> Add{" "}
                          {M.label.toLowerCase()}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {groups.map((g) => {
                const M = ITEM_TYPE_META[g.type];
                const sub = totals.byType[g.type];
                return (
                  <div key={g.type} className="px-5 py-3">
                    <div className="flex items-center justify-between pt-1">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        <M.icon size={14} aria-hidden="true" /> {M.plural}
                      </h3>
                      {sub && (
                        <p className="text-xs font-semibold tabular-nums text-ink-soft">
                          {money(sub.price)}
                        </p>
                      )}
                    </div>
                    <ul className="divide-y divide-line">
                      {g.items.map((it) => (
                        <ItemRow
                          key={it.id}
                          item={it}
                          currency={currency}
                          readOnly={readOnly}
                          onEdit={() => setDialog({ item: it, type: it.type })}
                          onDelete={() => setDeleting(it)}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Totals */}
        <aside
          aria-label="Totals"
          className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-20"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Quote total
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-ink">
            {money(totals.price)}
          </p>
          <p className="text-xs text-ink-soft">
            {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"} · before
            government fees
          </p>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Cost</dt>
              <dd className="tabular-nums text-ink">{money(totals.cost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Profit</dt>
              <dd
                className={`font-semibold tabular-nums ${Number(totals.profit) < 0 ? "text-red-600" : "text-ink"}`}
              >
                {money(totals.profit)}
                {margin != null && (
                  <span className="ml-1 text-xs font-normal text-ink-soft">
                    ({margin}%)
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {(totals.itemsWithoutPrice > 0 ||
            (totals.itemCount > 0 && totals.itemsWithoutCost > 0)) && (
            <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs text-ink-soft">
              {totals.itemsWithoutPrice > 0 && (
                <li className="flex gap-1.5">
                  <AlertTriangle
                    size={13}
                    className="mt-px shrink-0 text-marigold"
                    aria-hidden="true"
                  />
                  {totals.itemsWithoutPrice} item
                  {totals.itemsWithoutPrice === 1 ? " needs" : "s need"} a
                  price.
                </li>
              )}
              {totals.itemsWithoutCost > 0 && (
                <li className="flex gap-1.5">
                  <AlertTriangle
                    size={13}
                    className="mt-px shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                  {totals.itemsWithoutCost} item
                  {totals.itemsWithoutCost === 1 ? " has" : "s have"} no cost,
                  so profit is incomplete.
                </li>
              )}
            </ul>
          )}
        </aside>
      </div>

      <BookingItemDialog
        open={!!dialog}
        onClose={() => setDialog(null)}
        booking={booking}
        item={dialog?.item ?? null}
        initialType={dialog?.type}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Remove item?"
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
