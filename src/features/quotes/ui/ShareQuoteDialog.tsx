"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Link2,
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

/** Placeholder the agent sees in the message; replaced with the real link when sending. */
const LINK = "[quote link]";

/** wa.me wants digits with the country code. Bhutan mobiles (17/77 + 6 digits) get 975. */
function whatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^00/, "");
  if (/^(17|77)\d{6}$/.test(digits)) return `975${digits}`;
  return digits;
}

const whatsappUrl = (phone: string, text: string) =>
  `https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(text)}`;

const mailtoUrl = (to: string, subject: string, body: string) =>
  `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Gmail's compose window, prefilled. Works without a desktop email app. */
const gmailUrl = (to: string, subject: string, body: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Where email opens: Gmail in the browser, or the computer's email app. Remembered per browser. */
type EmailApp = "gmail" | "app";
const EMAIL_APP_KEY = "hmt:emailApp";
const readEmailApp = (): EmailApp => {
  try {
    return localStorage.getItem(EMAIL_APP_KEY) === "app" ? "app" : "gmail";
  } catch {
    return "gmail";
  }
};

const firstName = (b: BookingDetail) =>
  (b.customer.contactPerson || b.customer.name).split(" ")[0];

/** "John Smith · Classic Bhutan, 7 days" → "Classic Bhutan, 7 days" (the name is already in the greeting). */
const tripName = (b: BookingDetail) => {
  const prefix = `${b.customer.name} · `;
  return b.title.startsWith(prefix) ? b.title.slice(prefix.length) : b.title;
};

const defaultMessage = (b: BookingDetail) =>
  `Hello ${firstName(b)}, here is your quote for ${tripName(b)}:\n${LINK}\n\nLet us know if you have any questions.`;

const emailSubject = (b: BookingDetail) => `Your quote: ${tripName(b)}`;

/** Ready-made share buttons for an existing quote: copy, WhatsApp, email, open. */
export function ShareLinks({
  quote,
  booking,
}: {
  quote: Quote;
  booking: BookingDetail;
}) {
  const [copied, setCopied] = useState(false);
  const url = quoteUrl(quote);
  const text = defaultMessage(booking).replace(LINK, url);
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
        href={whatsappUrl(booking.customer.phone ?? "", text)}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        <MessageCircle size={14} /> WhatsApp
      </a>
      <a
        href={gmailUrl(
          booking.customer.email ?? "",
          emailSubject(booking),
          text,
        )}
        target="_blank"
        rel="noreferrer"
        className={btn}
      >
        <Mail size={14} /> Gmail
      </a>
      <a
        href={mailtoUrl(
          booking.customer.email ?? "",
          emailSubject(booking),
          text,
        )}
        className={btn}
      >
        <Mail size={14} /> Email app
      </a>
      <a href={url} target="_blank" rel="noreferrer" className={btn}>
        <ExternalLink size={14} /> Open
      </a>
    </div>
  );
}

type Channel = "whatsapp" | "email" | "copy";

const CHANNELS: { value: Channel; label: string; icon: typeof Mail }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
  { value: "copy", label: "Link", icon: Link2 },
];

/**
 * Send the booking as a quote in one step: choose WhatsApp / email / link,
 * check the recipient and message, then "Send". The quote is created and
 * WhatsApp or the email app opens with everything filled in.
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

  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailApp, setEmailApp] = useState<EmailApp>("gmail");
  const [text, setText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [pageNote, setPageNote] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [minDate, setMinDate] = useState("");
  const [showDayPrices, setShowDayPrices] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset each time it opens; defaults from the customer and quote settings.
  useEffect(() => {
    if (!open) return;
    const today = todayIso();
    setMinDate(today);
    setValidUntil(addDays(today, settings?.validityDays ?? 14));
    setShowDayPrices(settings?.showDayPrices ?? false);
    setPhone(booking.customer.phone ?? "");
    setEmail(booking.customer.email ?? "");
    setEmailApp(readEmailApp());
    setChannel(
      booking.customer.phone
        ? "whatsapp"
        : booking.customer.email
          ? "email"
          : "copy",
    );
    setText(defaultMessage(booking));
    setPageNote("");
    setMoreOpen(false);
    setFormError(null);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, settings?.validityDays, settings?.showDayPrices]);

  const money = (v: string) => formatPrice(v, booking.currency);
  const subject = emailSubject(booking);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (channel === "whatsapp" && whatsappNumber(phone).length < 8) {
      return setFormError(
        "Enter the customer's WhatsApp number, with the country code for numbers outside Bhutan.",
      );
    }
    if (
      channel === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return setFormError("Enter the customer's email address.");
    }
    if (channel !== "copy" && !text.includes(LINK)) {
      return setFormError(
        `Keep ${LINK} in the message so the customer gets the link.`,
      );
    }
    setFormError(null);

    // Browsers only allow a new tab straight from a click, so open it now and
    // point it at WhatsApp / Gmail once the quote exists.
    const opensTab =
      channel === "whatsapp" || (channel === "email" && emailApp === "gmail");
    const tab = opensTab ? window.open("about:blank", "_blank") : null;
    if (channel === "email") {
      try {
        localStorage.setItem(EMAIL_APP_KEY, emailApp);
      } catch {
        // not critical
      }
    }

    create.mutate(
      { message: pageNote.trim() || null, validUntil, showDayPrices },
      {
        onSuccess: async (res) => {
          const quote = res.data;
          const message = text.replace(LINK, quoteUrl(quote));
          if (channel === "whatsapp") {
            const url = whatsappUrl(phone, message);
            if (tab) tab.location.href = url;
            else window.open(url, "_blank");
          } else if (channel === "email" && emailApp === "gmail") {
            const url = gmailUrl(email.trim(), subject, message);
            if (tab) tab.location.href = url;
            else window.open(url, "_blank");
          } else if (channel === "email") {
            // Hands off to the computer's email app (DevTools shows this as "canceled").
            window.location.href = mailtoUrl(email.trim(), subject, message);
          } else {
            try {
              await navigator.clipboard.writeText(quoteUrl(quote));
            } catch {
              // the link is shown on the next screen anyway
            }
          }
          // Done: the new version shows in the Quotes panel.
          onClose();
        },
        onError: () => tab?.close(),
      },
    );
  }

  const sendLabel =
    channel === "whatsapp"
      ? "Send on WhatsApp"
      : channel === "email"
        ? emailApp === "gmail"
          ? "Send with Gmail"
          : "Send by email"
        : "Create & copy link";

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={create.isPending}
      size="sm"
      title="Send quote"
      description={`${booking.reference} · ${booking.customer.name}`}
    >
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

          {booking.summary && (
            <div className="flex items-baseline justify-between rounded-xl bg-mist/60 px-4 py-3">
              <span className="text-sm text-ink-soft">Total to pay</span>
              <span className="text-xl font-bold tabular-nums text-ink">
                {money(booking.summary.total)}
              </span>
            </div>
          )}

          {/* Send via */}
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-ink">
              Send via
            </legend>
            <div
              className="grid grid-cols-3 gap-1 rounded-xl bg-mist p-1"
              role="radiogroup"
            >
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={channel === c.value}
                  onClick={() => {
                    setChannel(c.value);
                    setFormError(null);
                  }}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-colors ${
                    channel === c.value
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <c.icon size={14} aria-hidden="true" />
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          {channel === "whatsapp" && (
            <Field
              label="WhatsApp number"
              htmlFor="send-phone"
              hint="Bhutan numbers work as they are; add the country code for others, e.g. +44 7700 900123."
            >
              <input
                id="send-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="17 123 456"
                className={inputCls}
              />
            </Field>
          )}
          {channel === "email" && (
            <Field label="Email" htmlFor="send-email">
              <input
                id="send-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className={inputCls}
              />
              <div
                className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                role="radiogroup"
                aria-label="Open in"
              >
                <span className="text-xs text-ink-soft">Open in</span>
                {(
                  [
                    ["gmail", "Gmail"],
                    ["app", "My email app"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="inline-flex cursor-pointer items-center gap-1.5"
                  >
                    <input
                      type="radio"
                      name="email-app"
                      checked={emailApp === value}
                      onChange={() => setEmailApp(value)}
                      className="accent-lagoon-deep"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
          )}
          {channel !== "copy" && (
            <Field
              label="Message"
              htmlFor="send-text"
              hint={`${LINK} becomes the quote's link when it's sent.`}
            >
              <textarea
                id="send-text"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`${inputCls} h-auto py-2.5 leading-relaxed`}
              />
            </Field>
          )}

          {/* Less-used options */}
          <div className="rounded-xl ring-1 ring-inset ring-line">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm"
            >
              <span>
                <span className="font-medium text-ink">More options</span>
                <span className="block text-xs text-ink-soft">
                  Valid until {validUntil ? formatDate(validUntil) : "…"} ·{" "}
                  {showDayPrices ? "day prices shown" : "total only"}
                  {pageNote.trim() ? " · note on quote" : ""}
                </span>
              </span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`shrink-0 text-ink-soft transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>
            {moreOpen && (
              <div className="space-y-4 border-t border-line px-4 py-4">
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
                <label className="flex cursor-pointer items-start justify-between gap-4">
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
                <Field
                  label="Note on the quote page"
                  htmlFor="quote-message"
                  hint="Shown at the top of the quote itself. Optional."
                >
                  <textarea
                    id="quote-message"
                    rows={3}
                    maxLength={2000}
                    value={pageNote}
                    onChange={(e) => setPageNote(e.target.value)}
                    placeholder="Kuzuzangpo! Here is the trip we discussed…"
                    className={`${inputCls} h-auto py-2.5`}
                  />
                </Field>
              </div>
            )}
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
            {create.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : channel === "whatsapp" ? (
              <MessageCircle size={15} aria-hidden="true" />
            ) : channel === "email" ? (
              <Mail size={15} aria-hidden="true" />
            ) : (
              <Link2 size={15} aria-hidden="true" />
            )}
            {sendLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
