"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bus,
  Compass,
  IdCard,
  Loader2,
  Phone,
} from "lucide-react";
import type {
  CrewMember,
  ResourceKind,
  StatusHint,
  TripPhase,
} from "../types/trip";
import { useMoveTrip } from "../hooks/useTrips";

// ---------- dates (YYYY-MM-DD, handled in UTC so they never shift) ----------

const utc = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
const fmt = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "UTC" });

/** "12 Mar 2027" */
export const formatDate = (iso: string) =>
  fmt({ day: "numeric", month: "short", year: "numeric" }).format(utc(iso));
/** "12 Mar" */
export const formatDayMonth = (iso: string) =>
  fmt({ day: "numeric", month: "short" }).format(utc(iso));
/** "Fri 12 Mar" */
export const formatDayDate = (iso: string) =>
  fmt({ weekday: "short", day: "numeric", month: "short" }).format(utc(iso));
/** "Friday 12 March" */
export const formatLongDate = (iso: string) =>
  fmt({ weekday: "long", day: "numeric", month: "long" }).format(utc(iso));

/** "12–14 Mar 2027", "28 Mar – 2 Apr 2027", "30 Dec 2026 – 3 Jan 2027" */
export function formatRange(start: string, end: string) {
  if (start === end) return formatDate(start);
  const a = utc(start);
  const b = utc(end);
  if (a.getUTCFullYear() !== b.getUTCFullYear())
    return `${formatDate(start)} – ${formatDate(end)}`;
  if (a.getUTCMonth() === b.getUTCMonth())
    return `${a.getUTCDate()}–${formatDate(end)}`;
  return `${formatDayMonth(start)} – ${formatDate(end)}`;
}

export function addDays(iso: string, days: number) {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const daysBetween = (from: string, to: string) =>
  Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);

/** "today", "tomorrow", "in 3 days", "2 days ago" */
export function relativeDay(today: string, date: string) {
  const d = daysBetween(today, date);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  return d > 0 ? `in ${d} days` : `${-d} days ago`;
}

/** Today in Bhutan, as YYYY-MM-DD (agencies work on Bhutan time, like the backend). */
export const bhutanToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Thimphu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/** The same, read after mount: Next can't read the clock while rendering on the server. */
export function useBhutanToday() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(bhutanToday()), []);
  return today;
}

export const tripHref = (bookingId: string) => `/dashboard/trips/${bookingId}`;
export const bookingHref = (bookingId: string) =>
  `/dashboard/bookings/${bookingId}`;

// ---------- badges ----------

const PHASE: Record<TripPhase, { label: string; cls: string; dot: string }> = {
  upcoming: {
    label: "Upcoming",
    cls: "bg-lagoon-tint text-lagoon-deep",
    dot: "bg-lagoon-deep",
  },
  in_country: {
    label: "In country",
    cls: "bg-ink text-white",
    dot: "bg-marigold",
  },
  completed: {
    label: "Completed",
    cls: "bg-mist text-ink-soft",
    dot: "bg-ink-soft/60",
  },
};

