"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Eye,
  FileText,
  Inbox,
  MapPin,
  Plane,
  Send,
  Undo2,
  XCircle,
} from "lucide-react";
import type { Activity, Overview } from "../types/overview";
import {
  Delta,
  EmptyLine,
  Panel,
  PayBadge,
  RowLink,
  bookingHref,
  dayMonth,
  monthShort,
  money,
  relativeDay,
  timeAgo,
  weekdayDate,
} from "./parts";

// ---------- this month ----------

function Tile({
  label,
  value,
  sub,
  children,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink">
        {value}
      </p>
      <div className="mt-1 min-h-4">{sub}</div>
      {children}
    </div>
  );
}

export function MonthTiles({ o }: { o: Overview }) {
  const m = o.thisMonth.money;
  const c = o.thisMonth.counts;
  const lm = o.thisMonth.lastMonth;
  const last = lastMonthLabel(o.today);
  const conv = o.thisMonth.conversion;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {m ? (
        <>
          <Tile
            label="Confirmed this month"
            value={money(m.confirmedValue, o.currency)}
            sub={
              <span className="text-xs text-ink-soft">
                {c.confirmed} booking{c.confirmed === 1 ? "" : "s"} ·{" "}
                <Delta
                  now={Number(m.confirmedValue)}
                  before={Number(m.confirmedValueLastMonth)}
                  label={last}
                />
              </span>
            }
          />
          <Tile
            label="Received"
            value={money(m.received, o.currency)}
            sub={
              <Delta
                now={Number(m.received)}
                before={Number(m.receivedLastMonth)}
                label={last}
              />
            }
          />
          <Tile
            label="Profit"
            value={money(m.profit, o.currency)}
            sub={
              <span className="text-xs text-ink-soft">
                {m.margin != null
                  ? `${m.margin}% margin`
                  : "No confirmed trips yet"}
              </span>
            }
          />
          <Tile
            label="Still to collect"
            value={money(m.outstanding, o.currency)}
            sub={
              Number(m.overdue) > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                  <AlertTriangle size={12} aria-hidden="true" />{" "}
                  {money(m.overdue, o.currency)} overdue
                </span>
              ) : (
                <span className="text-xs text-ink-soft">
                  On upcoming and current trips
                </span>
              )
            }
          />
        </>
      ) : (
        <>
          <Tile
            label="New inquiries"
            value={String(c.inquiries)}
            sub={<Delta now={c.inquiries} before={lm.inquiries} label={last} />}
          />
          <Tile
            label="Quotes sent"
            value={String(c.quotesSent)}
            sub={
              <Delta now={c.quotesSent} before={lm.quotesSent} label={last} />
            }
          />
          <Tile
            label="Confirmed"
            value={String(c.confirmed)}
            sub={<Delta now={c.confirmed} before={lm.confirmed} label={last} />}
          />
          <Tile
            label="Quote conversion"
            value={conv != null ? `${conv}%` : "–"}
            sub={
              <span className="text-xs text-ink-soft">
                {c.quotesAccepted} of {c.quotesSent} accepted
              </span>
            }
          />
        </>
      )}
    </div>
  );
}

function lastMonthLabel(today: string) {
  const [y, mo] = today.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, mo - 2, 1));
  return monthShort(d.toISOString().slice(0, 7));
}

// ---------- needs attention ----------

type Todo = {
  key: string;
  href: string;
  icon: React.ReactNode;
  tone: "red" | "amber" | "plain";
  title: string;
  meta: string;
  right?: string;
};

