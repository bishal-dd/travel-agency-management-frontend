"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Printer,
  Search,
} from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import { formatDate, formatPrice } from "@/src/lib/format";
import { usePaymentsList } from "../hooks/usePayments";
import {
  PAYMENT_METHODS,
  type PaymentKind,
  type PaymentMethod,
  methodLabel,
} from "../types/payment";

const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

function SelectBox({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${sizedInputCls} w-full appearance-none pr-9 sm:w-40`}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}

/** Every payment and refund across bookings, with totals per currency. */
export function PaymentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [kind, setKind] = useState<PaymentKind | "">("");
  const [includeVoided, setIncludeVoided] = useState(false);
  const [page, setPage] = useState(1);

  // Search after typing stops.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, isPlaceholderData, error } = usePaymentsList({
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
    method: method || undefined,
    kind: kind || undefined,
    includeVoided,
    page,
    limit: 20,
  });
  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };
  const filtered = !!(search || from || to || method || kind || includeVoided);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Payments</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything received and refunded, across all bookings.
        </p>
      </div>

      {/* Totals */}
      {data && data.totals.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.totals.map((t) => {
            const net = (Number(t.received) - Number(t.refunded)).toFixed(2);
            return (
              <div
                key={t.currency}
                className="rounded-2xl border border-line bg-white p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {t.currency} bookings{filtered ? " · filtered" : ""}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                  {formatPrice(net, t.currency)}
                </p>
                <p className="text-xs tabular-nums text-ink-soft">
                  {formatPrice(t.received, t.currency)} received
                  {Number(t.refunded) > 0 &&
                    ` · ${formatPrice(t.refunded, t.currency)} refunded`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative lg:w-72">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            aria-label="Search payments"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Receipt, booking, customer, reference"
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="From"
            value={from}
            onChange={(e) => reset(setFrom)(e.target.value)}
            className={`${sizedInputCls} w-full sm:w-40`}
          />
          <span className="text-sm text-ink-soft">to</span>
          <input
            type="date"
            aria-label="To"
            value={to}
            min={from || undefined}
            onChange={(e) => reset(setTo)(e.target.value)}
            className={`${sizedInputCls} w-full sm:w-40`}
          />
        </div>
        <div className="flex gap-2">
          <SelectBox
            label="Method"
            value={method}
            onChange={(v) => reset(setMethod)(v as PaymentMethod | "")}
          >
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SelectBox>
          <SelectBox
            label="Type"
            value={kind}
            onChange={(v) => reset(setKind)(v as PaymentKind | "")}
          >
            <option value="">Payments &amp; refunds</option>
            <option value="payment">Payments</option>
            <option value="refund">Refunds</option>
          </SelectBox>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={includeVoided}
            onChange={(e) => reset(setIncludeVoided)(e.target.checked)}
            className="size-4 accent-lagoon-deep"
          />
          Show voided
        </label>
      </div>

      {/* Table */}
      <div
        className={`overflow-hidden rounded-2xl border border-line bg-white transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
      >
        {isPending ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-mist" />
            ))}
          </div>
        ) : error ? (
          <p className="p-5 text-sm text-red-700">
            Couldn&apos;t load payments: {error.message}
          </p>
        ) : !data || data.data.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-soft">
            {filtered
              ? "No payments match these filters."
              : "No payments recorded yet. Record them from a booking's Payments panel."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b border-line bg-mist/50 text-left text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th scope="col" className="px-5 py-2.5 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Receipt
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Customer · booking
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Method
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-right font-semibold"
                  >
                    Amount
                  </th>
                  <th scope="col" className="w-10 px-3 py-2.5">
                    <span className="sr-only">Receipt</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.data.map((p) => {
                  const refund = p.kind === "refund";
                  const voided = !!p.voidedAt;
                  return (
                    <tr key={p.id} className={voided ? "opacity-60" : ""}>
                      <td className="whitespace-nowrap px-5 py-3 text-ink-soft">
                        {formatDate(p.paidOn)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`font-medium text-ink ${voided ? "line-through" : ""}`}
                        >
                          {p.receiptNumber}
                        </span>
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
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/dashboard/bookings/${p.booking.id}`}
                          className="font-medium text-ink hover:text-lagoon-deep hover:underline"
                        >
                          {p.customer.name}
                        </Link>
                        <span className="block text-xs text-ink-soft">
                          {p.booking.reference} · {p.booking.title}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">
                        {methodLabel(p.method)}
                        {p.reference && (
                          <span className="block max-w-[12rem] truncate text-xs">
                            {p.reference}
                          </span>
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums ${refund ? "text-red-700" : "text-ink"} ${voided ? "line-through" : ""}`}
                      >
                        {refund ? "−" : ""}
                        {formatPrice(p.bookingAmount, p.booking.currency)}
                        {p.currency !== p.booking.currency && (
                          <span className="block text-xs font-normal text-ink-soft">
                            {formatPrice(p.amount, p.currency)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <a
                          href={`/receipts/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Receipt ${p.receiptNumber}`}
                          className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-mist hover:text-ink"
                        >
                          <Printer size={15} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
            {data.pagination.total} payments
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
