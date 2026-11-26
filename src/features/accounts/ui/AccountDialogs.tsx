"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { Field, ServerError, inputCls } from "../../shared/components/FormBits";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "../../payments/types/payment";
import { formatPrice } from "@/src/lib/format";
import {
  useBookingOptions,
  usePayees,
  useRecordSupplierPayment,
  useVoidSupplierPayment,
} from "../hooks/useAccounts";
import {
  SUPPLIER_TYPES,
  isListed,
  type BookingOption,
  type SupplierType,
  type Transaction,
} from "../types/accounts";

const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();
const CURRENCIES = ["BTN", "USD", "INR", "EUR", "GBP", "AUD", "SGD", "JPY"];
const isMoney = (v: string) =>
  /^\d{1,10}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, "")) &&
  Number(v.replace(/,/g, "")) > 0;

/** Today in Bhutan, YYYY-MM-DD. */
export const bhutanToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Thimphu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

function Footer({
  onCancel,
  pending,
  label,
  danger,
}: {
  onCancel: () => void;
  pending: boolean;
  label: string;
  danger?: boolean;
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
        disabled={pending}
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

/** Pre-fill from the suppliers table ("Pay" on a row). */
export interface PayPreset {
  supplierType: SupplierType;
  supplierId: string | null;
  name: string;
  amount?: string;
}

const NAME_PLACEHOLDER: Record<SupplierType, string> = {
  hotel: "Search your hotels",
  guide: "Search your guides",
  vehicle: "Search by vehicle or number plate",
  service: "Search your services",
  government: "e.g. Department of Tourism",
  other: "e.g. Office rent, fuel, Bhutan Telecom",
};

/** Picks a hotel / guide / vehicle / service from your lists. */
function PayeePicker({
  type,
  selected,
  onSelect,
}: {
  type: "hotel" | "guide" | "vehicle" | "service";
  selected: { id: string; name: string } | null;
  onSelect: (p: { id: string; name: string } | null) => void;
}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data, isFetching } = usePayees(selected ? null : type, debounced);

  if (selected) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-xl bg-mist/60 px-3.5 text-sm">
        <Check
          size={15}
          aria-hidden="true"
          className="shrink-0 text-lagoon-deep"
        />
        <span className="min-w-0 flex-1 truncate font-semibold text-ink">
          {selected.name}
        </span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label={`Change ${selected.name}`}
          className="grid size-7 place-items-center rounded-full text-ink-soft hover:bg-white hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
        />
        <input
          id="sp-payee"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={NAME_PLACEHOLDER[type]}
          autoComplete="off"
          className={`${inputCls} pl-9`}
        />
        {isFetching && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-soft"
          />
        )}
      </div>
      <ul
        className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-line"
        role="listbox"
        aria-label="Results"
      >
        {(data ?? []).map((p) => (
          <li key={p.id}>
            <button
              type="button"
              role="option"
              aria-selected={false}
              onClick={() =>
                onSelect({
                  id: p.id,
                  name:
                    type === "vehicle" && p.detail
                      ? `${p.name} · ${p.detail}`
                      : p.name,
                })
              }
              className="flex w-full items-baseline justify-between gap-3 px-3.5 py-2 text-left text-sm hover:bg-mist/60"
            >
              <span className="truncate font-medium text-ink">{p.name}</span>
              {p.detail && (
                <span className="shrink-0 text-xs text-ink-soft">
                  {p.detail}
                </span>
              )}
            </button>
          </li>
        ))}
        {data && data.length === 0 && (
          <li className="px-3.5 py-3 text-sm text-ink-soft">
            No matches. Add them on their page first.
          </li>
        )}
      </ul>
    </div>
  );
}

/** Optional: which booking the payment was for. */
function BookingPicker({
  value,
  onChange,
}: {
  value: BookingOption | null;
  onChange: (b: BookingOption | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data } = useBookingOptions(debounced, open && !value);

  if (value) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-xl bg-mist/60 px-3.5 text-sm">
        <span className="min-w-0 flex-1 truncate">
          <span className="font-semibold text-ink">{value.reference}</span>{" "}
          <span className="text-ink-soft">{value.title}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove booking"
          className="grid size-7 place-items-center rounded-full text-ink-soft hover:bg-white hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>
    );
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-lagoon-deep hover:underline"
      >
        Link to a booking
      </button>
    );
  }
  return (
    <div>
      <input
        id="sp-booking"
        type="search"
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Booking number, title or customer"
        autoComplete="off"
        className={inputCls}
      />
      <ul className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-line">
        {(data ?? []).map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onChange(b)}
              className="flex w-full items-baseline gap-2 px-3.5 py-2 text-left text-sm hover:bg-mist/60"
            >
              <span className="shrink-0 font-semibold text-ink">
                {b.reference}
              </span>
              <span className="truncate text-ink-soft">{b.title}</span>
            </button>
          </li>
        ))}
        {data && data.length === 0 && (
          <li className="px-3.5 py-3 text-sm text-ink-soft">
            No confirmed bookings match.
          </li>
        )}
      </ul>
    </div>
  );
}

