"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Star,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import {
  useAddChecklistItem,
  useAddNote,
  useDeleteChecklistItem,
  useDeleteNote,
  useToggleChecklistItem,
  useTrip,
  useUpdateLogistics,
} from "../hooks/useTrips";
import type {
  ChecklistItem,
  Logistics,
  TripDay,
  TripDetail,
  TripNote,
} from "../types/trip";
import { ClashList } from "./TodayBoard";
import {
  CrewLine,
  Panel,
  PhaseBadge,
  StatusHintButton,
  bookingHref,
  formatDate,
  formatDayDate,
  formatDayMonth,
  formatRange,
} from "./parts";

const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

const pax = (p: TripDetail["pax"]) =>
  `${p.adults} adult${p.adults === 1 ? "" : "s"}${p.children ? ` · ${p.children} child${p.children === 1 ? "" : "ren"}` : ""}`;

// ---------- notes ----------

function NoteItem({ note, bookingId }: { note: TripNote; bookingId: string }) {
  const del = useDeleteNote(bookingId);
  return (
    <li className="group flex gap-2 rounded-lg bg-marigold-tint/60 px-3 py-2 text-sm">
      <p className="min-w-0 flex-1 whitespace-pre-wrap text-ink">
        {note.body}
        <span className="mt-0.5 block text-xs text-ink-soft">
          {note.authorName ? `${note.authorName} · ` : ""}
          {formatDate(note.createdAt.slice(0, 10))}
        </span>
      </p>
      <button
        type="button"
        onClick={() => del.mutate(note.id)}
        disabled={del.isPending}
        aria-label="Delete note"
        className="grid size-7 shrink-0 place-items-center rounded-full text-ink-soft opacity-100 hover:bg-white hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
      >
        {del.isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    </li>
  );
}

function AddNote({
  bookingId,
  dayNumber,
  compact,
}: {
  bookingId: string;
  dayNumber?: number;
  compact?: boolean;
}) {
  const add = useAddNote(bookingId);
  const [open, setOpen] = useState(!compact);
  const [body, setBody] = useState("");

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-lagoon-deep hover:underline"
      >
        <Plus size={13} aria-hidden="true" /> Add note
      </button>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        add.mutate(
          { body: body.trim(), dayNumber: dayNumber ?? null },
          {
            onSuccess: () => {
              setBody("");
              if (compact) setOpen(false);
            },
          },
        );
      }}
      className="space-y-2"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        aria-label={dayNumber ? `Note for day ${dayNumber}` : "Trip note"}
        placeholder={
          dayNumber
            ? "e.g. Road blocked at Dochula, went via Wangdue"
            : "e.g. Guest is vegetarian; celebrating an anniversary"
        }
        autoFocus={compact}
        className={`${inputCls} h-auto py-2`}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={add.isPending || !body.trim()}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-white hover:bg-lagoon-deep disabled:opacity-50"
        >
          {add.isPending && <Loader2 size={13} className="animate-spin" />}
          Save note
        </button>
        {compact && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-8 rounded-full px-3 text-xs text-ink-soft hover:bg-mist"
          >
            Cancel
          </button>
        )}
        {add.error && (
          <span className="text-xs text-red-700">{add.error.message}</span>
        )}
      </div>
    </form>
  );
}

// ---------- days ----------

