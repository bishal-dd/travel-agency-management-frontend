"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  MapPinOff,
  Trash2,
  Users,
} from "lucide-react";
import {
  Alert,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  Label,
  Select,
  Skeleton,
  Spinner,
} from "@/src/components/ui";
import {
  formatDateRange,
  passportIssueCount,
  PASSPORT_VALIDITY_MONTHS,
  tripLengthInDays,
  tripStatusLabel,
} from "../passport/passport";
import { errorMessage, tripsRepository } from "../passport/repository";
import { tripRoutes } from "../passport/routes";
import { useTrip } from "../hooks/use-trips";
import {
  TRIP_STATUSES,
  type TravellerInput,
  type TripStatus,
} from "../passport/types";
import { AddTravellerForm } from "./AddTravellerForm";
import { TripStatusBadge } from "./StatusBadges";
import { TravellerCard } from "./TravellerCard";
import { TripsShell } from "./TripsShell";

function TripDetail({
  organizationId,
  tripId,
}: {
  organizationId: string;
  tripId: string;
}) {
  const router = useRouter();
  const { trip, isLoading, error, refresh } = useTrip(organizationId, tripId);

  const [actionError, setActionError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset transient UI when the page is hidden (Next.js keeps it alive).
  useLayoutEffect(() => {
    return () => {
      setActionError("");
      setSavingStatus(false);
      setConfirmDelete(false);
      setDeleting(false);
    };
  }, []);

  async function run(action: () => Promise<unknown>, fallback: string) {
    setActionError("");
    try {
      await action();
      refresh();
    } catch (err) {
      setActionError(errorMessage(err, fallback));
      throw err;
    }
  }

  async function changeStatus(status: TripStatus) {
    setSavingStatus(true);
    await run(
      () => tripsRepository.updateTripStatus(organizationId, tripId, status),
      "Unable to update the status.",
    )
      .catch(() => undefined)
      .finally(() => setSavingStatus(false));
  }

  async function addTraveller(input: TravellerInput) {
    await run(
      () => tripsRepository.addTraveller(organizationId, tripId, input),
      "Unable to add the traveller.",
    );
  }

  async function removeTraveller(travellerId: string) {
    await run(
      () =>
        tripsRepository.removeTraveller(organizationId, tripId, travellerId),
      "Unable to remove the traveller.",
    ).catch(() => undefined);
  }

  async function deleteTrip() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setActionError("");
    try {
      await tripsRepository.deleteTrip(organizationId, tripId);
      router.replace(tripRoutes.list);
    } catch (err) {
      setActionError(errorMessage(err, "Unable to delete the trip."));
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const backLink = (
    <Link
      href={tripRoutes.list}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
    >
      <ArrowLeft size={16} aria-hidden="true" /> All trips
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-4" aria-label="Loading trip">
        {backLink}
        <Skeleton className="h-40 rounded-3xl bg-white" />
        <Skeleton className="h-64 rounded-2xl bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {backLink}
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
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card>
          <EmptyState
            icon={MapPinOff}
            title="Trip not found"
            body="This trip doesn't exist, was deleted, or belongs to another agency."
            action={
              <ButtonLink href={tripRoutes.list}>Back to trips</ButtonLink>
            }
          />
        </Card>
      </div>
    );
  }

  const issues = passportIssueCount(trip);
  const days = tripLengthInDays(trip.startDate, trip.endDate);

  return (
    <div className="space-y-5">
      {backLink}

      <section className="relative overflow-hidden rounded-3xl bg-lagoon-deep p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_100%_0%,transparent_0_40px,rgb(255_255_255/0.05)_40px_41px)]"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <TripStatusBadge status={trip.status} />
            <h1 className="font-display mt-3 text-3xl leading-tight font-medium break-words sm:text-[2.5rem]">
              {trip.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} aria-hidden="true" /> {trip.destination}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={16} aria-hidden="true" />{" "}
                {formatDateRange(trip.startDate, trip.endDate)} ({days} day
                {days === 1 ? "" : "s"})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={16} aria-hidden="true" /> {trip.travellers.length}{" "}
                traveller
                {trip.travellers.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:w-56">
            <Label htmlFor="trip-status-edit" className="text-white/80">
              Status
            </Label>
            <Select
              id="trip-status-edit"
              value={trip.status}
              disabled={savingStatus}
              onChange={(event) =>
                void changeStatus(event.target.value as TripStatus)
              }
            >
              {TRIP_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {tripStatusLabel[value]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {trip.notes && (
          <p className="relative mt-6 max-w-2xl text-sm leading-relaxed text-white/80">
            {trip.notes}
          </p>
        )}
      </section>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {issues > 0 && (
        <Alert variant="error">
          <span className="font-semibold">
            {issues === 1
              ? "1 passport needs attention."
              : `${issues} passports need attention.`}
          </span>{" "}
          Many countries require passports to be valid for{" "}
          {PASSPORT_VALIDITY_MONTHS} months after return.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Travellers and passports"
          description="Passport numbers are hidden until you choose to show them."
        />
        {trip.travellers.length === 0 ? (
          <EmptyState
            compact
            icon={Users}
            title="No travellers yet"
            body="Add everyone travelling on this trip."
          />
        ) : (
          <ul className="divide-y divide-line">
            {trip.travellers.map((traveller) => (
              <TravellerCard
                key={traveller.id}
                traveller={traveller}
                tripEndDate={trip.endDate}
                onRemove={() => removeTraveller(traveller.id)}
              />
            ))}
          </ul>
        )}
        <div className="border-t border-line p-5 sm:p-6">
          <AddTravellerForm
            key={trip.id}
            existing={trip.travellers}
            onAdd={addTraveller}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        {confirmDelete && !deleting && (
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Keep trip
          </button>
        )}
        <button
          type="button"
          onClick={deleteTrip}
          disabled={deleting}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            confirmDelete
              ? "bg-red-600 text-white hover:bg-red-700"
              : "text-red-700 hover:bg-red-50"
          }`}
        >
          {deleting ? (
            <Spinner label="Deleting..." className="text-current" />
          ) : (
            <>
              <Trash2 size={15} aria-hidden="true" />{" "}
              {confirmDelete ? "Confirm delete trip" : "Delete trip"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function TripDetailPage({ tripId }: { tripId: string }) {
  return (
    <TripsShell section="detail">
      {(agency) => <TripDetail organizationId={agency.id} tripId={tripId} />}
    </TripsShell>
  );
}
