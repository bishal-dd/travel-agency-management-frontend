"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Printer,
  Undo2,
} from "lucide-react";
import type { BookingDetail } from "../../bookings/types/booking";
import { formatDate, formatPrice } from "@/src/lib/format";
import { useBookingPayments } from "../hooks/usePayments";
import {
  type Payment,
  type PaymentStatus,
  type PaymentSummary,
  methodLabel,
} from "../types/payment";
import {
  RecordPaymentDialog,
  ScheduleDialog,
  VoidPaymentDialog,
} from "./PaymentDialogs";

export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; cls: string }
> = {
  nothing_due: { label: "Nothing due", cls: "bg-mist text-ink-soft" },
  unpaid: { label: "Unpaid", cls: "bg-mist text-ink-soft" },
  partially_paid: { label: "Part-paid", cls: "bg-marigold/20 text-ink" },
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800" },
  overpaid: { label: "Overpaid", cls: "bg-lagoon-tint text-lagoon-deep" },
};

export function PaymentStatusBadge({
  status,
  overdue,
}: {
  status: PaymentStatus;
  overdue?: boolean;
}) {
  if (overdue) {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        Overdue
      </span>
    );
  }
  const s = PAYMENT_STATUS[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

/** Paid / total, progress bar, balance and next due. */
function SummaryBlock({
  s,
  currency,
}: {
  s: PaymentSummary;
  currency: string;
}) {
  const money = (v: string) => formatPrice(v, currency);
  const pct =
    Number(s.total) > 0
      ? Math.min(100, Math.max(0, (Number(s.paid) / Number(s.total)) * 100))
      : 0;
  const balance = Number(s.balance);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-ink-soft">
          <span className="text-lg font-bold tabular-nums text-ink">
            {money(s.paid)}
          </span>{" "}
          of {money(s.total)}
        </p>
        <PaymentStatusBadge
          status={s.status}
          overdue={Number(s.overdueAmount) > 0}
        />
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-mist"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full ${s.status === "paid" || s.status === "overpaid" ? "bg-emerald-500" : "bg-lagoon-deep"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-ink">
        {balance > 0 ? (
          <>
            Balance{" "}
            <span className="font-semibold tabular-nums">
              {money(s.balance)}
            </span>
          </>
        ) : balance < 0 ? (
          <>
            Overpaid by{" "}
            <span className="font-semibold tabular-nums">
              {money(String(-balance))}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 size={15} /> Paid in full
          </span>
        )}
      </p>
      {s.nextDue && (
        <p
          className={`mt-0.5 text-xs ${s.nextDue.overdue ? "font-semibold text-red-700" : "text-ink-soft"}`}
        >
          {s.nextDue.overdue ? "Overdue: " : "Next: "}
          {s.nextDue.label} {money(s.nextDue.amount)} due{" "}
          {formatDate(s.nextDue.dueDate)}
        </p>
      )}
    </div>
  );
}

