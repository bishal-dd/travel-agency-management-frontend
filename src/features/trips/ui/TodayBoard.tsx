"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlaneLanding,
  PlaneTakeoff,
  Users,
} from "lucide-react";
import { useTripBoard } from "../hooks/useTrips";
import type { BoardCard, Clash } from "../types/trip";
import {
  CrewChips,
  KIND_LABEL,
  Panel,
  SkeletonRows,
  StatusHintButton,
  addDays,
  formatDayMonth,
  formatLongDate,
  formatRange,
  relativeDay,
  tripHref,
} from "./parts";

/** One trip on the board: who, which day, where they sleep, who's with them. */
function BoardTripCard({
  card,
  focus,
}: {
  card: BoardCard;
  focus?: "arrival" | "departure";
}) {
  const flight =
    focus === "arrival"
      ? [card.arrivalTime, card.arrivalFlight, card.pickupPoint]
          .filter(Boolean)
          .join(" · ")
      : focus === "departure"
        ? [card.departureTime, card.departureFlight, card.dropoffPoint]
            .filter(Boolean)
            .join(" · ")
        : "";
  return (
    <li className="relative min-w-0 px-5 py-3.5 transition-colors hover:bg-mist/60">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={tripHref(card.bookingId)}
            className="font-semibold text-ink after:absolute after:inset-0 hover:text-lagoon-deep"
          >
            {card.title}
          </Link>
          <p className="truncate text-xs text-ink-soft">
            {card.reference} · {card.pax} pax · Day {card.dayNumber} of{" "}
            {card.totalDays}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <StatusHintButton bookingId={card.bookingId} hint={card.statusHint} />
        </div>
      </div>

      {focus ? (
        <p
          className={`mt-1.5 text-sm ${flight ? "text-ink" : "text-ink-soft"}`}
        >
          {flight ||
            (focus === "arrival"
              ? "No arrival details yet"
              : "No departure details yet")}
        </p>
      ) : (
        <div className="mt-1.5 space-y-1 text-sm">
          <p className="flex min-w-0 items-center gap-1.5 text-ink">
            <MapPin
              size={14}
              aria-hidden="true"
              className="shrink-0 text-ink-soft"
            />
            <span className="truncate">
              {card.day.title}
              {card.day.destination &&
                card.day.destination !== card.day.title && (
                  <span className="text-ink-soft">
                    {" "}
                    · {card.day.destination}
                  </span>
                )}
            </span>
          </p>
          {(card.hotels.length > 0 || card.day.overnightLocation) && (
            <p className="flex min-w-0 items-center gap-1.5 text-ink-soft">
              <BedDouble size={14} aria-hidden="true" className="shrink-0" />
              <span className="truncate">
                {card.hotels[0] ?? card.day.overnightLocation}
              </span>
            </p>
          )}
        </div>
      )}
      <div className="mt-2">
        <CrewChips crew={card.crew} empty="No guide or driver assigned" />
      </div>
    </li>
  );
}

function CardList({
  cards,
  focus,
  empty,
}: {
  cards: BoardCard[];
  focus?: "arrival" | "departure";
  empty: string;
}) {
  if (cards.length === 0)
    return <p className="px-5 py-6 text-sm text-ink-soft">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {cards.map((c) => (
        <BoardTripCard key={c.bookingId} card={c} focus={focus} />
      ))}
    </ul>
  );
}

export function ClashList({
  clashes,
  currentBookingId,
}: {
  clashes: Clash[];
  currentBookingId?: string;
}) {
  return (
    <ul className="space-y-2">
      {clashes.map((c) => (
        <li
          key={`${c.kind}:${c.resourceId}:${c.from}`}
          className="text-sm text-red-900"
        >
          <span className="font-semibold">{c.name}</span>
          <span className="text-red-800/80">
            {" "}
            ({KIND_LABEL[c.kind].toLowerCase()})
          </span>{" "}
          is on{" "}
          {c.bookings.map((b, i) => (
            <span key={b.id}>
              {i > 0 && (i === c.bookings.length - 1 ? " and " : ", ")}
              {b.id === currentBookingId ? (
                <span className="font-medium">this trip</span>
              ) : (
                <Link
                  href={tripHref(b.id)}
                  className="font-medium underline decoration-red-300 underline-offset-2 hover:decoration-red-700"
                >
                  {b.reference}
                </Link>
              )}
            </span>
          ))}{" "}
          on {formatRange(c.from, c.to)}
        </li>
      ))}
    </ul>
  );
}

