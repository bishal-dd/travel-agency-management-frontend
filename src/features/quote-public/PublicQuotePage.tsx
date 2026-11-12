"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BedDouble,
  Bus,
  CalendarDays,
  Check,
  CheckCircle2,
  Compass,
  Download,
  Loader2,
  MapPin,
  Sparkles,
  Users,
  Utensils,
  X,
  XCircle,
} from "lucide-react";
import { formatPrice } from "@/src/lib/format";
import { getPublicQuote, respondToPublicQuote } from "../quotes/api/quotes";
import type { PublicQuote } from "../quotes/types/quote";

// ---------- formatting (dates are plain YYYY-MM-DD) ----------

const utc = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(
    utc(iso),
  );
const longDate = (iso: string) =>
  fmt(iso, { day: "numeric", month: "long", year: "numeric" });
const dayDate = (iso: string) =>
  fmt(iso, { weekday: "short", day: "numeric", month: "short" });

function dateRange(start: string, end: string) {
  const s = utc(start);
  const e = utc(end);
  if (start === end) return longDate(start);
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();
  if (sameMonth)
    return `${s.getUTCDate()}–${fmt(end, { day: "numeric", month: "long", year: "numeric" })}`;
  return `${fmt(start, sameYear ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" })} – ${longDate(end)}`;
}

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

// ---------- pieces ----------

export function PublicQuoteSkeleton() {
  return (
    <div className="min-h-dvh bg-paper px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-mist" />
        <div className="h-40 animate-pulse rounded-2xl bg-mist" />
        <div className="h-72 animate-pulse rounded-2xl bg-mist" />
      </div>
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "info" | "good" | "bad";
  children: React.ReactNode;
}) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-900"
      : tone === "bad"
        ? "bg-red-50 text-red-800"
        : "bg-marigold/15 text-ink";
  return (
    <div className={`rounded-2xl px-5 py-4 text-sm ${cls}`}>{children}</div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className={strong ? "font-semibold text-ink" : "text-ink-soft"}>
        {label}
      </dt>
      <dd
        className={`tabular-nums ${strong ? "text-2xl font-bold text-ink" : muted ? "text-ink-soft" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}

// ---------- respond ----------

function RespondForm({
  token,
  defaultName,
  onDone,
}: {
  token: string;
  defaultName: string;
  onDone: (q: PublicQuote, message: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input =
    "w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20";

  async function send(answer: "accept" | "decline") {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setPending(answer);
    setError(null);
    try {
      const res = await respondToPublicQuote(token, answer, {
        name: name.trim(),
        message: message.trim() || null,
      });
      onDone(res.data, res.message);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <section
      aria-labelledby="respond-heading"
      className="rounded-2xl border border-line bg-white p-5 sm:p-6 print:hidden"
    >
      <h2 id="respond-heading" className="text-lg font-bold text-ink">
        Happy with this trip?
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Accept to let us know you&apos;d like to go ahead. We&apos;ll confirm
        availability and the next steps.
      </p>
      <div className="mt-4 grid gap-3">
        <div>
          <label
            htmlFor="respond-name"
            className="mb-1 block text-sm font-medium text-ink"
          >
            Your name
          </label>
          <input
            id="respond-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${input} h-11`}
          />
        </div>
        <div>
          <label
            htmlFor="respond-message"
            className="mb-1 block text-sm font-medium text-ink"
          >
            Message{" "}
            <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <textarea
            id="respond-message"
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any questions or requests?"
            className={`${input} py-2.5`}
          />
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => send("decline")}
          disabled={!!pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
        >
          {pending === "decline" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <X size={15} />
          )}{" "}
          Decline
        </button>
        <button
          type="button"
          onClick={() => send("accept")}
          disabled={!!pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-lagoon-deep disabled:opacity-60"
        >
          {pending === "accept" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}{" "}
          Accept quote
        </button>
      </div>
    </section>
  );
}

// ---------- page ----------