function DayCard({ day, bookingId }: { day: TripDay; bookingId: string }) {
  const empty =
    day.crew.length === 0 &&
    day.hotels.length === 0 &&
    day.services.length === 0;
  return (
    <li
      className={`relative rounded-2xl border bg-white ${day.isToday ? "border-ink shadow-sm" : "border-line"}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Day {day.dayNumber}
        </span>
        <span className="text-xs text-ink-soft">{formatDayDate(day.date)}</span>
        {day.isToday && (
          <span className="rounded-full bg-marigold px-2 py-px text-[11px] font-bold uppercase text-ink">
            Today
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
        {day.crew.length > 0 && (
          <ul className="space-y-1.5">
            {day.crew.map((c) => (
              <CrewLine key={`${c.kind}:${c.id}`} member={c} clash={c.clash} />
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
        {empty && (
          <p className="text-sm text-ink-soft">
            Nothing arranged for this day yet.
          </p>
        )}

        {day.notes.length > 0 && (
          <ul className="space-y-1.5">
            {day.notes.map((n) => (
              <NoteItem key={n.id} note={n} bookingId={bookingId} />
            ))}
          </ul>
        )}
        <AddNote bookingId={bookingId} dayNumber={day.dayNumber} compact />
      </div>
    </li>
  );
}

// ---------- arrival & departure ----------

const LOGISTICS_FIELDS: {
  key: keyof Logistics;
  label: string;
  placeholder: string;
  time?: boolean;
}[] = [
  {
    key: "arrivalFlight",
    label: "Arrival flight",
    placeholder: "KB 540 from Delhi",
  },
  { key: "arrivalTime", label: "Lands at", placeholder: "10:30", time: true },
  { key: "pickupPoint", label: "Pick up at", placeholder: "Paro airport" },
  {
    key: "departureFlight",
    label: "Departure flight",
    placeholder: "B3 700 to Kathmandu",
  },
  {
    key: "departureTime",
    label: "Takes off at",
    placeholder: "13:00",
    time: true,
  },
  { key: "dropoffPoint", label: "Drop off at", placeholder: "Paro airport" },
];

function LogisticsPanel({ trip }: { trip: TripDetail }) {
  const save = useUpdateLogistics(trip.bookingId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<keyof Logistics, string>>(() =>
    toForm(trip),
  );

  function toForm(t: Logistics) {
    return Object.fromEntries(
      LOGISTICS_FIELDS.map((f) => [f.key, t[f.key] ?? ""]),
    ) as Record<keyof Logistics, string>;
  }
  useEffect(() => {
    if (!editing) setForm(toForm(trip));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editing,
    trip.arrivalFlight,
    trip.arrivalTime,
    trip.departureFlight,
    trip.departureTime,
    trip.pickupPoint,
    trip.dropoffPoint,
  ]);

  const line = (
    icon: React.ReactNode,
    date: string,
    parts: (string | null)[],
    empty: string,
  ) => (
    <div className="flex gap-3">
      <span className="mt-0.5 text-ink-soft">{icon}</span>
      <div className="min-w-0 text-sm">
        <p className="text-xs text-ink-soft">{formatDayDate(date)}</p>
        {parts.some(Boolean) ? (
          <p className="text-ink">{parts.filter(Boolean).join(" · ")}</p>
        ) : (
          <p className="text-ink-soft">{empty}</p>
        )}
      </div>
    </div>
  );

  return (
    <Panel
      id="logistics"
      title="Arrival & departure"
      action={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-sm font-medium text-lagoon-deep hover:underline"
          >
            <Pencil size={13} aria-hidden="true" /> Edit
          </button>
        )
      }
    >
      {editing ? (
        <form
          className="space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form, { onSuccess: () => setEditing(false) });
          }}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
            {LOGISTICS_FIELDS.map((f) => (
              <label
                key={f.key}
                className={`min-w-0 ${f.key === "pickupPoint" || f.key === "dropoffPoint" ? "col-span-2" : ""}`}
              >
                <span className="mb-1 block text-xs font-medium text-ink">
                  {f.label}
                </span>
                <input
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  inputMode={f.time ? "numeric" : undefined}
                  maxLength={f.time ? 5 : 200}
                  className={
                    f.time
                      ? `${sizedInputCls} w-full text-center tabular-nums`
                      : inputCls
                  }
                />
              </label>
            ))}
          </div>
          {save.error && (
            <p className="text-xs text-red-700">{save.error.message}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-9 rounded-full px-4 text-sm text-ink-soft hover:bg-mist"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-lagoon-deep disabled:opacity-50"
            >
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 p-5">
          {line(
            <PlaneLanding size={16} />,
            trip.startDate,
            [
              trip.arrivalTime,
              trip.arrivalFlight,
              trip.pickupPoint && `pick up at ${trip.pickupPoint}`,
            ],
            "No arrival details yet",
          )}
          {line(
            <PlaneTakeoff size={16} />,
            trip.endDate,
            [
              trip.departureTime,
              trip.departureFlight,
              trip.dropoffPoint && `drop off at ${trip.dropoffPoint}`,
            ],
            "No departure details yet",
          )}
        </div>
      )}
    </Panel>
  );
}

// ---------- checklist ----------

function ChecklistRow({
  item,
  bookingId,
}: {
  item: ChecklistItem;
  bookingId: string;
}) {
  const toggle = useToggleChecklistItem(bookingId);
  const del = useDeleteChecklistItem(bookingId);
  return (
    <li className="group flex items-start gap-3 px-5 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.done}
        aria-label={item.label}
        onClick={() => toggle.mutate({ itemId: item.id, done: !item.done })}
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
          item.done
            ? "border-lagoon-deep bg-lagoon-deep text-white"
            : "border-ink/25 bg-white hover:border-ink"
        }`}
      >
        {item.done && <Check size={13} strokeWidth={3} aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${item.done ? "text-ink-soft line-through" : "text-ink"}`}
        >
          {item.label}
        </p>
        <p className="text-xs text-ink-soft">
          {item.done ? (
            <>
              Done{item.doneBy ? ` by ${item.doneBy}` : ""}
              {item.doneAt
                ? ` · ${formatDayMonth(item.doneAt.slice(0, 10))}`
                : ""}
            </>
          ) : item.dueDate ? (
            <span className={item.overdue ? "font-semibold text-red-700" : ""}>
              {item.overdue ? "Late · was due " : "Due "}
              {formatDayMonth(item.dueDate)}
            </span>
          ) : (
            "No deadline"
          )}
        </p>
        {toggle.error && (
          <p className="text-xs text-red-700">{toggle.error.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => del.mutate(item.id)}
        disabled={del.isPending}
        aria-label={`Remove "${item.label}"`}
        className="grid size-7 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
      >
        {del.isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <X size={14} />
        )}
      </button>
    </li>
  );
}

function ChecklistPanel({ trip }: { trip: TripDetail }) {
  const add = useAddChecklistItem(trip.bookingId);
  const [label, setLabel] = useState("");
  const [due, setDue] = useState("");
  const done = trip.checklist.filter((i) => i.done).length;
  const late = trip.checklist.filter((i) => i.overdue).length;

  return (
    <Panel
      id="checklist"
      title="Checklist"
      action={
        trip.checklist.length > 0 && (
          <span
            className={`text-sm tabular-nums ${late ? "font-semibold text-red-700" : "text-ink-soft"}`}
          >
            {done}/{trip.checklist.length} done{late ? ` · ${late} late` : ""}
          </span>
        )
      }
    >
      {trip.checklist.length === 0 ? (
        <p className="px-5 pt-4 text-sm text-ink-soft">
          No checklist items. Add what needs arranging for this trip.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {trip.checklist.map((i) => (
            <ChecklistRow key={i.id} item={i} bookingId={trip.bookingId} />
          ))}
        </ul>
      )}
      <form
        className="flex flex-wrap gap-2 border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim()) return;
          add.mutate(
            { label: label.trim(), dueDate: due || null },
            {
              onSuccess: () => {
                setLabel("");
                setDue("");
              },
            },
          );
        }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add an item, e.g. Book Tiger's Nest horses"
          aria-label="New checklist item"
          className={`${sizedInputCls} min-w-0 flex-1 basis-48`}
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          aria-label="Due date (optional)"
          className={`${sizedInputCls} w-36`}
        />
        <button
          type="submit"
          disabled={add.isPending || !label.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-lagoon-deep disabled:opacity-50"
        >
          {add.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add
        </button>
        {add.error && (
          <p className="w-full text-xs text-red-700">{add.error.message}</p>
        )}
      </form>
    </Panel>
  );
}

// ---------- guests ----------

function GuestsPanel({ trip }: { trip: TripDetail }) {
  return (
    <Panel id="guests" title="Guests" count={trip.travellers.length}>
      <div className="space-y-1 border-b border-line px-5 py-3.5 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Customer
        </p>
        <p className="font-medium text-ink">{trip.customer.name}</p>
        {trip.customer.phone && (
          <a
            href={`tel:${trip.customer.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-lagoon-deep hover:underline"
          >
            <Phone size={13} aria-hidden="true" /> {trip.customer.phone}
          </a>
        )}
        {trip.customer.email && (
          <a
            href={`mailto:${trip.customer.email}`}
            className="flex min-w-0 items-center gap-1.5 text-lagoon-deep hover:underline"
          >
            <Mail size={13} aria-hidden="true" className="shrink-0" />{" "}
            <span className="truncate">{trip.customer.email}</span>
          </a>
        )}
      </div>
      {trip.travellers.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ink-soft">
          No travellers added. Add them on the{" "}
          <Link
            href={bookingHref(trip.bookingId)}
            className="text-lagoon-deep hover:underline"
          >
            booking
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {trip.travellers.map((t) => (
            <li key={t.id} className="px-5 py-2.5 text-sm">
              <p className="flex items-center gap-1.5 font-medium text-ink">
                {t.name}
                {t.isLead && (
                  <Star
                    size={12}
                    aria-label="Lead traveller"
                    className="fill-marigold text-marigold"
                  />
                )}
              </p>
              <p className="text-xs text-ink-soft">
                {[
                  t.nationality,
                  t.passportOrCid,
                  t.dateOfBirth && `born ${formatDate(t.dateOfBirth)}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No details"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ---------- page ----------

export function TripDetailPage({ bookingId }: { bookingId: string }) {
  const { data: trip, isPending, error } = useTrip(bookingId);

  if (isPending)
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-mist" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="h-96 animate-pulse rounded-2xl bg-mist" />
          <div className="h-64 animate-pulse rounded-2xl bg-mist" />
        </div>
      </div>
    );

  if (error || !trip) {
    const status = (error as { status?: number } | null)?.status;
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <p className="font-semibold text-ink">
          {status === 409
            ? "Not a trip yet"
            : status === 404
              ? "Trip not found"
              : status === 403
                ? "No access"
                : "Couldn't load this trip"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">{error?.message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/dashboard/trips"
            className="h-9 rounded-full px-4 text-sm leading-9 text-ink-soft hover:bg-mist"
          >
            All trips
          </Link>
          {status === 409 && (
            <Link
              href={bookingHref(bookingId)}
              className="h-9 rounded-full bg-ink px-4 text-sm font-semibold leading-9 text-white hover:bg-lagoon-deep"
            >
              Open booking
            </Link>
          )}
        </div>
      </div>
    );
  }

  const sub = [
    trip.reference,
    trip.customer.name !== trip.title ? trip.customer.name : null,
    formatRange(trip.startDate, trip.endDate),
    pax(trip.pax),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/trips"
          className="mb-3 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Trips
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                {trip.title}
              </h1>
              <PhaseBadge
                phase={trip.phase}
                day={{ current: trip.currentDay, total: trip.totalDays }}
              />
            </div>
            <p className="mt-1 text-sm text-ink-soft">{sub}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatusHintButton
              bookingId={trip.bookingId}
              hint={trip.statusHint}
              size="md"
            />
            <Link
              href={bookingHref(trip.bookingId)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:border-ink"
            >
              Open booking <ExternalLink size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {trip.clashes.length > 0 && (
        <section
          aria-labelledby="trip-clash"
          className="rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:p-5"
        >
          <h2
            id="trip-clash"
            className="mb-2 flex items-center gap-2 font-semibold text-red-800"
          >
            <AlertTriangle size={17} aria-hidden="true" />
            Double-booked crew
          </h2>
          <ClashList clashes={trip.clashes} currentBookingId={trip.bookingId} />
          <p className="mt-3 text-xs text-red-800/80">
            Change the assignment on{" "}
            <Link
              href={bookingHref(trip.bookingId)}
              className="underline underline-offset-2"
            >
              this booking&apos;s day plan
            </Link>{" "}
            or the other trip&apos;s.
          </p>
        </section>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="days-heading" className="min-w-0">
          <h2 id="days-heading" className="mb-3 font-semibold text-ink">
            Day by day
          </h2>
          <ol className="space-y-3">
            {trip.days.map((d) => (
              <DayCard key={d.dayNumber} day={d} bookingId={trip.bookingId} />
            ))}
          </ol>
          {trip.extras.length > 0 && (
            <div className="mt-3 rounded-2xl border border-line bg-white px-5 py-3.5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Also arranged
              </p>
              <ul className="space-y-1 text-sm text-ink">
                {trip.extras.map((x, i) => (
                  <li key={i}>
                    {x.description}{" "}
                    <span className="text-ink-soft">
                      · {formatDayMonth(x.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="min-w-0 space-y-5">
          <LogisticsPanel trip={trip} />
          <ChecklistPanel trip={trip} />
          <GuestsPanel trip={trip} />
          <Panel id="trip-notes" title="Trip notes" count={trip.notes.length}>
            <div className="space-y-3 p-5">
              {trip.bookingNotes && (
                <p className="whitespace-pre-wrap rounded-lg bg-mist px-3 py-2 text-sm text-ink">
                  <span className="mb-0.5 block text-xs text-ink-soft">
                    From the booking
                  </span>
                  {trip.bookingNotes}
                </p>
              )}
              {trip.notes.length > 0 && (
                <ul className="space-y-1.5">
                  {trip.notes.map((n) => (
                    <NoteItem key={n.id} note={n} bookingId={trip.bookingId} />
                  ))}
                </ul>
              )}
              <AddNote bookingId={trip.bookingId} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
