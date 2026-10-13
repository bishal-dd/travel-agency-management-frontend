"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Label,
  Select,
  Spinner,
  TextField,
  controlClassName,
} from "@/src/components/ui";
import { tripStatusLabel } from "../passport/passport";
import { errorMessage, tripsRepository } from "../passport/repository";
import { tripRoutes } from "../passport/routes";
import { TRIP_STATUSES, type TripStatus } from "../passport/types";
import {
  draftToTraveller,
  emptyTravellerDraft,
  hasErrors,
  todayIsoDate,
  validateTraveller,
  validateTrip,
  type TravellerDraft,
  type TravellerErrors,
  type TravellerField,
  type TripFieldErrors,
} from "../passport/validation";
import { TravellerFields } from "./TravellerFields";
import { TripsShell } from "./TripsShell";

type DraftEntry = { key: number; value: TravellerDraft };
type Status = "idle" | "saving" | "redirecting";

const emptyTrip = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  status: "planning" as TripStatus,
  notes: "",
};

function NewTripForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();

  const [trip, setTrip] = useState(emptyTrip);
  const [travellers, setTravellers] = useState<DraftEntry[]>([
    { key: 0, value: emptyTravellerDraft },
  ]);
  const [nextKey, setNextKey] = useState(1);
  const [tripErrors, setTripErrors] = useState<TripFieldErrors>({});
  const [travellerErrors, setTravellerErrors] = useState<
    Record<number, TravellerErrors>
  >({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const isBusy = status !== "idle";

  // Next.js (Cache Components) keeps this page alive but hidden after you
  // leave it. Start fresh next time instead of showing the last trip and a
  // stuck "Opening trip..." button.
  useLayoutEffect(() => {
    return () => {
      setTrip(emptyTrip);
      setTravellers([{ key: 0, value: emptyTravellerDraft }]);
      setNextKey(1);
      setTripErrors({});
      setTravellerErrors({});
      setFormError("");
      setStatus("idle");
    };
  }, []);

  function updateTrip(field: keyof typeof emptyTrip, value: string) {
    setTrip((current) => ({ ...current, [field]: value }));
    setTripErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function updateTraveller(key: number, field: TravellerField, value: string) {
    setTravellers((current) =>
      current.map((entry) =>
        entry.key === key
          ? { ...entry, value: { ...entry.value, [field]: value } }
          : entry,
      ),
    );
    setTravellerErrors((current) => ({
      ...current,
      [key]: { ...current[key], [field]: undefined },
    }));
    setFormError("");
  }

  function addTraveller() {
    setTravellers((current) => [
      ...current,
      { key: nextKey, value: emptyTravellerDraft },
    ]);
    setNextKey((key) => key + 1);
  }

  function removeTraveller(key: number) {
    setTravellers((current) => current.filter((entry) => entry.key !== key));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    const today = todayIsoDate();
    const nextTripErrors = validateTrip(trip);
    const nextTravellerErrors: Record<number, TravellerErrors> = {};
    for (const entry of travellers) {
      const errors = validateTraveller(entry.value, today);
      if (hasErrors(errors)) nextTravellerErrors[entry.key] = errors;
    }

    const passportNumbers = travellers
      .map((t) => draftToTraveller(t.value).passport.number)
      .filter(Boolean);
    const duplicate = passportNumbers.find(
      (n, i) => passportNumbers.indexOf(n) !== i,
    );

    setTripErrors(nextTripErrors);
    setTravellerErrors(nextTravellerErrors);
    setFormError(
      duplicate ? "Two travellers have the same passport number." : "",
    );

    if (
      hasErrors(nextTripErrors) ||
      hasErrors(nextTravellerErrors) ||
      duplicate
    ) {
      if (!duplicate) setFormError("Check the highlighted fields.");
      return;
    }

    setStatus("saving");
    try {
      const created = await tripsRepository.createTrip(organizationId, {
        title: trip.title.trim(),
        destination: trip.destination.trim(),
        startDate: trip.startDate,
        endDate: trip.endDate,
        status: trip.status,
        notes: trip.notes.trim() || undefined,
        travellers: travellers.map((entry) => draftToTraveller(entry.value)),
      });
      setStatus("redirecting");
      router.push(tripRoutes.detail(created.id));
    } catch (error) {
      setFormError(
        errorMessage(error, "Unable to create the trip. Please try again."),
      );
      setStatus("idle");
    }
  }

  return (
    <>
      <Link
        href={tripRoutes.list}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" /> All trips
      </Link>
      <h1 className="font-display mt-3 text-3xl font-medium sm:text-[2.5rem]">
        New trip
      </h1>
      <p className="mt-2 text-ink-soft">
        Add the trip details and everyone travelling with their passport.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isBusy}
        className="mt-8 space-y-6"
      >
        <Card>
          <CardHeader title="Trip details" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Trip name"
              placeholder="e.g. Okafor family, Portugal coast"
              value={trip.title}
              onChange={(event) => updateTrip("title", event.target.value)}
              error={tripErrors.title}
              disabled={isBusy}
            />
            <TextField
              label="Destination"
              placeholder="e.g. Lisbon, Portugal"
              value={trip.destination}
              onChange={(event) =>
                updateTrip("destination", event.target.value)
              }
              error={tripErrors.destination}
              disabled={isBusy}
            />
            <TextField
              label="Start date"
              type="date"
              value={trip.startDate}
              onChange={(event) => updateTrip("startDate", event.target.value)}
              error={tripErrors.startDate}
              disabled={isBusy}
            />
            <TextField
              label="End date"
              type="date"
              min={trip.startDate || undefined}
              value={trip.endDate}
              onChange={(event) => updateTrip("endDate", event.target.value)}
              error={tripErrors.endDate}
              disabled={isBusy}
            />
            <div>
              <Label htmlFor="trip-status-new">Status</Label>
              <div className="mt-2">
                <Select
                  id="trip-status-new"
                  value={trip.status}
                  onChange={(event) => updateTrip("status", event.target.value)}
                  disabled={isBusy}
                >
                  {TRIP_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {tripStatusLabel[value]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="trip-notes">Notes (optional)</Label>
              <textarea
                id="trip-notes"
                rows={3}
                value={trip.notes}
                onChange={(event) => updateTrip("notes", event.target.value)}
                disabled={isBusy}
                className={`${controlClassName} mt-2 h-auto py-3`}
              />
            </div>
          </CardBody>
        </Card>

        <section aria-labelledby="travellers-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="travellers-heading" className="text-lg font-bold">
                Travellers
              </h2>
              <p className="text-sm text-ink-soft">
                You can also add travellers after creating the trip.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={addTraveller}
              disabled={isBusy}
            >
              <Plus size={15} aria-hidden="true" /> Add traveller
            </Button>
          </div>

          {travellers.map((entry, index) => (
            <TravellerFields
              key={entry.key}
              title={`Traveller ${index + 1}`}
              value={entry.value}
              errors={travellerErrors[entry.key] ?? {}}
              disabled={isBusy}
              onChange={(field, value) =>
                updateTraveller(entry.key, field, value)
              }
              onRemove={() => removeTraveller(entry.key)}
            />
          ))}
        </section>

        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={tripRoutes.list}
            className="inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-ink-soft hover:text-ink"
          >
            Cancel
          </Link>
          <Button type="submit" size="lg" disabled={isBusy}>
            {status === "saving" ? (
              <Spinner label="Creating trip..." className="text-current" />
            ) : status === "redirecting" ? (
              <Spinner label="Opening trip..." className="text-current" />
            ) : (
              "Create trip"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

export function NewTripPage() {
  return (
    <TripsShell section="create">
      {(agency) => <NewTripForm organizationId={agency.id} />}
    </TripsShell>
  );
}
