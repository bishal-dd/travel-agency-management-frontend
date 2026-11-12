"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import type { BookingDetail } from "../../bookings/types/booking";
import { formatPrice } from "@/src/lib/format";
import { useBookingQuotes, useRevokeQuote } from "../hooks/useQuotes";
import type { Quote, QuoteStatus } from "../types/quote";
import { ShareLinks, ShareQuoteDialog } from "./ShareQuoteDialog";
import { formatDate } from "../../bookings/ui/bookingUi";

const STATUS: Record<QuoteStatus, { label: string; cls: string }> = {
  sent: { label: "Sent", cls: "bg-mist text-ink-soft" },
  viewed: { label: "Viewed", cls: "bg-lagoon-tint text-lagoon-deep" },
  accepted: { label: "Accepted", cls: "bg-emerald-100 text-emerald-800" },
  declined: { label: "Declined", cls: "bg-red-50 text-red-700" },
  superseded: { label: "Replaced", cls: "bg-mist text-ink-soft/70" },
  revoked: { label: "Revoked", cls: "bg-mist text-ink-soft/70" },
  expired: { label: "Expired", cls: "bg-marigold/20 text-ink" },
};

/** "10 Nov, 14:05" in the viewer's own timezone. */
const formatWhen = (ts: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));

function QuoteRow({
  quote,
  booking,
  canEdit,
}: {
  quote: Quote;
  booking: BookingDetail;
  canEdit: boolean;
}) {
  const revoke = useRevokeQuote(booking.id);
  const [confirming, setConfirming] = useState(false);
  const s = STATUS[quote.effectiveStatus];
  const open =
    quote.effectiveStatus === "sent" || quote.effectiveStatus === "viewed";
  const answered = quote.status === "accepted" || quote.status === "declined";

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-ink">v{quote.version}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
          >
            {s.label}
          </span>
        </p>
        <p className="text-sm font-semibold tabular-nums text-ink">
          {formatPrice(quote.total, quote.currency)}
        </p>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        Sent {formatWhen(quote.createdAt)} · valid until{" "}
        {formatDate(quote.validUntil)}
      </p>
      {quote.viewCount > 0 && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
          <Eye size={12} aria-hidden="true" /> Opened {quote.viewCount}× · last{" "}
          {formatWhen(quote.lastViewedAt!)}
        </p>
      )}

      {answered && (
        <div
          className={`mt-2 rounded-lg px-3 py-2 text-sm ${
            quote.status === "accepted"
              ? "bg-emerald-50 text-emerald-900"
              : "bg-red-50 text-red-800"
          }`}
        >
          <p className="flex items-center gap-1.5 font-semibold">
            {quote.status === "accepted" ? (
              <CheckCircle2 size={14} />
            ) : (
              <XCircle size={14} />
            )}
            {quote.status === "accepted" ? "Accepted" : "Declined"} by{" "}
            {quote.respondedName}
            <span className="font-normal opacity-80">
              · {formatWhen(quote.respondedAt!)}
            </span>
          </p>
          {quote.responseMessage && (
            <p className="mt-1 whitespace-pre-line">
              “{quote.responseMessage}”
            </p>
          )}
          {quote.status === "accepted" && booking.status === "quoted" && (
            <p className="mt-1 text-xs">
              Confirm the booking to lock in the trip and fees.
            </p>
          )}
        </div>
      )}

      {open && (
        <div className="mt-2 space-y-2">
          <ShareLinks quote={quote} booking={booking} />
          {canEdit &&
            (confirming ? (
              <p className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                The customer won&apos;t be able to open this link any more.
                <button
                  type="button"
                  onClick={() =>
                    revoke.mutate(quote.id, {
                      onSuccess: () => setConfirming(false),
                    })
                  }
                  disabled={revoke.isPending}
                  className="inline-flex items-center gap-1 font-semibold text-red-600 hover:underline"
                >
                  {revoke.isPending && (
                    <Loader2 size={12} className="animate-spin" />
                  )}{" "}
                  Revoke link
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="font-semibold hover:underline"
                >
                  Keep
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-xs font-semibold text-ink-soft hover:text-red-600"
              >
                Revoke link
              </button>
            ))}
          {revoke.error && (
            <p className="text-xs text-red-700">{revoke.error.message}</p>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * The booking's quotes: share a new version, see what was sent, whether the
 * customer opened it, and their answer.
 */
export function QuotesPanel({
  booking,
  unsavedChanges,
}: {
  booking: BookingDetail;
  unsavedChanges: boolean;
}) {
  const { data: quotes = [], isPending, error } = useBookingQuotes(booking.id);
  const [shareOpen, setShareOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const canShare = booking.status === "inquiry" || booking.status === "quoted";
  const visible = showAll ? quotes : quotes.slice(0, 2);

  return (
    <section
      aria-labelledby="quotes-heading"
      className="rounded-2xl border border-line bg-white p-5"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2
          id="quotes-heading"
          className="text-sm font-semibold uppercase tracking-wide text-ink-soft"
        >
          Quotes{quotes.length > 0 && ` · ${quotes.length}`}
        </h2>
        {canShare && (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-white hover:bg-lagoon-deep"
          >
            <Send size={13} />{" "}
            {quotes.length ? "Share new version" : "Share quote"}
          </button>
        )}
      </div>

      {isPending ? (
        <div className="mt-3 h-16 animate-pulse rounded-lg bg-mist" />
      ) : error ? (
        <p className="mt-2 text-sm text-red-700">
          Couldn&apos;t load quotes: {error.message}
        </p>
      ) : quotes.length === 0 ? (
        <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
          <FileText size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          {canShare
            ? "No quote sent yet. Share one to send the customer a link with the itinerary and price."
            : "No quotes were sent for this booking."}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {visible.map((q) => (
              <QuoteRow
                key={q.id}
                quote={q}
                booking={booking}
                canEdit={canShare}
              />
            ))}
          </ul>
          {quotes.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-1 text-xs font-semibold text-lagoon-deep hover:underline"
            >
              {showAll ? "Show fewer" : `Show all ${quotes.length} versions`}
            </button>
          )}
        </>
      )}

      <ShareQuoteDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        booking={booking}
        unsavedChanges={unsavedChanges}
      />
    </section>
  );
}