export function NeedsAttention({ o }: { o: Overview }) {
  const a = o.attention;
  const todos: Todo[] = [
    ...(a.overduePayments?.items ?? []).map((p) => ({
      key: `od-${p.bookingId}`,
      href: bookingHref(p.bookingId),
      icon: <AlertTriangle size={16} />,
      tone: "red" as const,
      title: `${p.label ?? "Payment"} overdue · ${p.customerName}`,
      meta: `${p.reference} · was due ${p.dueDate ? dayMonth(p.dueDate) : ""}`,
      right: money(p.amount, p.currency),
    })),
    ...a.acceptedQuotes.items.map((q) => ({
      key: `aq-${q.quoteId}`,
      href: bookingHref(q.bookingId),
      icon: <CheckCircle2 size={16} />,
      tone: "plain" as const,
      title: `Quote accepted · confirm ${q.customerName}'s trip`,
      meta: `${q.reference} · v${q.version}${q.respondedName ? ` by ${q.respondedName}` : ""}`,
      right: q.total ? money(q.total, q.currency) : undefined,
    })),
    ...(a.paymentsDueSoon?.items ?? []).map((p) => ({
      key: `due-${p.bookingId}`,
      href: bookingHref(p.bookingId),
      icon: <CalendarClock size={16} />,
      tone: "amber" as const,
      title: `${p.label ?? "Payment"} due ${p.dueDate ? relativeDay(o.today, p.dueDate) : ""} · ${p.customerName}`,
      meta: `${p.reference} · due ${p.dueDate ? dayMonth(p.dueDate) : ""}`,
      right: money(p.amount, p.currency),
    })),
    ...a.expiringQuotes.items.map((q) => ({
      key: `eq-${q.quoteId}`,
      href: bookingHref(q.bookingId),
      icon: <Clock size={16} />,
      tone: "amber" as const,
      title: `Quote expires ${relativeDay(o.today, q.validUntil)} · ${q.customerName}`,
      meta: `${q.reference} · v${q.version} · ${q.viewCount ? `opened ${q.viewCount}×` : "not opened yet"}`,
    })),
    ...a.staleInquiries.items.map((b) => ({
      key: `si-${b.bookingId}`,
      href: bookingHref(b.bookingId),
      icon: <Inbox size={16} />,
      tone: "plain" as const,
      title: `No quote sent yet · ${b.customerName}`,
      meta: `${b.reference} · inquiry from ${dayMonth(b.createdAt)}`,
    })),
  ];
  const more =
    a.acceptedQuotes.total -
    a.acceptedQuotes.items.length +
    (a.expiringQuotes.total - a.expiringQuotes.items.length) +
    (a.staleInquiries.total - a.staleInquiries.items.length) +
    ((a.overduePayments?.total ?? 0) - (a.overduePayments?.items.length ?? 0)) +
    ((a.paymentsDueSoon?.total ?? 0) - (a.paymentsDueSoon?.items.length ?? 0));
  const tone = {
    red: "bg-red-50 text-red-700",
    amber: "bg-marigold/20 text-ink",
    plain: "bg-lagoon-tint text-lagoon-deep",
  };

  return (
    <Panel title="Needs attention" count={todos.length + more}>
      {todos.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <CheckCircle2
            size={22}
            className="mx-auto text-emerald-600"
            aria-hidden="true"
          />
          <p className="mt-2 font-semibold text-ink">All caught up</p>
          <p className="text-sm text-ink-soft">
            Nothing overdue, expiring or waiting on you.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {todos.slice(0, 10).map((t) => (
            <RowLink key={t.key} href={t.href}>
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone[t.tone]}`}
                  aria-hidden="true"
                >
                  {t.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-ink sm:truncate">
                    {t.title}
                  </p>
                  <p className="truncate text-xs text-ink-soft">{t.meta}</p>
                </div>
                {t.right && (
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {t.right}
                  </span>
                )}
              </div>
            </RowLink>
          ))}
        </ul>
      )}
      {todos.length + more > 10 && (
        <p className="border-t border-line px-5 py-2.5 text-xs text-ink-soft">
          +{todos.length + more - 10} more
        </p>
      )}
    </Panel>
  );
}

// ---------- coming up ----------

export function ComingUp({ o }: { o: Overview }) {
  const { inCountry, departing } = o.upcoming;
  return (
    <Panel
      title="Coming up"
      action={
        <Link
          href="/dashboard/bookings"
          className="text-sm font-semibold text-lagoon-deep hover:underline"
        >
          All bookings
        </Link>
      }
    >
      {inCountry.total > 0 && (
        <>
          <p className="flex items-center gap-1.5 px-5 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <MapPin size={12} aria-hidden="true" /> In Bhutan now ·{" "}
            {inCountry.total}
          </p>
          <ul>
            {inCountry.items.map((t) => (
              <RowLink key={t.bookingId} href={bookingHref(t.bookingId)}>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {t.customerName}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {t.reference} · leaves {weekdayDate(t.endDate)} ·{" "}
                      {t.travellers} traveller{t.travellers === 1 ? "" : "s"}
                    </p>
                  </div>
                  <PayBadge status={t.paymentStatus} />
                </div>
              </RowLink>
            ))}
          </ul>
        </>
      )}

      <p className="flex items-center gap-1.5 px-5 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        <Plane size={12} aria-hidden="true" /> Departing in the next 30 days ·{" "}
        {departing.total}
      </p>
      {departing.total === 0 ? (
        <EmptyLine>No confirmed trips in the next 30 days.</EmptyLine>
      ) : (
        <ul>
          {departing.items.map((t) => (
            <RowLink key={t.bookingId} href={bookingHref(t.bookingId)}>
              <div className="flex items-center gap-3">
                <div className="w-12 shrink-0 text-center">
                  <p className="text-xs font-semibold uppercase text-ink-soft">
                    {monthShort(t.startDate.slice(0, 7))}
                  </p>
                  <p className="text-lg font-bold leading-tight tabular-nums text-ink">
                    {Number(t.startDate.slice(8, 10))}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {t.customerName}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {t.reference} · {relativeDay(o.today, t.startDate)} ·{" "}
                    {t.travellers} traveller{t.travellers === 1 ? "" : "s"}
                    {t.balance &&
                      Number(t.balance) > 0 &&
                      ` · ${money(t.balance, t.currency)} to pay`}
                  </p>
                </div>
                <PayBadge status={t.paymentStatus} />
              </div>
            </RowLink>
          ))}
        </ul>
      )}
      {departing.total > departing.items.length && (
        <p className="border-t border-line px-5 py-2.5 text-xs text-ink-soft">
          +{departing.total - departing.items.length} more
        </p>
      )}
    </Panel>
  );
}

// ---------- trend ----------

/**
 * Six months as bars. One series at a time (toggle), so it's one colour, one
 * axis, no legend. Hover/focus a bar for its value; the latest bar is labelled.
 */
export function TrendChart({ o }: { o: Overview }) {
  const [series, setSeries] = useState<"confirmedValue" | "received">(
    "confirmedValue",
  );
  const [active, setActive] = useState<number | null>(null);
  if (!o.trend) return null;

  const values = o.trend.map((t) => Number(t[series]));
  const max = Math.max(...values, 1);
  // Three recessive gridlines at nice-ish steps.
  const step = niceStep(max / 3);
  const top = Math.ceil(max / step) * step; // just above the tallest bar
  const ticks = Array.from(
    { length: Math.round(top / step) + 1 },
    (_, i) => i * step,
  );
  const label =
    series === "confirmedValue" ? "Confirmed value" : "Money received";
  const shown = active ?? values.length - 1;

  return (
    <Panel
      title="Last 6 months"
      action={
        <div
          role="tablist"
          aria-label="Measure"
          className="flex gap-1 rounded-full bg-mist p-1"
        >
          {(
            [
              ["confirmedValue", "Confirmed"],
              ["received", "Received"],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={series === key}
              onClick={() => setSeries(key)}
              className={`h-7 rounded-full px-3 text-xs font-semibold transition-colors ${
                series === key
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      }
    >
      <div className="px-5 pb-4 pt-4">
        <p className="text-xs text-ink-soft">
          {label}, {o.currency} ·{" "}
          <span className="font-semibold text-ink">
            {monthShort(o.trend[shown]!.month)}
          </span>{" "}
          <span className="font-semibold tabular-nums text-ink">
            {money(String(values[shown]), o.currency)}
          </span>
        </p>
        <div className="relative mt-3 h-44" aria-hidden="true">
          {/* gridlines */}
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-line"
              style={{ bottom: `${(t / top) * 100}%` }}
            >
              <span className="absolute -top-2.5 right-0 bg-white pl-1 text-[10px] tabular-nums text-ink-soft">
                {compact(t)}
              </span>
            </div>
          ))}
          <div className="absolute inset-0 flex items-end gap-2 pr-10">
            {o.trend.map((t, i) => {
              const h = (values[i]! / top) * 100;
              const on = shown === i;
              return (
                <button
                  key={t.month}
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <span
                    className={`w-full max-w-10 rounded-t-[4px] transition-colors ${on ? "bg-lagoon-deep" : "bg-lagoon-deep/45 group-hover:bg-lagoon-deep/70"}`}
                    style={{
                      height: `${Math.max(values[i]! > 0 ? 2 : 0, h)}%`,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-1.5 flex gap-2 pr-10" aria-hidden="true">
          {o.trend.map((t, i) => (
            <span
              key={t.month}
              className={`flex-1 text-center text-xs ${shown === i ? "font-semibold text-ink" : "text-ink-soft"}`}
            >
              {monthShort(t.month)}
            </span>
          ))}
        </div>
        {/* The same numbers for screen readers. */}
        <table className="sr-only">
          <caption>
            {label} by month, {o.currency}
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Confirmed</th>
              <th scope="col">Received</th>
            </tr>
          </thead>
          <tbody>
            {o.trend.map((t) => (
              <tr key={t.month}>
                <th scope="row">{t.month}</th>
                <td>{money(t.confirmedValue, o.currency)}</td>
                <td>{money(t.received, o.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/** 1500000 → "1.5M", 85000 → "85K" */
function compact(v: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
}

// ---------- activity ----------

/** "Quote v2 by Emma Clarke" → "Quote v2" (the name is already in the sentence). */
const quoteName = (a: Activity) => (a.detail ?? "a quote").split(" by ")[0]!;

const ACTIVITY: Record<
  Activity["type"],
  { icon: typeof Send; text: (a: Activity) => string }
> = {
  quote_sent: {
    icon: Send,
    text: (a) => `${a.detail ?? "Quote"} sent to ${a.customerName}`,
  },
  quote_viewed: {
    icon: Eye,
    text: (a) => `${a.customerName} opened ${a.detail ?? "a quote"}`,
  },
  quote_accepted: {
    icon: CheckCircle2,
    text: (a) => `${a.customerName} accepted ${quoteName(a)}`,
  },
  quote_declined: {
    icon: XCircle,
    text: (a) => `${a.customerName} declined ${quoteName(a)}`,
  },
  booking_created: {
    icon: FileText,
    text: (a) => `New inquiry from ${a.customerName}`,
  },
  booking_confirmed: {
    icon: CheckCircle2,
    text: (a) => `${a.customerName}'s trip confirmed`,
  },
  payment: {
    icon: CircleDollarSign,
    text: (a) => `Payment from ${a.customerName}`,
  },
  refund: { icon: Undo2, text: (a) => `Refund to ${a.customerName}` },
};

export function ActivityFeed({ o }: { o: Overview }) {
  // Relative times use the clock, read on the client only.
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <Panel title="Recent activity">
      {o.activity.length === 0 ? (
        <EmptyLine>
          Activity shows here as quotes go out and payments come in.
        </EmptyLine>
      ) : (
        <ul className="divide-y divide-line">
          {o.activity.map((a, i) => {
            const A = ACTIVITY[a.type];
            return (
              <RowLink
                key={`${a.type}-${a.bookingId}-${a.at}-${i}`}
                href={bookingHref(a.bookingId)}
              >
                <div className="flex items-center gap-3">
                  <A.icon
                    size={15}
                    className="shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                  <p className="line-clamp-2 min-w-0 flex-1 text-sm text-ink sm:truncate">
                    {A.text(a)}{" "}
                    <span className="text-ink-soft">· {a.reference}</span>
                  </p>
                  {a.amount && (
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${a.type === "refund" ? "text-ink-soft" : "text-ink"}`}
                    >
                      {a.type === "refund" ? "−" : "+"}
                      {money(a.amount, a.currency)}
                    </span>
                  )}
                  <span className="w-14 shrink-0 text-right text-xs text-ink-soft">
                    {timeAgo(a.at, now)}
                  </span>
                </div>
              </RowLink>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