/** The customer's quote, opened from the shared link (no sign-in). */
export function PublicQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );
  const [thanks, setThanks] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublicQuote(token)
      .then((res) => {
        if (cancelled) return;
        setQuote(res.data);
        setState("ready");
      })
      .catch((e: Error & { status?: number }) => {
        if (!cancelled) setState(e.status === 404 ? "missing" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === "loading") return <PublicQuoteSkeleton />;
  if (state !== "ready" || !quote) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-4">
        <div className="max-w-sm text-center">
          <p className="text-xl font-bold text-ink">
            {state === "missing"
              ? "This quote link isn't valid any more"
              : "We couldn't load this quote"}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {state === "missing"
              ? "It may have been replaced or withdrawn. Please ask your travel agent for the latest link."
              : "Please check your connection and try again."}
          </p>
        </div>
      </div>
    );
  }

  const q = quote.snapshot;
  const p = q.pricing;
  const money = (v: string) => formatPrice(v, p.currency);
  const pax = `${q.adults} adult${q.adults === 1 ? "" : "s"}${q.children ? ` · ${q.children} child${q.children === 1 ? "" : "ren"}` : ""}`;

  return (
    <div className="min-h-dvh bg-paper print:bg-white">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:py-12 print:max-w-none print:space-y-4 print:p-0">
        {/* Agency + actions */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {q.agency.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={q.agency.logo}
                alt=""
                className="size-11 shrink-0 rounded-xl object-contain"
              />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-lg font-bold text-white">
                {q.agency.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{q.agency.name}</p>
              <p className="text-xs text-ink-soft">
                Quote {q.reference} · v{quote.version}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 print:hidden"
          >
            <Download size={15} /> Save as PDF
          </button>
        </header>

        {/* State */}
        {thanks && (
          <Notice tone="good">
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={16} /> {thanks}
            </p>
          </Notice>
        )}
        {!thanks && quote.status === "accepted" && (
          <Notice tone="good">
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={16} /> Accepted by {quote.respondedName} on{" "}
              {longDate(quote.respondedAt!)}.
            </p>
            <p className="mt-1">
              Your travel agent will confirm the trip with you.
            </p>
          </Notice>
        )}
        {!thanks && quote.status === "declined" && (
          <Notice tone="bad">
            <p className="flex items-center gap-2 font-semibold">
              <XCircle size={16} /> You declined this quote on{" "}
              {longDate(quote.respondedAt!)}.
            </p>
            <p className="mt-1">
              Changed your mind? Contact your travel agent for a new quote.
            </p>
          </Notice>
        )}
        {quote.status === "superseded" && (
          <Notice tone="info">
            <p className="font-semibold">
              A newer version of this quote was sent.
            </p>
            <p className="mt-1">
              Please open the latest link from your travel agent. This one is
              kept for reference.
            </p>
          </Notice>
        )}
        {quote.status === "expired" && (
          <Notice tone="info">
            <p className="font-semibold">
              This quote expired on {longDate(quote.validUntil)}.
            </p>
            <p className="mt-1">
              Prices may have changed. Please ask your travel agent for an
              updated quote.
            </p>
          </Notice>
        )}

        {/* Trip */}
        <section className="rounded-2xl bg-ink p-6 text-white sm:p-8 print:bg-white print:p-0 print:text-ink">
          <p className="text-sm text-white/70 print:text-ink-soft">
            Prepared for {q.customerName}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {q.title}
          </h1>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80 print:text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />{" "}
              {dateRange(q.startDate, q.endDate)} · {q.nights} night
              {q.nights === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} aria-hidden="true" /> {pax}
            </span>
          </p>
          <p className="mt-5 text-sm text-white/70 print:text-ink-soft">
            Total to pay
          </p>
          <p className="text-3xl font-bold tabular-nums">{money(p.total)}</p>
        </section>

        {q.message && (
          <section className="whitespace-pre-line rounded-2xl border border-line bg-white p-5 text-sm leading-relaxed text-ink sm:p-6">
            {q.message}
          </section>
        )}

        {/* Itinerary */}
        <section aria-labelledby="itinerary-heading">
          <h2
            id="itinerary-heading"
            className="mb-3 text-lg font-bold text-ink"
          >
            Your itinerary
          </h2>
          <ol className="space-y-3">
            {q.days.map((d) => {
              const meals = d.meals.map((m) => MEAL_LABEL[m] ?? m);
              return (
                <li
                  key={d.dayNumber}
                  className="break-inside-avoid rounded-2xl border border-line bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-lagoon-deep">
                        Day {d.dayNumber} · {dayDate(d.date)}
                      </p>
                      <h3 className="mt-0.5 font-bold text-ink">{d.title}</h3>
                      {d.destination && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft">
                          <MapPin size={13} aria-hidden="true" />{" "}
                          {d.destination}
                        </p>
                      )}
                    </div>
                    {d.price && (
                      <p className="shrink-0 font-semibold tabular-nums text-ink">
                        {money(d.price)}
                      </p>
                    )}
                  </div>

                  {d.description && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {d.description}
                    </p>
                  )}

                  {d.activities.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-ink">
                      {d.activities.map((a) => (
                        <li key={a} className="flex gap-2">
                          <Sparkles
                            size={13}
                            className="mt-1 shrink-0 text-marigold"
                            aria-hidden="true"
                          />{" "}
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-3 text-sm text-ink-soft">
                    {(d.hotel || d.overnightLocation) && (
                      <span className="inline-flex items-center gap-1.5">
                        <BedDouble size={14} aria-hidden="true" />
                        {d.hotel ?? `Overnight in ${d.overnightLocation}`}
                      </span>
                    )}
                    {meals.length > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Utensils size={14} aria-hidden="true" />{" "}
                        {meals.join(", ")}
                      </span>
                    )}
                    {d.transport && (
                      <span className="inline-flex items-center gap-1.5">
                        <Bus size={14} aria-hidden="true" /> Private vehicle
                        &amp; driver
                      </span>
                    )}
                    {d.guide && (
                      <span className="inline-flex items-center gap-1.5">
                        <Compass size={14} aria-hidden="true" /> Licensed guide
                      </span>
                    )}
                    {d.extras.map((x) => (
                      <span
                        key={x}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Check size={14} aria-hidden="true" /> {x}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Inclusions */}
        {(q.inclusions.length > 0 || q.exclusions.length > 0) && (
          <section className="grid gap-4 break-inside-avoid sm:grid-cols-2">
            {q.inclusions.length > 0 && (
              <div className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-bold text-ink">Included</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-ink">
                  {q.inclusions.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />{" "}
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {q.exclusions.length > 0 && (
              <div className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-bold text-ink">Not included</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-ink">
                  {q.exclusions.map((x) => (
                    <li key={x} className="flex gap-2">
                      <X
                        size={14}
                        className="mt-0.5 shrink-0 text-ink-soft"
                        aria-hidden="true"
                      />{" "}
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Price */}
        <section
          aria-labelledby="price-heading"
          className="break-inside-avoid rounded-2xl border border-line bg-white p-5 sm:p-6"
        >
          <h2 id="price-heading" className="text-lg font-bold text-ink">
            Price
          </h2>
          <dl className="mt-3 text-sm">
            <Row label="Trip" value={money(p.tripPrice)} />
            {p.gst && !p.gst.inclusive && (
              <Row
                label={`GST ${Number(p.gst.rate)}%`}
                value={money(p.gst.amount)}
              />
            )}
            {Number(p.sdf) > 0 && (
              <Row
                label="Sustainable Development Fee (SDF)"
                value={money(p.sdf)}
              />
            )}
            {Number(p.visa) > 0 && (
              <Row label="Visa fees" value={money(p.visa)} />
            )}
            <div className="mt-2 border-t border-line pt-2">
              <Row label="Total to pay" value={money(p.total)} strong />
            </div>
            {p.gst?.inclusive && (
              <p className="text-right text-xs text-ink-soft">
                Includes GST {Number(p.gst.rate)}% of {money(p.gst.amount)}
              </p>
            )}
          </dl>

          {p.feeLines && p.feeLines.length > 0 && (
            <details className="mt-4 rounded-xl bg-mist/60 px-4 py-3 text-sm print:hidden">
              <summary className="cursor-pointer font-semibold text-ink">
                Government fees per traveller
              </summary>
              <ul className="mt-2 space-y-1 text-ink-soft">
                {p.feeLines.map((f) => (
                  <li
                    key={`${f.description}-${f.amount}`}
                    className="flex justify-between gap-4"
                  >
                    <span>
                      {f.description
                        .replace(/^SDF · /, "SDF: ")
                        .replace(/^Visa · /, "Visa: ")}
                      {f.quantity > 1 &&
                        ` (${f.quantity} × ${formatPrice(f.unitAmount, f.currency)})`}
                    </span>
                    <span className="tabular-nums">{money(f.amount)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {/* A closed <details> doesn't print, so the PDF gets its own copy. */}
          {p.feeLines && p.feeLines.length > 0 && (
            <ul className="mt-3 hidden space-y-0.5 text-xs text-ink-soft print:block">
              {p.feeLines.map((f) => (
                <li
                  key={`print-${f.description}-${f.amount}`}
                  className="flex justify-between gap-4"
                >
                  <span>{f.description}</span>
                  <span className="tabular-nums">{money(f.amount)}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-ink-soft">
            Valid until {longDate(quote.validUntil)}. SDF and visa fees are set
            by the Royal Government of Bhutan and passed on at cost.
          </p>
        </section>

        {/* Terms */}
        {(q.terms.payment || q.terms.cancellation) && (
          <section className="space-y-4 break-inside-avoid rounded-2xl border border-line bg-white p-5 text-sm sm:p-6">
            {q.terms.payment && (
              <div>
                <h2 className="font-bold text-ink">Payment terms</h2>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-ink-soft">
                  {q.terms.payment}
                </p>
              </div>
            )}
            {q.terms.cancellation && (
              <div>
                <h2 className="font-bold text-ink">Cancellation policy</h2>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-ink-soft">
                  {q.terms.cancellation}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Respond */}
        {quote.canRespond && !thanks && (
          <RespondForm
            token={token}
            defaultName={q.travellers[0] ?? q.customerName}
            onDone={(updated, message) => {
              setQuote(updated);
              setThanks(message);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {q.terms.footer && (
          <p className="whitespace-pre-line text-center text-xs text-ink-soft">
            {q.terms.footer}
          </p>
        )}
        <p className="text-center text-xs text-ink-soft/70 print:hidden">
          Sent {longDate(quote.sentAt)}
        </p>
      </div>
    </div>
  );
}
