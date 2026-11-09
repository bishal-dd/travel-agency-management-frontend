import type { BookingStatus } from "../types/booking";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  inquiry: "Inquiry",
  quoted: "Quoted",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<BookingStatus, { badge: string; dot: string }> = {
  inquiry: { badge: "bg-mist text-ink-soft", dot: "bg-ink-soft/60" },
  quoted: { badge: "bg-marigold/20 text-ink", dot: "bg-marigold" },
  confirmed: {
    badge: "bg-lagoon-tint text-lagoon-deep",
    dot: "bg-lagoon-deep",
  },
  in_progress: { badge: "bg-ink text-white", dot: "bg-white" },
  completed: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-600" },
  cancelled: { badge: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Button text for moving to each status, from the agent's point of view. */
export const STATUS_ACTION: Record<BookingStatus, string> = {
  inquiry: "Back to inquiry",
  quoted: "Mark as quoted",
  confirmed: "Confirm booking",
  in_progress: "Start trip",
  completed: "Complete trip",
  cancelled: "Cancel booking",
};

/** Overrides when the move is a "step back" or a reopen. */
export function statusActionLabel(from: BookingStatus, to: BookingStatus) {
  if (from === "cancelled" && to === "inquiry") return "Reopen";
  if (from === "confirmed" && to === "quoted") return "Back to quoted";
  return STATUS_ACTION[to];
}

// ---------- dates (all YYYY-MM-DD, handled in UTC so they never shift) ----------

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** "12 Mar 2027" */
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc(iso));

/** "Fri 12 Mar" */
export const formatDayDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(utc(iso));

/** "Fri" */
export const formatWeekday = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(utc(iso));

/** "12 Mar" */
export const formatDayMonth = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(utc(iso));

/** "12–14 Mar 2027", "28 Mar – 2 Apr 2027", "30 Dec 2027 – 3 Jan 2028" */
export function formatDateRange(start: string, end: string) {
  if (start === end) return formatDate(start);
  const a = utc(start);
  const b = utc(end);
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  const sameMonth = sameYear && a.getUTCMonth() === b.getUTCMonth();
  const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "UTC" });
  if (sameMonth) return `${a.getUTCDate()}–${formatDate(end)}`;
  if (sameYear)
    return `${fmt({ day: "numeric", month: "short" }).format(a)} – ${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function addDays(iso: string, days: number) {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Days from start to end, inclusive (12–14 Mar → 3). */
export const tripLength = (start: string, end: string) =>
  Math.round((utc(end).getTime() - utc(start).getTime()) / 86_400_000) + 1;

/** Today in the user's own timezone, as YYYY-MM-DD. */
export function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2 adults · 1 child" */
export function formatPax(adults: number, children: number) {
  const a = `${adults} adult${adults === 1 ? "" : "s"}`;
  return children
    ? `${a} · ${children} child${children === 1 ? "" : "ren"}`
    : a;
}
