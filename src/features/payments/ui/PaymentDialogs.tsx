"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { Field, ServerError, inputCls } from "../../shared/components/FormBits";
import type { BookingDetail } from "../../bookings/types/booking";
import { formatPrice } from "@/src/lib/format";
import {
  useRecordPayment,
  useSavePaymentSchedule,
  useVoidPayment,
} from "../hooks/usePayments";
import {
  PAYMENT_METHODS,
  type Installment,
  type Payment,
  type PaymentKind,
  type PaymentMethod,
} from "../types/payment";
import { todayIso } from "../../bookings/ui/bookingUi";

/** inputCls without its w-full, for boxes with their own width. */
const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

const COMMON_CURRENCIES = [
  "BTN",
  "USD",
  "INR",
  "EUR",
  "GBP",
  "AUD",
  "SGD",
  "JPY",
];

const isMoney = (v: string) =>
  /^\d{1,10}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, "")) &&
  Number(v.replace(/,/g, "")) > 0;
const cents = (v: string) => Math.round(Number(v.replace(/,/g, "")) * 100);
const fromCents = (c: number) => (c / 100).toFixed(2);

function Footer({
  onCancel,
  pending,
  label,
  danger,
  disabled,
}: {
  onCancel: () => void;
  pending: boolean;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending || disabled}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
          danger ? "bg-red-600 hover:bg-red-700" : "bg-ink hover:bg-lagoon-deep"
        }`}
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}

// ---------- record payment / refund ----------

export function RecordPaymentDialog({
  open,
  onClose,
  booking,
  kind,
  suggestedAmount,
}: {
  open: boolean;
  onClose: () => void;
  booking: BookingDetail;
  kind: PaymentKind;
  /** Pre-filled amount, e.g. the next instalment due. */
  suggestedAmount?: string | null;
}) {
  const record = useRecordPayment(booking.id);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(booking.currency);
  const [fxRate, setFxRate] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [paidOn, setPaidOn] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const today = todayIso();
    setPaidOn(today);
    setMaxDate(today);
    setAmount(
      suggestedAmount && Number(suggestedAmount) > 0
        ? String(Number(suggestedAmount))
        : "",
    );
    setCurrency(booking.currency);
    setFxRate("");
    setMethod("bank_transfer");
    setReference("");
    setNotes("");
    setFormError(null);
    record.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const foreign = currency !== booking.currency;
  const preview =
    foreign && isMoney(amount) && Number(fxRate) > 0
      ? fromCents(Math.round(cents(amount) * Number(fxRate)))
      : null;
  const currencies = useMemo(
    () => [...new Set([booking.currency, ...COMMON_CURRENCIES])],
    [booking.currency],
  );
  const isRefund = kind === "refund";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isMoney(amount))
      return setFormError("Enter an amount above 0, like 500 or 1200.50.");
    if (foreign && fxRate && !(Number(fxRate) > 0))
      return setFormError("Enter an exchange rate above 0, or leave it empty.");
    if (!paidOn) return setFormError("Choose the date.");
    setFormError(null);
    record.mutate(
      {
        kind,
        method,
        amount: amount.replace(/,/g, ""),
        currency,
        ...(foreign && fxRate ? { fxRate } : {}),
        paidOn,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={record.isPending}
      size="sm"
      title={isRefund ? "Record a refund" : "Record a payment"}
      description={`${booking.reference} · ${booking.customer.name}`}
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <div>
            <label
              htmlFor="pay-amount"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {isRefund ? "Amount refunded" : "Amount received"}
            </label>
            <div className="flex gap-2">
              <input
                id="pay-amount"
                inputMode="decimal"
                autoFocus
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^\d.,]/g, ""))
                }
                placeholder="0.00"
                className={`${inputCls} min-w-0 flex-1 text-right text-lg font-semibold tabular-nums`}
              />
              <div className="relative shrink-0">
                <select
                  aria-label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${sizedInputCls} w-24 appearance-none pr-8 font-mono font-semibold`}
                >
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
                />
              </div>
            </div>
          </div>

          {foreign && (
            <div className="rounded-xl bg-mist/60 px-4 py-3">
              <label
                htmlFor="pay-rate"
                className="block text-sm font-medium text-ink"
              >
                Exchange rate used
              </label>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-soft">
                <span className="shrink-0">1 {currency} =</span>
                <input
                  id="pay-rate"
                  inputMode="decimal"
                  value={fxRate}
                  onChange={(e) =>
                    setFxRate(e.target.value.replace(/[^\d.]/g, ""))
                  }
                  placeholder="Your agency's rate"
                  className={`${inputCls} min-w-0 flex-1 text-right tabular-nums`}
                />
                <span className="shrink-0">{booking.currency}</span>
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">
                {preview
                  ? `Counts as ${formatPrice(preview, booking.currency)} on this ${booking.currency} booking.`
                  : `Leave empty to use your exchange rates. Enter the bank's rate if it differs.`}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Method" htmlFor="pay-method">
              <div className="relative">
                <select
                  id="pay-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className={`${inputCls} appearance-none pr-9`}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                />
              </div>
            </Field>
            <Field
              label={isRefund ? "Refunded on" : "Received on"}
              htmlFor="pay-date"
            >
              <input
                id="pay-date"
                type="date"
                max={maxDate}
                value={paidOn}
                onChange={(e) => setPaidOn(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label="Reference"
            htmlFor="pay-ref"
            hint="Bank or card reference, receipt number… Optional."
          >
            <input
              id="pay-ref"
              value={reference}
              maxLength={200}
              onChange={(e) => setReference(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Notes" htmlFor="pay-notes">
            <textarea
              id="pay-notes"
              rows={2}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} h-auto py-2.5`}
            />
          </Field>
        </div>

        {formError && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}
        <ServerError error={record.error} />
        <Footer
          onCancel={onClose}
          pending={record.isPending}
          label={isRefund ? "Record refund" : "Record payment"}
        />
      </form>
    </Modal>
  );
}

// ---------- void ----------

export function VoidPaymentDialog({
  payment,
  bookingId,
  currency,
  onClose,
}: {
  payment: Payment | null;
  bookingId: string;
  currency: string;
  onClose: () => void;
}) {
  const voidIt = useVoidPayment(bookingId);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (payment) {
      setReason("");
      voidIt.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.id]);

  return (
    <Modal
      open={!!payment}
      onClose={onClose}
      locked={voidIt.isPending}
      size="sm"
      title={`Void ${payment?.receiptNumber ?? ""}?`}
      description={
        payment
          ? `${formatPrice(payment.amount, payment.currency)} · stays on record, marked void`
          : undefined
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (payment && reason.trim())
            voidIt.mutate(
              { paymentId: payment.id, reason: reason.trim() },
              { onSuccess: onClose },
            );
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-3 px-6 py-6">
          <p className="text-sm text-ink-soft">
            Use this for a payment recorded by mistake. It won&apos;t count
            towards the {currency} balance any more. To give money back to the
            customer, record a refund instead.
          </p>
          <Field label="Reason" htmlFor="void-reason">
            <input
              id="void-reason"
              autoFocus
              value={reason}
              maxLength={300}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Entered twice, card charge failed"
              className={inputCls}
            />
          </Field>
        </div>
        <ServerError error={voidIt.error} />
        <Footer
          onCancel={onClose}
          pending={voidIt.isPending}
          label="Void payment"
          danger
          disabled={!reason.trim()}
        />
      </form>
    </Modal>
  );
}

// ---------- schedule ----------

type DraftRow = {
  key: string;
  label: string;
  dueDate: string;
  mode: "percent" | "amount" | "balance";
  value: string;
};
let seq = 0;
const rowKey = () => `s-${++seq}`;

function rowsFrom(installments: Installment[]): DraftRow[] {
  return installments.map((i) => ({
    key: rowKey(),
    label: i.label,
    dueDate: i.dueDate,
    mode: i.isBalance ? "balance" : i.percent != null ? "percent" : "amount",
    value: i.isBalance
      ? ""
      : i.percent != null
        ? String(Number(i.percent))
        : String(Number(i.amount)),
  }));
}

export function ScheduleDialog({
  open,
  onClose,
  booking,
  installments,
  total,
}: {
  open: boolean;
  onClose: () => void;
  booking: BookingDetail;
  installments: Installment[];
  total: string;
}) {
  const save = useSavePaymentSchedule(booking.id);
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(
      installments.length
        ? rowsFrom(installments)
        : [
            {
              key: rowKey(),
              label: "Deposit",
              dueDate: todayIso(),
              mode: "percent",
              value: "30",
            },
            {
              key: rowKey(),
              label: "Balance",
              dueDate: booking.startDate,
              mode: "balance",
              value: "",
            },
          ],
    );
    setFormError(null);
    save.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key: string, patch: Partial<DraftRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const money = (v: string) => formatPrice(v, booking.currency);

  // Live amounts, like the server works them out.
  const totalCents = cents(total);
  let running = 0;
  const amounts = rows.map((r) => {
    const a =
      r.mode === "percent"
        ? Math.round(
            (totalCents * Math.round(Number(r.value || 0) * 100)) / 10_000,
          )
        : r.mode === "amount"
          ? cents(r.value || "0")
          : Math.max(0, totalCents - running);
    running += a;
    return a;
  });
  const left = totalCents - running;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const [i, r] of rows.entries()) {
      if (!r.label.trim())
        return setFormError(`Payment ${i + 1} needs a name.`);
      if (!r.dueDate) return setFormError(`Payment ${i + 1} needs a due date.`);
      if (r.mode === "balance" && i !== rows.length - 1)
        return setFormError("Only the last payment can be the balance.");
      if (r.mode !== "balance" && !(Number(r.value) > 0))
        return setFormError(
          `Enter a ${r.mode} for ${r.label || `payment ${i + 1}`}.`,
        );
      if (i > 0 && r.dueDate < rows[i - 1]!.dueDate)
        return setFormError("Put the payments in date order.");
    }
    setFormError(null);
    save.mutate(
      {
        installments: rows.map((r) => ({
          label: r.label.trim(),
          dueDate: r.dueDate,
          percent: r.mode === "percent" ? r.value : null,
          amount: r.mode === "amount" ? r.value.replace(/,/g, "") : null,
        })),
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={save.isPending}
      title="Payment schedule"
      description={`When the customer pays the ${money(total)} total`}
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-3 overflow-y-auto px-6 py-6">
          {rows.map((r, i) => (
            <div
              key={r.key}
              className="grid grid-cols-2 gap-2 rounded-xl bg-mist/60 p-3 sm:grid-cols-[1fr_9rem_8rem_7rem_auto] sm:items-center"
            >
              <input
                aria-label="Name"
                value={r.label}
                onChange={(e) => set(r.key, { label: e.target.value })}
                placeholder="e.g. Deposit"
                className={`${inputCls} col-span-2 sm:col-span-1`}
              />
              <input
                aria-label="Due date"
                type="date"
                value={r.dueDate}
                onChange={(e) => set(r.key, { dueDate: e.target.value })}
                className={inputCls}
              />
              <div className="relative">
                <select
                  aria-label="Type"
                  value={r.mode}
                  onChange={(e) =>
                    set(r.key, {
                      mode: e.target.value as DraftRow["mode"],
                      value: "",
                    })
                  }
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="percent">% of total</option>
                  <option value="amount">Amount</option>
                  {i === rows.length - 1 && (
                    <option value="balance">The balance</option>
                  )}
                </select>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
                />
              </div>
              {r.mode === "balance" ? (
                <p className="text-right text-sm font-semibold tabular-nums text-ink">
                  {money(fromCents(amounts[i]!))}
                </p>
              ) : (
                <div>
                  <input
                    aria-label={r.mode === "percent" ? "Percent" : "Amount"}
                    inputMode="decimal"
                    value={r.value}
                    onChange={(e) =>
                      set(r.key, {
                        value: e.target.value.replace(/[^\d.,]/g, ""),
                      })
                    }
                    placeholder={r.mode === "percent" ? "%" : booking.currency}
                    className={`${inputCls} text-right tabular-nums`}
                  />
                  {r.mode === "percent" && Number(r.value) > 0 && (
                    <p className="mt-0.5 text-right text-xs tabular-nums text-ink-soft">
                      {money(fromCents(amounts[i]!))}
                    </p>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  setRows((rs) => rs.filter((x) => x.key !== r.key))
                }
                disabled={rows.length === 1}
                aria-label={`Remove ${r.label || "payment"}`}
                className="grid size-9 place-items-center justify-self-end rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                setRows((rs) => {
                  // Insert before a trailing balance row.
                  const last = rs[rs.length - 1];
                  const row: DraftRow = {
                    key: rowKey(),
                    label: "",
                    dueDate: last?.dueDate ?? todayIso(),
                    mode: "percent",
                    value: "",
                  };
                  return last?.mode === "balance"
                    ? [...rs.slice(0, -1), row, last]
                    : [...rs, row];
                })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
            >
              <Plus size={14} /> Add payment
            </button>
            <p
              className={`text-sm tabular-nums ${left === 0 ? "text-ink-soft" : "font-semibold text-marigold"}`}
            >
              {left === 0
                ? "Adds up to the total"
                : left > 0
                  ? `${money(fromCents(left))} not scheduled`
                  : `${money(fromCents(-left))} over the total`}
            </p>
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}
        <ServerError error={save.error} />
        <Footer
          onCancel={onClose}
          pending={save.isPending}
          label="Save schedule"
        />
      </form>
    </Modal>
  );
}