/** Record money paid out: to a hotel, guide, driver, service, the government or anything else. */
export function SupplierPaymentDialog({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: PayPreset | null;
}) {
  const record = useRecordSupplierPayment();
  const [type, setType] = useState<SupplierType>("hotel");
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [payeeName, setPayeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BTN");
  const [btnRate, setBtnRate] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [paidOn, setPaidOn] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [booking, setBooking] = useState<BookingOption | null>(null);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const today = bhutanToday();
    setType(preset?.supplierType ?? "hotel");
    setPicked(
      preset?.supplierId ? { id: preset.supplierId, name: preset.name } : null,
    );
    setPayeeName(
      preset && !preset.supplierId && preset.supplierType !== "government"
        ? preset.name
        : "",
    );
    setAmount(
      preset?.amount && Number(preset.amount) > 0
        ? String(Number(preset.amount))
        : "",
    );
    setCurrency("BTN");
    setBtnRate("");
    setMethod("bank_transfer");
    setPaidOn(today);
    setMaxDate(today);
    setBooking(null);
    setReference("");
    setNotes("");
    setFormError(null);
    record.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const listed = isListed(type);
  const foreign = currency !== "BTN";
  const preview =
    foreign && isMoney(amount) && Number(btnRate) > 0
      ? (Number(amount.replace(/,/g, "")) * Number(btnRate)).toFixed(2)
      : null;

  function changeType(t: SupplierType) {
    setType(t);
    setPicked(null);
    setPayeeName("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (listed && !picked && !payeeName.trim())
      return setFormError("Pick who you paid.");
    if (!listed && !payeeName.trim() && type !== "government")
      return setFormError("Type who you paid.");
    if (!isMoney(amount))
      return setFormError("Enter an amount above 0, like 5000 or 1200.50.");
    if (foreign && btnRate && !(Number(btnRate) > 0))
      return setFormError("Enter the rate in BTN, or leave it empty.");
    if (!paidOn) return setFormError("Choose the date.");
    setFormError(null);
    record.mutate(
      {
        supplierType: type,
        supplierId: listed && picked ? picked.id : null,
        payeeName:
          listed && picked
            ? null
            : payeeName.trim() || (type === "government" ? "Government" : null),
        bookingId: booking?.id ?? null,
        method,
        amount: amount.replace(/,/g, ""),
        currency,
        ...(foreign && btnRate ? { btnRate } : {}),
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
      title="Record money paid out"
      description="A payment you made to a hotel, guide, driver, the government or anyone else."
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-ink">
              Paid to
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {SUPPLIER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={type === t.value}
                  onClick={() => changeType(t.value)}
                  className={`h-8 rounded-full px-3 text-sm font-medium transition-colors ${
                    type === t.value
                      ? "bg-ink text-white"
                      : "bg-mist/70 text-ink hover:bg-mist"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          {listed ? (
            <div>
              <label
                htmlFor="sp-payee"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Which {type === "vehicle" ? "vehicle" : type}?
              </label>
              <PayeePicker type={type} selected={picked} onSelect={setPicked} />
            </div>
          ) : (
            <Field
              label={
                type === "government" ? "Office (optional)" : "Who did you pay?"
              }
              htmlFor="sp-name"
            >
              <input
                id="sp-name"
                value={payeeName}
                maxLength={120}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder={NAME_PLACEHOLDER[type]}
                className={inputCls}
              />
            </Field>
          )}

          <div>
            <label
              htmlFor="sp-amount"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Amount paid
            </label>
            <div className="flex gap-2">
              <input
                id="sp-amount"
                inputMode="decimal"
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
                  {CURRENCIES.map((c) => (
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
                htmlFor="sp-rate"
                className="block text-sm font-medium text-ink"
              >
                Exchange rate used
              </label>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-soft">
                <span className="shrink-0">1 {currency} =</span>
                <input
                  id="sp-rate"
                  inputMode="decimal"
                  value={btnRate}
                  onChange={(e) =>
                    setBtnRate(e.target.value.replace(/[^\d.]/g, ""))
                  }
                  placeholder="Your agency's rate"
                  className={`${inputCls} min-w-0 flex-1 text-right tabular-nums`}
                />
                <span className="shrink-0">BTN</span>
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">
                {preview
                  ? `Counts as ${formatPrice(preview, "BTN")} in your accounts.`
                  : "Leave empty to use your exchange rates."}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Method" htmlFor="sp-method">
              <div className="relative">
                <select
                  id="sp-method"
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
            <Field label="Paid on" htmlFor="sp-date">
              <input
                id="sp-date"
                type="date"
                max={maxDate}
                value={paidOn}
                onChange={(e) => setPaidOn(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">
              Booking{" "}
              <span className="font-normal text-ink-soft">(optional)</span>
            </p>
            <BookingPicker value={booking} onChange={setBooking} />
          </div>

          <Field
            label="Reference"
            htmlFor="sp-ref"
            hint="Bank reference, cheque or bill number. Optional."
          >
            <input
              id="sp-ref"
              value={reference}
              maxLength={120}
              onChange={(e) => setReference(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Notes" htmlFor="sp-notes">
            <textarea
              id="sp-notes"
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
          label="Record payment"
        />
      </form>
    </Modal>
  );
}

/** Void a payment out: kept in the list, left out of totals. */
export function VoidSupplierPaymentDialog({
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  const voidIt = useVoidSupplierPayment();
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (!tx) return;
    setReason("");
    voidIt.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx]);

  return (
    <Modal
      open={!!tx}
      onClose={onClose}
      locked={voidIt.isPending}
      size="sm"
      title="Void this payment?"
      description={
        tx ? `${tx.description} · ${formatPrice(tx.amount, tx.currency)}` : ""
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (tx && reason.trim())
            voidIt.mutate(
              { paymentId: tx.id, reason: reason.trim() },
              { onSuccess: onClose },
            );
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-4 px-6 py-6">
          <p className="text-sm text-ink-soft">
            It stays in the list, crossed out, and no longer counts in the
            totals. Use it for mistakes.
          </p>
          <Field label="Why?" htmlFor="void-reason">
            <input
              id="void-reason"
              autoFocus
              value={reason}
              maxLength={300}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Entered twice"
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
        />
      </form>
    </Modal>
  );
}
