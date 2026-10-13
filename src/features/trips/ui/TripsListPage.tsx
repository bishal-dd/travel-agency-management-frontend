"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  MapPin,
  Plane,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  Alert,
  ButtonLink,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Skeleton,
} from "@/src/components/ui";
import {
  formatDateRange,
  passportIssueCount,
  tripStatusLabel,
} from "../passport/passport";
import { useTrips } from "../hooks/use-trips";
import { tripRoutes } from "../passport/routes";
import { TRIP_STATUSES, type Trip, type TripStatus } from "../passport/types";
import { TripStatusBadge } from "./StatusBadges";
import { TripsShell } from "./TripsShell";

function TripRow({ trip }: { trip: Trip }) {
  const issues = passportIssueCount(trip);

  return (
    <li>
      <Link
        href={tripRoutes.detail(trip.id)}
        className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-line transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-bold">{trip.title}</p>
            <TripStatusBadge status={trip.status} />
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden="true" /> {trip.destination}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />{" "}
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-ink-soft">
            <Users size={15} aria-hidden="true" />
            {trip.travellers.length} traveller
            {trip.travellers.length === 1 ? "" : "s"}
          </span>
          {issues > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-red-700">
              <AlertTriangle size={15} aria-hidden="true" />
              {issues} passport issue{issues === 1 ? "" : "s"}
            </span>
          ) : (
            trip.travellers.length > 0 && (
              <span className="text-lagoon-deep">Passports OK</span>
            )
          )}
        </div>
      </Link>
    </li>
  );
}

function TripsList({ organizationId }: { organizationId: string }) {
  const { trips, isLoading, error, refresh } = useTrips(organizationId);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TripStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trips.filter(
      (trip) =>
        (status === "all" || trip.status === status) &&
        (!q ||
          trip.title.toLowerCase().includes(q) ||
          trip.destination.toLowerCase().includes(q)),
    );
  }, [trips, query, status]);

  const stats = [
    { label: "Trips", value: trips.length, icon: Plane },
    {
      label: "Travellers",
      value: trips.reduce((sum, t) => sum + t.travellers.length, 0),
      icon: Users,
    },
    {
      label: "Passport issues",
      value: trips.reduce((sum, t) => sum + passportIssueCount(t), 0),
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <PageHeader
        title="Trips"
        description="Every trip your agency runs, with its travellers and their passports."
        actions={
          <ButtonLink href={tripRoutes.create}>
            <Plus size={16} aria-hidden="true" /> New trip
          </ButtonLink>
        }
      />

      {error ? (
        <Alert
          variant="error"
          action={
            <button
              type="button"
              onClick={refresh}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          }
        >
          {error}
        </Alert>
      ) : isLoading ? (
        <div className="space-y-3" aria-label="Loading trips">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-24 rounded-2xl bg-white" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plane}
            title="No trips yet"
            body="Create a trip to record its dates, travellers and passport details."
            action={
              <ButtonLink href={tripRoutes.create}>
                <Plus size={16} aria-hidden="true" /> New trip
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-line"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-lagoon-tint text-lagoon-deep">
                  <stat.icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-sm text-ink-soft">{stat.label}</dt>
                  <dd className="text-2xl font-bold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="trip-search" className="sr-only">
                Search trips
              </label>
              <Input
                id="trip-search"
                icon={Search}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by trip or destination"
              />
            </div>
            <div className="sm:w-52">
              <label htmlFor="trip-status" className="sr-only">
                Filter by status
              </label>
              <Select
                id="trip-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TripStatus | "all")
                }
              >
                <option value="all">All statuses</option>
                {TRIP_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {tripStatusLabel[value]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink-soft ring-1 ring-line">
              No trips match your search.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {filtered.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export function TripsListPage() {
  return (
    <TripsShell section="list">
      {(agency) => <TripsList organizationId={agency.id} />}
    </TripsShell>
  );
}
