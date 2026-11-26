"use client";

import { Fragment, useState } from "react";
import {
  getMyTripFileLink,
  openInNewTab,
} from "../../booking-files/api/bookingFiles";
import {
  categoryLabel,
  formatBytes,
  type BookingFileCategory,
} from "../../booking-files/types/bookingFile";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  FileText,
  MapPin,
  MessageCircle,
  PlaneLanding,
  PlaneTakeoff,
  Star,
  Ticket,
  Utensils,
} from "lucide-react";
import { useMyTrip } from "../hooks/useMyTrips";
import type {
  MyTripDay,
  MyTripDetail,
  MyTripNote,
  MyTraveller,
} from "../types/myTrip";
import {
  CrewLine,
  Panel,
  PhaseBadge,
  SkeletonRows,
  formatDate,
  formatDayDate,
  formatRange,
} from "../../trips/ui/parts";

const pax = (p: MyTripDetail["pax"]) =>
  `${p.adults} adult${p.adults === 1 ? "" : "s"}${p.children ? ` · ${p.children} child${p.children === 1 ? "" : "ren"}` : ""}`;

/**
 * WhatsApp chat link for a phone number. wa.me needs the full international
 * number in digits only: "+44 7700 900123" → 447700900123. Bhutanese numbers
 * saved without the country code (17123456, 77123456) get 975 in front.
 */
