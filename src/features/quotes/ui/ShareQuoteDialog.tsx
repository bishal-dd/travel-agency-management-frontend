"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { Field, ServerError, inputCls } from "../../shared/components/FormBits";
import type { BookingDetail } from "../../bookings/types/booking";
import { formatPrice } from "@/src/lib/format";
import { useCreateQuote, useQuoteSettings } from "../hooks/useQuotes";
import type { Quote } from "../types/quote";
import { addDays, formatDate, todayIso } from "../../bookings/ui/bookingUi";

/** Full customer link for a quote, on this site's origin. */
export const quoteUrl = (q: Pick<Quote, "path">) =>
  typeof window === "undefined" ? q.path : `${window.location.origin}${q.path}`;

/** Ready-made share buttons: copy, WhatsApp, email, open. */
export function ShareLinks({
  quote,
  booking,
}: {
  quote: Quote;
  booking: BookingDetail;
}) {
  const [copied, setCopied] = useState(false);
  const url = quoteUrl(quote);
  const first = booking.customer.contactPerson || booking.customer.name;
  const text = `Hello ${first.split(" ")[0]}, here is your quote for ${booking.title}: ${url}`;
  const phone = booking.customer.phone?.replace(/\D/g, "") ?? "";
  const btn =
    "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copy} className={btn}>
        {copied ? (
          <Check size={14} className="text-lagoon-deep" />
        ) : (
          <Copy size={14} />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        <MessageCircle size={14} /> WhatsApp
      </a>
      <a
        href={`mailto:${booking.customer.email ?? ""}?subject=${encodeURIComponent(`Your quote: ${booking.title}`)}&body=${encodeURIComponent(text)}`}
        className={btn}
      >
        <Mail size={14} /> Email
      </a>
      <a href={url} target="_blank" rel="noreferrer" className={btn}>
        <ExternalLink size={14} /> Open
      </a>
    </div>
  );
}

/**
 * Share the booking as a quote: pick validity, day prices and a message,
 * then get a link to send. Each share is a new version.
 */
export function ShareQuoteDialog({
  open,
  onClose,
  booking,
  unsavedChanges,
}: {
  open: boolean;
  onClose: () => void;
  booking: BookingDetail;
  /** Edits not saved yet: the quote would miss them. */
  unsavedChanges: boolean;
}) {
  const { data: settings } = useQuoteSettings();
  const create = useCreateQuote(booking.id);
  const [message, setMessage] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [minDate, setMinDate] = useState("");
  const [showDayPrices, setShowDayPrices] = useState(false);
  const [created, setCreated] = useState<Quote | null>(null);

  // Reset each time it opens; defaults come from quote settings.
  useEffect(() => {
    if (!open) return;
    const today = todayIso();
    setMinDate(today);
    setValidUntil(addDays(today, settings?.validityDays ?? 14));
    setShowDayPrices(settings?.showDayPrices ?? false);
    setMessage("");
    setCreated(null);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, settings?.validityDays, settings?.showDayPrices]);

  const summary = booking.summary;
  const money = (v: string) => formatPrice(v, booking.currency);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      { message: message.trim() || null, validUntil, showDayPrices },
      { onSuccess: (res) => setCreated(res.data) },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={create.isPending}
      size="sm"
      title={created ? `Quote v${created.version} is ready` : "Share quote"}
      description={
        created
          ? "Send this link to your customer."
          : `${booking.reference} · ${booking.customer.name}`
      }
    >
      {created ? (
        <div className="space-y-5 px-6 py-6">
          <div className="rounded-xl bg-lagoon-tint px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-lagoon-deep">
              Customer link
            </p>
            <p className="mt-1 break-all font-mono text-sm text-ink">
              {quoteUrl(created)}
            </p>
          </div>
          <ShareLinks quote={created} booking={booking} />
          <p className="text-sm text-ink-soft">
            Total {money(created.total)} · valid until{" "}
            {formatDate(created.validUntil)}. Editing the booking won&apos;t
            change this quote; share again to send a new version.
          </p>
          <div className="flex justify-end border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            {unsavedChanges && (
              <p className="flex items-start gap-2 rounded-xl bg-marigold/15 px-4 py-3 text-sm text-ink">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-marigold"
                  aria-hidden="true"
                />
                You have unsaved changes. Save the booking first so the quote
                includes them.
              </p>
            )}

            {summary && (
              <div className="flex items-baseline justify-between rounded-xl bg-mist/60 px-4 py-3">
                <span className="text-sm text-ink-soft">Total to pay</span>
                <span className="text-xl font-bold tabular-nums text-ink">
                  {money(summary.total)}
                </span>
              </div>
            )}

            <Field
              label="Message to the customer"
              htmlFor="quote-message"
              hint="Shown at the top of the quote. Optional."
            >
              <textarea
                id="quote-message"
                rows={3}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kuzuzangpo! Here is the trip we discussed…"
                className={`${inputCls} h-auto py-2.5`}
              />
            </Field>

            <Field label="Valid until" htmlFor="quote-valid">
              <input
                id="quote-valid"
                type="date"
                min={minDate}
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputCls}
              />
            </Field>

            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-mist/60 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-ink">
                  Show day-by-day prices
                </span>
                <span className="block text-xs text-ink-soft">
                  Off: the customer sees the package total only.
                </span>
              </span>
              <input
                type="checkbox"
                checked={showDayPrices}
                onChange={(e) => setShowDayPrices(e.target.checked)}
                className="mt-1 size-4 accent-lagoon-deep"
              />
            </label>
          </div>

          <ServerError error={create.error} />

          <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={create.isPending}
              className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || unsavedChanges || !validUntil}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-60"
            >
              {create.isPending && (
                <Loader2 size={15} className="animate-spin" />
              )}
              Create quote link
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
