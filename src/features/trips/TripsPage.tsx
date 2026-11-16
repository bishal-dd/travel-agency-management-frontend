"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { inputCls } from "../shared/components/FormBits";
import { useTripsList } from "./hooks/useTrips";
import type { TripListItem, TripPhase } from "./types/trip";
import { TodayBoard } from "./ui/TodayBoard";
import {
  ChecklistProgress,
  ClashBadge,
  CrewChips,
  PhaseBadge,
  SkeletonRows,
  StatusHintButton,
  formatRange,
  relativeDay,
  tripHref,
  useBhutanToday,
} from "./ui/parts";

type Tab = "today" | TripPhase;

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "in_country", label: "In country" },
  { id: "completed", label: "Completed" },
];

const EMPTY: Record<TripPhase, string> = {
  upcoming: "No upcoming trips. Confirmed bookings show up here.",
  in_country: "No one is in the country right now.",
  completed: "No completed trips yet.",
};

function whenLabel(t: TripListItem, today: string | null) {
  if (t.phase === "in_country")
    return t.currentDay
      ? `Day ${t.currentDay} of ${t.totalDays}`
      : "In country";
  if (!today) return "";
  return t.phase === "upcoming"
    ? `Starts ${relativeDay(today, t.startDate)}`
    : `Ended ${relativeDay(today, t.endDate)}`;
}

function TripRow({ t, today }: { t: TripListItem; today: string | null }) {
  const sub = [
    t.reference,
    t.customerName !== t.title ? t.customerName : null,
    `${t.pax} pax`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="relative grid gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-mist/60 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_7rem] md:items-center">
      {/* Who */}
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Link
            href={tripHref(t.bookingId)}
            className="truncate font-semibold text-ink after:absolute after:inset-0 hover:text-lagoon-deep"
          >
            {t.title}
          </Link>
          <ClashBadge count={t.clashes} />
        </div>
        <p className="truncate text-xs text-ink-soft">{sub}</p>
      </div>

      {/* When */}
      <div className="min-w-0 text-sm">
        <p className="text-ink">{formatRange(t.startDate, t.endDate)}</p>
        <p className="text-xs text-ink-soft">
          {t.phase === "in_country" ? (
            <PhaseBadge
              phase={t.phase}
              day={{ current: t.currentDay, total: t.totalDays }}
            />
          ) : (
            whenLabel(t, today)
          )}
        </p>
      </div>

      {/* Crew */}
      <div className="min-w-0">
        <CrewChips crew={t.crew} />
      </div>

      {/* Progress + nudge */}
      <div className="relative z-10 flex items-center justify-between gap-3 md:block md:space-y-2">
        <ChecklistProgress {...t.checklist} />
        <StatusHintButton bookingId={t.bookingId} hint={t.statusHint} />
      </div>
    </li>
  );
}

function TripList({
  phase,
  today,
}: {
  phase: TripPhase;
  today: string | null;
}) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isPending, error, isPlaceholderData } = useTripsList({
    phase,
    search: search || undefined,
    page,
    limit: 20,
  });
  const pages = data?.pagination.totalPages ?? 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="border-b border-line p-4">
        <div className="relative sm:w-80">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            aria-label="Search trips"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reference, trip or customer"
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_7rem] gap-x-5 border-b border-line bg-mist/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft md:grid">
        <span>Trip</span>
        <span>Dates</span>
        <span>Crew</span>
        <span>Checklist</span>
      </div>

      <div
        className={`transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
      >
        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <p className="p-5 text-sm text-red-700">
            {(error as { status?: number }).status === 403
              ? "You don't have access to trips."
              : `Couldn't load trips: ${error.message}`}
          </p>
        ) : !data || data.data.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-soft">
            {search ? "No trips match your search." : EMPTY[phase]}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {data.data.map((t) => (
              <TripRow key={t.bookingId} t={t} today={today} />
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-ink-soft">
          <span>
            Page {page} of {pages} · {data?.pagination.total} trips
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              className="grid size-8 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              className="grid size-8 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** /dashboard/trips — running confirmed bookings: today's board and the trip lists. */
export function TripsPage() {
  const today = useBhutanToday();
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Trips</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Confirmed bookings on the ground: who arrives, who&apos;s with them,
          and what&apos;s left to arrange.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Trips"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-line"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-ink text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "today" ? (
        today ? (
          <TodayBoard date={date ?? today} onDate={setDate} today={today} />
        ) : (
          <div className="h-64 animate-pulse rounded-2xl bg-mist" />
        )
      ) : (
        <TripList key={tab} phase={tab} today={today} />
      )}
    </div>
  );
}
