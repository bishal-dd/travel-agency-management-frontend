"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useTrip } from "../hooks/useTrips";
import {
  ChecklistProgress,
  CrewChips,
  KIND_LABEL,
  PhaseBadge,
  formatRange,
  tripHref,
} from "./parts";

const TRIP_STATUSES = ["confirmed", "in_progress", "completed"];

/**
 * On the booking page, once it's confirmed: trip progress and any double-booked
 * crew, with a link to the trip. Hidden for members without operations access.
 */
export function TripPanel({
  booking,
}: {
  booking: { id: string; status: string };
}) {
  const isTrip = TRIP_STATUSES.includes(booking.status);
  const { data: trip, isPending, error } = useTrip(booking.id, isTrip);

  if (!isTrip || (error as { status?: number } | null)?.status === 403)
    return null;

  return (
    <section
      aria-labelledby="trip-heading"
      className="rounded-2xl border border-line bg-white p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="trip-heading" className="font-semibold text-ink">
          Trip
        </h2>
        {trip && (
          <PhaseBadge
            phase={trip.phase}
            day={{ current: trip.currentDay, total: trip.totalDays }}
          />
        )}
      </div>

      {isPending ? (
        <div className="h-16 animate-pulse rounded-lg bg-mist" />
      ) : error || !trip ? (
        <p className="text-sm text-red-700">
          Couldn&apos;t load the trip: {error?.message}
        </p>
      ) : (
        <div className="space-y-3">
          {trip.clashes.length > 0 && (
            <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-900">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-red-800">
                <AlertTriangle size={14} aria-hidden="true" /> Double-booked
              </p>
              <ul className="space-y-0.5">
                {trip.clashes.map((c) => {
                  const others = c.bookings.filter(
                    (b) => b.id !== trip.bookingId,
                  );
                  return (
                    <li key={`${c.kind}:${c.resourceId}:${c.from}`}>
                      {c.name} ({KIND_LABEL[c.kind].toLowerCase()}),{" "}
                      {formatRange(c.from, c.to)}, also on{" "}
                      {others.map((b, i) => (
                        <span key={b.id}>
                          {i > 0 && ", "}
                          <Link
                            href={tripHref(b.id)}
                            className="font-medium underline underline-offset-2"
                          >
                            {b.reference}
                          </Link>
                        </span>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <CrewChips
            crew={trip.crew}
            empty="No guide, driver or vehicle on the day plan yet"
          />
          <ChecklistProgress
            done={trip.checklist.filter((i) => i.done).length}
            total={trip.checklist.length}
            overdue={trip.checklist.filter((i) => i.overdue).length}
          />
          <Link
            href={tripHref(trip.bookingId)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-line text-sm font-semibold text-ink hover:border-ink"
          >
            Open trip <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