function whatsappLink(phone: string, text?: string) {
  const raw = phone.trim();
  let digits = raw.replace(/\D/g, "");
  if (raw.startsWith("00")) digits = digits.slice(2);
  else if (!raw.startsWith("+") && /^[17]\d{7}$/.test(digits))
    digits = `975${digits}`;
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function Note({ note }: { note: MyTripNote }) {
  return (
    <li className="rounded-lg bg-marigold-tint/60 px-3 py-2 text-sm">
      <p className="whitespace-pre-wrap text-ink">{note.body}</p>
      <p className="mt-0.5 text-xs text-ink-soft">
        {note.authorName ? `${note.authorName} · ` : ""}
        {formatDate(note.createdAt.slice(0, 10))}
      </p>
    </li>
  );
}

function DayCard({ day }: { day: MyTripDay }) {
  const empty =
    day.crew.length === 0 &&
    day.hotels.length === 0 &&
    day.services.length === 0 &&
    day.activities.length === 0;
  return (
    <li
      className={`rounded-2xl border ${day.isToday ? "border-ink shadow-sm" : "border-line"} ${day.mine ? "bg-white" : "bg-mist/60 text-ink-soft"}`}
      aria-current={day.isToday ? "date" : undefined}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line px-5 py-3">
        <span className="text-xs font-semibold text-ink-soft">
          Day {day.dayNumber}
        </span>
        <span className="text-xs text-ink-soft">{formatDayDate(day.date)}</span>
        {day.isToday && (
          <span className="rounded-full bg-marigold px-2 py-px text-[11px] font-bold text-ink">
            Today
          </span>
        )}
        {!day.mine && (
          <span className="rounded-full bg-white px-2 py-px text-[11px] font-semibold text-ink-soft ring-1 ring-line">
            Not with you
          </span>
        )}
        <h3 className="w-full font-semibold text-ink">{day.title}</h3>
        {(day.destination || day.overnightLocation) && (
          <p className="flex w-full flex-wrap gap-x-4 text-xs text-ink-soft">
            {day.destination && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" /> {day.destination}
              </span>
            )}
            {day.overnightLocation && (
              <span className="inline-flex items-center gap-1">
                <BedDouble size={12} aria-hidden="true" /> Overnight in{" "}
                {day.overnightLocation}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="space-y-3 px-5 py-3.5">
        {day.activities.length > 0 && (
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink marker:text-ink-soft">
            {day.activities.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}
        {day.crew.length > 0 && (
          <ul className="space-y-1.5">
            {day.crew.map((c) => (
              <CrewLine
                key={`${c.kind}:${c.id}`}
                member={
                  c.isMe ? { ...c, name: `${c.name} (you)`, phone: null } : c
                }
              />
            ))}
          </ul>
        )}
        {day.hotels.map((h, i) => (
          <p
            key={`h${i}`}
            className="flex min-w-0 items-start gap-2 text-sm text-ink"
          >
            <BedDouble
              size={15}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-ink-soft"
            />
            <span className="min-w-0">
              {h.description}
              {h.rooms > 1 && (
                <span className="text-ink-soft"> · {h.rooms} rooms</span>
              )}
              {h.notes && (
                <span className="block text-xs text-ink-soft">{h.notes}</span>
              )}
            </span>
          </p>
        ))}
        {day.services.map((s, i) => (
          <p
            key={`s${i}`}
            className="flex min-w-0 items-start gap-2 text-sm text-ink"
          >
            <Ticket
              size={15}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-ink-soft"
            />
            <span className="min-w-0">
              {s.description}
              {s.quantity > 1 && (
                <span className="text-ink-soft"> × {s.quantity}</span>
              )}
              {s.notes && (
                <span className="block text-xs text-ink-soft">{s.notes}</span>
              )}
            </span>
          </p>
        ))}
        {day.meals.length > 0 && (
          <p className="flex items-start gap-2 text-sm text-ink">
            <Utensils
              size={15}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-ink-soft"
            />
            {day.meals.join(", ")}
          </p>
        )}
        {empty && (
          <p className="text-sm text-ink-soft">
            Nothing arranged for this day yet.
          </p>
        )}
        {day.notes.length > 0 && (
          <ul className="space-y-1.5">
            {day.notes.map((n) => (
              <Note key={n.id} note={n} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/** Age on the trip's first day, from YYYY-MM-DD dates. */
function ageOn(dateOfBirth: string, on: string) {
  const [by, bm, bd] = dateOfBirth.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const [y, m, d] = on.split("-").map(Number) as [number, number, number];
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

function Traveller({
  t,
  tripStart,
  bookingId,
}: {
  t: MyTraveller;
  tripStart: string;
  bookingId: string;
}) {
  const [openError, setOpenError] = useState<string | null>(null);
  const age = t.dateOfBirth ? ageOn(t.dateOfBirth, tripStart) : null;
  const details: { label: string; value: string }[] = [];
  if (t.nationality)
    details.push({ label: "Nationality", value: t.nationality });
  if (age != null)
    details.push({
      label: "Age",
      value: age < 18 ? `${age} (child)` : String(age),
    });
  return (
    <li className="px-5 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="min-w-0 truncate">{t.name}</span>
        {t.isLead && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-marigold-tint px-2 py-px text-[11px] font-semibold text-ink">
            <Star
              size={11}
              aria-hidden="true"
              className="fill-marigold text-marigold"
            />{" "}
            Lead
          </span>
        )}
      </p>
      {(details.length > 0 || t.passportOrCid) && (
        <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
          {details.map((d) => (
            <Fragment key={d.label}>
              <dt className="text-ink-soft">{d.label}</dt>
              <dd className="text-ink">{d.value}</dd>
            </Fragment>
          ))}
          {t.passportOrCid && (
            <>
              <dt className="text-ink-soft">Passport / CID</dt>
              <dd className="font-medium tabular-nums tracking-wide text-ink">
                {t.passportOrCid}
              </dd>
            </>
          )}
        </dl>
      )}
      {t.files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {t.files.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => {
                  setOpenError(null);
                  openInNewTab(() => getMyTripFileLink(bookingId, f.id)).catch(
                    (e: Error) => setOpenError(e.message),
                  );
                }}
                className="flex w-full items-center gap-2 rounded-lg bg-mist/60 px-2.5 py-1.5 text-left text-xs hover:bg-mist"
              >
                <FileText
                  size={13}
                  aria-hidden="true"
                  className="shrink-0 text-ink-soft"
                />
                <span className="min-w-0 flex-1 truncate font-medium text-ink">
                  {categoryLabel(f.category as BookingFileCategory)}
                </span>
                <span className="shrink-0 text-ink-soft">
                  {formatBytes(f.sizeBytes)} · View
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {openError && <p className="mt-1 text-xs text-red-700">{openError}</p>}
    </li>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={15}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-ink-soft"
      />
      <div className="min-w-0">
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-sm text-ink">{children}</p>
      </div>
    </div>
  );
}

const flight = (f: string | null, time: string | null, verb: string) =>
  [f, time && `${verb} ${time}`].filter(Boolean).join(", ");

function Back() {
  return (
    <Link
      href="/dashboard/my-trips"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
    >
      <ArrowLeft size={15} aria-hidden="true" /> Your trips
    </Link>
  );
}

/** /dashboard/my-trips/[bookingId]: one trip, as the guide sees it. */
export function MyTripDetailPage({ bookingId }: { bookingId: string }) {
  const { data: trip, isPending, error } = useMyTrip(bookingId);

  if (isPending)
    return (
      <div>
        <Back />
        <SkeletonRows rows={4} />
      </div>
    );
  if (error)
    return (
      <div>
        <Back />
        <p className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-soft">
          {(error as { status?: number }).status === 404
            ? "This trip isn't assigned to you, or it was cancelled."
            : `Couldn't load the trip: ${error.message}`}
        </p>
      </div>
    );

  const arrival = flight(trip.arrivalFlight, trip.arrivalTime, "lands");
  const departure = flight(
    trip.departureFlight,
    trip.departureTime,
    "takes off",
  );
  const notAllDays = trip.myDates.length < trip.totalDays;
  const chat = trip.customer.phone
    ? whatsappLink(
        trip.customer.phone,
        `Hello ${trip.customer.name.split(" ")[0]}, `,
      )
    : null;

  return (
    <div>
      <Back />

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {trip.title}
          </h1>
          <PhaseBadge
            phase={trip.phase}
            day={{ current: trip.currentDay, total: trip.totalDays }}
          />
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {trip.reference} · {formatRange(trip.startDate, trip.endDate)} ·{" "}
          {pax(trip.pax)}
        </p>
        {notAllDays && (
          <p className="mt-2 text-sm text-ink">
            You&apos;re the guide on {trip.myDates.length} of {trip.totalDays}{" "}
            days. The other days are shown greyed out.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ol className="order-2 space-y-3 lg:order-1" aria-label="Day plan">
          {trip.days.map((d) => (
            <DayCard key={d.dayNumber} day={d} />
          ))}
        </ol>

        <div className="order-1 space-y-4 lg:order-2">
          <Panel title="Booked by">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {trip.customer.name}
                </p>
                {trip.customer.phone && (
                  <p className="text-xs tabular-nums text-ink-soft">
                    {trip.customer.phone}
                  </p>
                )}
              </div>
              {chat && (
                <a
                  href={chat}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chat with ${trip.customer.name} on WhatsApp`}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 text-sm font-semibold text-white hover:bg-[#1ebe5b]"
                >
                  <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                </a>
              )}
            </div>
          </Panel>

          <Panel title="Travellers" count={trip.travellers.length}>
            {trip.travellers.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink-soft">
                The office hasn&apos;t added the travellers yet.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {trip.travellers.map((t) => (
                  <Traveller
                    key={t.id}
                    t={t}
                    tripStart={trip.startDate}
                    bookingId={trip.bookingId}
                  />
                ))}
              </ul>
            )}
          </Panel>

          {(arrival || trip.pickupPoint || departure || trip.dropoffPoint) && (
            <Panel title="Arrival and departure">
              <div className="space-y-3 px-5 py-4">
                {(arrival || trip.pickupPoint) && (
                  <Row
                    icon={PlaneLanding}
                    label={`Arrives ${formatDayDate(trip.startDate)}`}
                  >
                    {[
                      arrival,
                      trip.pickupPoint && `pick up at ${trip.pickupPoint}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Row>
                )}
                {(departure || trip.dropoffPoint) && (
                  <Row
                    icon={PlaneTakeoff}
                    label={`Leaves ${formatDayDate(trip.endDate)}`}
                  >
                    {[
                      departure,
                      trip.dropoffPoint && `drop off at ${trip.dropoffPoint}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Row>
                )}
              </div>
            </Panel>
          )}

          {trip.notes.length > 0 && (
            <Panel title="Notes from the office" count={trip.notes.length}>
              <ul className="space-y-1.5 px-5 py-4">
                {trip.notes.map((n) => (
                  <Note key={n.id} note={n} />
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