/** Arrivals, departures and everyone in the country on one day. */
export function TodayBoard({
  date,
  onDate,
  today,
}: {
  date: string;
  onDate: (d: string) => void;
  today: string;
}) {
  const {
    data: board,
    isPending,
    error,
    isPlaceholderData,
  } = useTripBoard(date === today ? undefined : date);
  const isToday = date === today;

  return (
    <div
      className={`space-y-5 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
    >
      {/* Day picker */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-full border border-line bg-white p-0.5">
          <button
            type="button"
            onClick={() => onDate(addDays(date, -1))}
            aria-label="Previous day"
            className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[10.5rem] px-2 text-center text-sm font-semibold text-ink">
            {isToday
              ? "Today"
              : relativeDay(today, date).replace(/^./, (c) =>
                  c.toUpperCase(),
                )}{" "}
            · {formatDayMonth(date)}
          </span>
          <button
            type="button"
            onClick={() => onDate(addDays(date, 1))}
            aria-label="Next day"
            className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {!isToday && (
          <button
            type="button"
            onClick={() => onDate(today)}
            className="h-9 rounded-full px-3 text-sm font-medium text-lagoon-deep hover:bg-lagoon-tint"
          >
            Back to today
          </button>
        )}
        <p className="ml-auto hidden text-sm text-ink-soft sm:block">
          {formatLongDate(date)}
        </p>
      </div>

      {isPending ? (
        <div className="rounded-2xl border border-line bg-white">
          <SkeletonRows />
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-line bg-white p-5 text-sm text-red-700">
          Couldn&apos;t load the board: {error.message}
        </p>
      ) : board ? (
        <>
          {board.clashes.length > 0 && (
            <section
              aria-labelledby="clash-heading"
              className="rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:p-5"
            >
              <h2
                id="clash-heading"
                className="mb-2 flex items-center gap-2 font-semibold text-red-800"
              >
                <AlertTriangle size={17} aria-hidden="true" />
                Double-booked in the next 2 weeks
              </h2>
              <ClashList clashes={board.clashes} />
              <p className="mt-3 text-xs text-red-800/80">
                Change the guide, driver or vehicle on one of the bookings&apos;
                day plans.
              </p>
            </section>
          )}

          {/* Counts */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Arriving",
                value: board.arrivals.length,
                icon: PlaneLanding,
              },
              {
                label: "Departing",
                value: board.departures.length,
                icon: PlaneTakeoff,
              },
              {
                label: "In country",
                value: board.inCountry.length,
                icon: Users,
                sub: `${board.inCountry.reduce((s, c) => s + c.pax, 0)} guests`,
              },
            ].map((t) => (
              <div
                key={t.label}
                className="min-w-0 rounded-2xl border border-line bg-white p-3 sm:p-4"
              >
                <p className="flex items-center gap-1.5 truncate text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <t.icon
                    size={14}
                    aria-hidden="true"
                    className="hidden shrink-0 sm:block"
                  />
                  {t.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                  {t.value}
                </p>
                {t.sub && (
                  <p className="truncate text-xs text-ink-soft">{t.sub}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Panel id="arrivals" title="Arriving" count={board.arrivals.length}>
              <CardList
                cards={board.arrivals}
                focus="arrival"
                empty={isToday ? "No one arrives today." : "No arrivals."}
              />
            </Panel>
            <Panel
              id="departures"
              title="Departing"
              count={board.departures.length}
            >
              <CardList
                cards={board.departures}
                focus="departure"
                empty={isToday ? "No one leaves today." : "No departures."}
              />
            </Panel>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Panel
              id="in-country"
              title="In the country"
              count={board.inCountry.length}
            >
              <CardList
                cards={board.inCountry}
                empty="No trips running on this day."
              />
            </Panel>

            <Panel id="due" title="Checklist due" count={board.dueSoon.length}>
              {board.dueSoon.length === 0 ? (
                <p className="px-5 py-6 text-sm text-ink-soft">
                  Nothing due in the next 3 days.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {board.dueSoon.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={tripHref(d.bookingId)}
                        className="block px-5 py-3 hover:bg-mist/60"
                      >
                        <p className="text-sm font-medium text-ink">
                          {d.label}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {d.reference} · {d.title} ·{" "}
                          <span
                            className={
                              d.overdue ? "font-semibold text-red-700" : ""
                            }
                          >
                            {d.overdue
                              ? `late, was due ${formatDayMonth(d.dueDate)}`
                              : `due ${relativeDay(date, d.dueDate)}`}
                          </span>
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
