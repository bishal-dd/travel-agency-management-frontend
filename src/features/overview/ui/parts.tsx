import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { formatPrice } from "@/src/lib/format";
import type { TripItem } from "../types/overview";

export const bookingHref = (bookingId: string) =>
  `/dashboard/bookings/${bookingId}`;

export const money = (v: string, currency = "BTN") => formatPrice(v, currency);

/** "12 Nov" */
export const dayMonth = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

/** "Fri 12 Nov" */
export const weekdayDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

/** "Nov" from "2026-11" */
export const monthShort = (ym: string) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(
    new Date(`${ym}-01T00:00:00Z`),
  );

/** Whole days from today (both YYYY-MM-DD). */
export const daysBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );

/** "in 3 days", "tomorrow", "today", "2 days ago" */
export function relativeDay(today: string, date: string) {
  const d = daysBetween(today, date);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}

/** "5m ago", "3h ago", "2d ago"; `now` is read on the client. */
export function timeAgo(ts: string, now: number) {
  if (!now) return "";
  const mins = Math.max(0, Math.round((now - new Date(ts).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days}d ago` : dayMonth(ts);
}

/** A white card with a heading, like the other dashboard panels. */
export function Panel({
  title,
  count,
  action,
  children,
  className = "",
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // min-w-0: a grid item must be allowed to shrink, or long rows push it off-screen on phones.
    <section
      className={`min-w-0 rounded-2xl border border-line bg-white ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="font-semibold text-ink">
          {title}
          {count != null && count > 0 && (
            <span className="ml-1.5 text-sm font-normal text-ink-soft">
              {count}
            </span>
          )}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A row that opens the booking. */
export function RowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-mist/60"
      >
        <div className="min-w-0 flex-1">{children}</div>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-ink-soft/50 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

/** "+12% vs Oct" in muted ink with a direction arrow (no red/green: a dip isn't an alarm). */
export function Delta({
  now,
  before,
  label,
}: {
  now: number;
  before: number;
  label: string;
}) {
  if (before === 0 && now === 0)
    return <span className="text-xs text-ink-soft">No change vs {label}</span>;
  if (before === 0)
    return <span className="text-xs text-ink-soft">New vs {label}</span>;
  const pct = Math.round(((now - before) / Math.abs(before)) * 100);
  const Icon = pct >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-ink-soft">
      <Icon size={13} aria-hidden="true" />
      {pct >= 0 ? "+" : ""}
      {pct}% vs {label}
    </span>
  );
}

const PAY_STATUS: Record<
  NonNullable<TripItem["paymentStatus"]>,
  { label: string; cls: string }
> = {
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800" },
  overpaid: { label: "Overpaid", cls: "bg-lagoon-tint text-lagoon-deep" },
  partially_paid: { label: "Part-paid", cls: "bg-marigold/20 text-ink" },
  unpaid: { label: "Unpaid", cls: "bg-mist text-ink-soft" },
  nothing_due: { label: "Nothing due", cls: "bg-mist text-ink-soft" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-700" },
};

export function PayBadge({ status }: { status: TripItem["paymentStatus"] }) {
  if (!status) return null;
  const s = PAY_STATUS[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 py-6 text-center text-sm text-ink-soft">{children}</p>
  );
}