function PaymentRow({
  p,
  currency,
  canEdit,
  onVoid,
}: {
  p: Payment;
  currency: string;
  canEdit: boolean;
  onVoid: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const refund = p.kind === "refund";
  const voided = !!p.voidedAt;
  return (
    <li
      className={`relative flex items-start gap-3 py-2.5 ${voided ? "opacity-60" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span
            className={`font-medium text-ink ${voided ? "line-through" : ""}`}
          >
            {p.receiptNumber}
          </span>
          <span className="text-ink-soft"> · {formatDate(p.paidOn)}</span>
          {refund && (
            <span className="ml-1.5 rounded bg-mist px-1.5 py-px text-[10px] font-semibold uppercase text-ink-soft">
              refund
            </span>
          )}
          {voided && (
            <span className="ml-1.5 rounded bg-red-50 px-1.5 py-px text-[10px] font-semibold uppercase text-red-700">
              void
            </span>
          )}
        </p>
        <p className="truncate text-xs text-ink-soft">
          {methodLabel(p.method)}
          {p.reference && ` · ${p.reference}`}
          {p.currency !== currency &&
            ` · ${formatPrice(p.amount, p.currency)} at ${Number(p.fxRate)}`}
        </p>
        {voided && p.voidReason && (
          <p className="text-xs italic text-ink-soft">Voided: {p.voidReason}</p>
        )}
      </div>
      <p
        className={`shrink-0 text-sm font-semibold tabular-nums ${refund ? "text-red-700" : "text-ink"} ${voided ? "line-through" : ""}`}
      >
        {refund ? "−" : "+"}
        {formatPrice(p.bookingAmount, currency)}
      </p>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-label={`Actions for ${p.receiptNumber}`}
          aria-expanded={menu}
          className="grid size-7 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
        >
          <MoreHorizontal size={15} />
        </button>
        {menu && (
          <div
            role="menu"
            onMouseLeave={() => setMenu(false)}
            className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-line bg-white p-1 text-sm shadow-lg"
          >
            <a
              role="menuitem"
              href={`/receipts/${p.id}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenu(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink hover:bg-mist"
            >
              <Printer size={14} /> Receipt
            </a>
            {canEdit && !voided && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  onVoid();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
              >
                <Undo2 size={14} /> Void
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * The booking's money: paid vs total, the schedule, every payment and refund.
 * Staff (no payment permission) see the summary only.
 */
export function PaymentsPanel({ booking }: { booking: BookingDetail }) {
  const { data, isPending, error } = useBookingPayments(booking.id);
  const [recording, setRecording] = useState<"payment" | "refund" | null>(null);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [voiding, setVoiding] = useState<Payment | null>(null);
  const [showVoided, setShowVoided] = useState(false);

  const forbidden = (error as { status?: number } | null)?.status === 403;
  const summary = data?.summary ?? booking.payment;
  const cancelled = booking.status === "cancelled";
  const canEdit = !!data && !forbidden;
  const money = (v: string) => formatPrice(v, booking.currency);

  if (!summary && !isPending) return null;

  const payments = data?.payments ?? [];
  const voidedCount = payments.filter((p) => p.voidedAt).length;
  const visible = showVoided ? payments : payments.filter((p) => !p.voidedAt);
  const paidSoFar = summary ? Number(summary.paid) : 0;

  return (
    <section
      aria-labelledby="payments-heading"
      className="rounded-2xl border border-line bg-white p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="payments-heading"
          className="text-sm font-semibold uppercase tracking-wide text-ink-soft"
        >
          Payments
        </h2>
        {canEdit && !cancelled && (
          <button
            type="button"
            onClick={() => setRecording("payment")}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-white hover:bg-lagoon-deep"
          >
            <Plus size={14} /> Record payment
          </button>
        )}
      </div>

      {!summary ? (
        <div className="h-20 animate-pulse rounded-lg bg-mist" />
      ) : (
        <SummaryBlock s={summary} currency={booking.currency} />
      )}

      {/* Schedule */}
      {summary && (
        <div className="mt-4 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Schedule
            </h3>
            {canEdit && !cancelled && (
              <button
                type="button"
                onClick={() => setEditingSchedule(true)}
                className="text-xs font-semibold text-lagoon-deep hover:underline"
              >
                {summary.installments.length ? "Edit" : "Set up"}
              </button>
            )}
          </div>
          {summary.installments.length === 0 ? (
            <p className="mt-1 text-sm text-ink-soft">
              Deposit and balance dates are set when the booking is confirmed.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1.5 text-sm">
              {summary.installments.map((i, n) => (
                <li
                  key={i.id ?? n}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-ink">{i.label}</span>
                    {i.percent && (
                      <span className="text-ink-soft">
                        {" "}
                        · {Number(i.percent)}%
                      </span>
                    )}
                    <span
                      className={`block text-xs ${i.overdue ? "font-semibold text-red-700" : "text-ink-soft"}`}
                    >
                      {i.overdue && (
                        <AlertTriangle
                          size={11}
                          className="mr-1 inline align-[-1px]"
                          aria-hidden="true"
                        />
                      )}
                      due {formatDate(i.dueDate)}
                      {i.remaining === "0.00"
                        ? " · paid"
                        : Number(i.paid) > 0
                          ? ` · ${money(i.remaining)} left`
                          : ""}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 tabular-nums ${i.remaining === "0.00" ? "text-emerald-700" : "text-ink"}`}
                  >
                    {i.remaining === "0.00" && (
                      <CheckCircle2
                        size={13}
                        className="mr-1 inline align-[-2px]"
                        aria-hidden="true"
                      />
                    )}
                    {money(i.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {Number(summary.unscheduled) > 0 &&
            summary.installments.length > 0 && (
              <p className="mt-1.5 text-xs text-marigold">
                {money(summary.unscheduled)} of the total isn&apos;t in the
                schedule.
              </p>
            )}
        </div>
      )}

      {/* Payments list */}
      {forbidden ? (
        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">
          Ask an owner, manager or accountant to record payments.
        </p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700">
          Couldn&apos;t load payments: {error.message}
        </p>
      ) : isPending ? null : (
        <div className="mt-4 border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Received
            </h3>
            {voidedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowVoided((v) => !v)}
                className="text-xs font-semibold text-ink-soft hover:text-ink"
              >
                {showVoided ? "Hide voided" : `Show ${voidedCount} voided`}
              </button>
            )}
          </div>
          {visible.length === 0 ? (
            <p className="mt-1 text-sm text-ink-soft">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {visible.map((p) => (
                <PaymentRow
                  key={p.id}
                  p={p}
                  currency={booking.currency}
                  canEdit={canEdit}
                  onVoid={() => setVoiding(p)}
                />
              ))}
            </ul>
          )}
          {canEdit && paidSoFar > 0 && (
            <button
              type="button"
              onClick={() => setRecording("refund")}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              <Undo2 size={13} /> Record a refund
            </button>
          )}
        </div>
      )}

      <RecordPaymentDialog
        open={!!recording}
        onClose={() => setRecording(null)}
        booking={booking}
        kind={recording ?? "payment"}
        suggestedAmount={
          recording === "payment"
            ? (summary?.nextDue?.amount ??
              (summary && Number(summary.balance) > 0 ? summary.balance : null))
            : null
        }
      />
      {summary && (
        <ScheduleDialog
          open={editingSchedule}
          onClose={() => setEditingSchedule(false)}
          booking={booking}
          installments={summary.installments}
          total={summary.total}
        />
      )}
      <VoidPaymentDialog
        payment={voiding}
        bookingId={booking.id}
        currency={booking.currency}
        onClose={() => setVoiding(null)}
      />
    </section>
  );
}