export function PhaseBadge({
  phase,
  day,
}: {
  phase: TripPhase;
  day?: { current: number | null; total: number };
}) {
  const p = PHASE[phase];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.cls}`}
    >
      <span className={`size-1.5 rounded-full ${p.dot}`} aria-hidden="true" />
      {phase === "in_country" && day?.current
        ? `Day ${day.current} of ${day.total}`
        : p.label}
    </span>
  );
}

export function ClashBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
      <AlertTriangle size={12} aria-hidden="true" />
      {count} clash{count === 1 ? "" : "es"}
    </span>
  );
}

/** "4/6" with a thin bar; overdue items called out. */
export function ChecklistProgress({
  done,
  total,
  overdue,
}: {
  done: number;
  total: number;
  overdue: number;
}) {
  if (total === 0)
    return <span className="text-xs text-ink-soft">No checklist</span>;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="min-w-[6.5rem]">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums text-ink">
          {done}/{total}
        </span>
        {overdue > 0 ? (
          <span className="font-semibold text-red-700">{overdue} late</span>
        ) : done === total ? (
          <span className="text-emerald-700">Done</span>
        ) : null}
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full ${overdue > 0 ? "bg-red-500" : "bg-lagoon-deep"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------- crew ----------

export const KIND_ICON: Record<ResourceKind, typeof Compass> = {
  guide: Compass,
  driver: IdCard,
  vehicle: Bus,
};
export const KIND_LABEL: Record<ResourceKind, string> = {
  guide: "Guide",
  driver: "Driver",
  vehicle: "Vehicle",
};

/** Compact chips: "Karma · Tashi · Prado". */
export function CrewChips({
  crew,
  empty = "No crew yet",
}: {
  crew: CrewMember[];
  empty?: string;
}) {
  if (crew.length === 0)
    return <span className="text-xs text-ink-soft">{empty}</span>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {crew.map((c) => {
        const Icon = KIND_ICON[c.kind];
        return (
          <li
            key={`${c.kind}:${c.id}`}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-mist px-1.5 py-0.5 text-xs text-ink"
          >
            <Icon
              size={12}
              aria-hidden="true"
              className="shrink-0 text-ink-soft"
            />
            <span className="sr-only">{KIND_LABEL[c.kind]}:</span>
            <span className="truncate">{c.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** A crew row with a tap-to-call link (for the day cards). */
export function CrewLine({
  member,
  clash,
}: {
  member: CrewMember;
  clash?: boolean;
}) {
  const Icon = KIND_ICON[member.kind];
  return (
    <li className="flex min-w-0 items-center gap-2 text-sm">
      <Icon size={15} aria-hidden="true" className="shrink-0 text-ink-soft" />
      <span className="w-14 shrink-0 text-xs text-ink-soft">
        {KIND_LABEL[member.kind]}
      </span>
      <span className="min-w-[4.5rem] truncate font-medium text-ink">
        {member.name}
      </span>
      {clash && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded bg-red-50 px-1.5 py-px text-[11px] font-semibold text-red-700">
          <AlertTriangle size={11} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Double-booked</span>
        </span>
      )}
      {member.phone && (
        <a
          href={`tel:${member.phone.replace(/\s/g, "")}`}
          aria-label={`Call ${member.name}`}
          className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-lagoon-deep hover:bg-lagoon-tint"
        >
          <Phone size={12} aria-hidden="true" />
          {/* Number hidden on phones (the icon still calls) so the name keeps its room. */}
          <span className="sr-only sm:not-sr-only">{member.phone}</span>
        </a>
      )}
    </li>
  );
}

// ---------- status nudge ----------

/**
 * "Guests have arrived → Start trip" / "Trip ended → Complete trip".
 * Only shown when the booking's status lags behind the dates.
 */
export function StatusHintButton({
  bookingId,
  hint,
  size = "sm",
}: {
  bookingId: string;
  hint: StatusHint;
  size?: "sm" | "md";
}) {
  const move = useMoveTrip();
  if (!hint) return null;
  const status = hint === "start" ? "in_progress" : "completed";
  const label = hint === "start" ? "Start trip" : "Complete trip";
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          move.mutate({ bookingId, status });
        }}
        disabled={move.isPending}
        className={`inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:opacity-50 ${
          size === "sm" ? "h-7 px-3 text-xs" : "h-9 px-4 text-sm"
        }`}
      >
        {move.isPending && (
          <Loader2 size={13} className="animate-spin" aria-hidden="true" />
        )}
        {label}
      </button>
      {move.error && (
        <span className="text-xs text-red-700">{move.error.message}</span>
      )}
    </span>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-mist" />
      ))}
    </div>
  );
}

/** A white card with a heading, like the other dashboard panels. */
export function Panel({
  title,
  count,
  action,
  children,
  className = "",
  id,
}: {
  title: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`min-w-0 rounded-2xl border border-line bg-white ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 id={id} className="font-semibold text-ink">
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
