"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import { formatPrice } from "@/src/lib/format";
import { getReceipt } from "../api/payments";
import { type Receipt, methodLabel } from "../types/payment";

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

export function ReceiptSkeleton() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="h-96 animate-pulse rounded-2xl bg-mist" />
    </div>
  );
}

/**
 * A printable payment receipt. Lives outside the dashboard layout so printing
 * gives a clean page; the agent's session cookie authorises it.
 */
export function ReceiptPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString());
    getReceipt(paymentId)
      .then((r) => setReceipt(r.data))
      .catch((e: Error & { status?: number }) =>
        setProblem(
          e.status === 401 || e.status === 403
            ? "Sign in with an account that can see payments to view this receipt."
            : e.status === 404
              ? "This receipt doesn't exist."
              : e.message,
        ),
      );
  }, [paymentId]);

  if (problem)
    return <p className="p-8 text-center text-sm text-ink-soft">{problem}</p>;
  if (!receipt) return <ReceiptSkeleton />;

  const { agency, payment: p, booking, customer, summary } = receipt;
  const currency = booking?.currency ?? p.currency;
  const refund = p.kind === "refund";
  const voided = !!p.voidedAt;

  return (
    <div className="min-h-dvh bg-paper py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl px-4 print:max-w-none print:px-0">
        <div className="mb-4 flex justify-end print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
          >
            <Printer size={15} /> Print or save as PDF
          </button>
        </div>

        <article className="relative overflow-hidden rounded-2xl border border-line bg-white p-8 sm:p-10 print:rounded-none print:border-0 print:p-0">
          {voided && (
            <p className="absolute right-6 top-6 rotate-6 rounded-lg border-2 border-red-600 px-3 py-1 text-xl font-bold uppercase tracking-widest text-red-600">
              Void
            </p>
          )}

          <header className="flex items-start justify-between gap-6 border-b border-line pb-6">
            <div className="flex items-center gap-3">
              {agency.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agency.logo}
                  alt=""
                  className="size-12 rounded-xl object-contain"
                />
              ) : (
                <span className="grid size-12 place-items-center rounded-xl bg-ink text-lg font-bold text-white">
                  {agency.name.charAt(0)}
                </span>
              )}
              <p className="text-lg font-bold text-ink">{agency.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                {refund ? "Refund receipt" : "Receipt"}
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-ink">
                {p.receiptNumber}
              </p>
              <p className="text-sm text-ink-soft">{longDate(p.paidOn)}</p>
            </div>
          </header>

          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {refund ? "Refunded to" : "Received from"}
              </p>
              <p className="mt-1 font-semibold text-ink">{customer?.name}</p>
              {customer?.email && (
                <p className="text-sm text-ink-soft">{customer.email}</p>
              )}
              {customer?.phone && (
                <p className="text-sm text-ink-soft">{customer.phone}</p>
              )}
              {customer?.country && (
                <p className="text-sm text-ink-soft">{customer.country}</p>
              )}
            </div>
            {booking && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  For
                </p>
                <p className="mt-1 font-semibold text-ink">{booking.title}</p>
                <p className="text-sm text-ink-soft">
                  Booking {booking.reference}
                </p>
                <p className="text-sm text-ink-soft">
                  {longDate(booking.startDate)} – {longDate(booking.endDate)}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-mist/60 p-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-ink-soft">
                {refund ? "Amount refunded" : "Amount received"}
              </p>
              <p className="text-3xl font-bold tabular-nums text-ink">
                {formatPrice(p.amount, p.currency)}
              </p>
            </div>
            {p.currency !== currency && (
              <p className="mt-1 text-right text-sm text-ink-soft">
                = {formatPrice(p.bookingAmount, currency)} at 1 {p.currency} ={" "}
                {Number(p.fxRate)} {currency}
              </p>
            )}
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-soft">Method</dt>
                <dd className="font-medium text-ink">
                  {methodLabel(p.method)}
                </dd>
              </div>
              {p.reference && (
                <div>
                  <dt className="text-ink-soft">Reference</dt>
                  <dd className="font-medium text-ink">{p.reference}</dd>
                </div>
              )}
            </dl>
          </div>

          {summary && !voided && (
            <dl className="mt-6 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Trip total</dt>
                <dd className="tabular-nums text-ink">
                  {formatPrice(summary.total, currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Paid to date</dt>
                <dd className="tabular-nums text-ink">
                  {formatPrice(summary.paid, currency)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 font-semibold">
                <dt className="text-ink">
                  {Number(summary.balance) < 0 ? "Overpaid" : "Balance due"}
                </dt>
                <dd className="tabular-nums text-ink">
                  {formatPrice(
                    String(Math.abs(Number(summary.balance)).toFixed(2)),
                    currency,
                  )}
                </dd>
              </div>
            </dl>
          )}
          {voided && (
            <p className="mt-6 text-sm text-red-700">
              This payment was voided{p.voidReason ? `: ${p.voidReason}` : "."}
            </p>
          )}

          <p className="mt-8 border-t border-line pt-4 text-center text-xs text-ink-soft">
            Thank you.{today && ` Balance shown as of ${longDate(today)}.`}
          </p>
        </article>
      </div>
    </div>
  );
}
