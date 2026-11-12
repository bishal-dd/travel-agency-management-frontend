"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BedDouble,
  Building2,
  CalendarDays,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Route,
  Star,
  Trash2,
  User,
  Users,
  Utensils,
  X,
} from "lucide-react";

import { ConfirmDeleteDialog } from "../../shared/components/ConfirmDeleteDialog";
import { inputCls } from "../../shared/components/FormBits";
import { useHotels } from "../../hotel/hooks/useHotels";

import { useBookingById } from "../hooks/useBookingById";
import { useDayPlanPrices } from "../hooks/useDayPlanPrices";
import { useChangeBookingStatus } from "../hooks/useChangeBookingStatus";
import { useDeleteBooking } from "../hooks/useDeleteBooking";
import { useSaveBookingDays } from "../hooks/useSaveBookingDays";
import { useSaveBookingTravellers } from "../hooks/useSaveBookingTravellers";
import type { BookingDetail, BookingStatus } from "../types/booking";
import {
  type BookingDraftDay,
  type DraftTraveller,
  daysFrom,
  daysProblem,
  daysToInput,
  newTraveller,
  sameDays,
  sameTravellers,
  travellersFrom,
  travellersToInput,
} from "./bookingEditorState";
import {
  BookingStatusBadge,
  addDays,
  formatDateRange,
  formatDayDate,
  formatDayMonth,
  formatPax,
  formatWeekday,
  statusActionLabel,
  tripLength,
} from "./bookingUi";
import { EditBookingDialog } from "./EditBookingDialog";
import { PricingSection } from "./PricingSection";
import { DayPlan, type PlanPickers } from "./DayPlan";
import {
  type LinePrice,
  type LineTotals,
  carryOverLines,
  sumLines,
} from "./dayPlanState";
import { useDrivers } from "../../driver/hooks/useDrivers";
import { useGuides } from "../../guide/hooks/useGuides";
import { MEALS } from "../../itineraries/constants/itinerary";
import { DayFormDialog } from "../../itineraries/ui/DayFormDialog";
import { newDay, DraftDay } from "../../itineraries/utils/editorState";
import { QuotesPanel } from "../../quotes/ui/QuotesPanel";
import { useServices } from "../../service/hooks/useServices";
import { useVehicles } from "../../vehicle/hooks/useVehicles";

/** Records for the day pickers, loaded once. Keep ≤ your backend's max `limit`. */
const PICKER_LIMIT = 100;

const backLink = (
  <Link
    href="/dashboard/bookings"
    className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
  >
    <ArrowLeft size={15} /> Bookings
  </Link>
);

/** Prerendered placeholder (the page reads the id with useParams inside <Suspense>). */
export function BookingPageSkeleton() {
  return (
    <div aria-label="Loading booking">
      <div className="mb-5 h-5 w-24 animate-pulse rounded bg-mist" />
      <div className="mb-6 h-32 animate-pulse rounded-2xl bg-mist" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-mist" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-mist" />
      </div>
    </div>
  );
}

export function BookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { data, isPending, error } = useBookingById(bookingId);

  if (isPending) return <BookingPageSkeleton />;

  if (error || !data) {
    return (
      <>
        {backLink}
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <p className="font-semibold text-ink">
            {error ? "Couldn't load this booking" : "Booking not found"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {error?.message ??
              "It may have been deleted, or belongs to another agency."}
          </p>
        </div>
      </>
    );
  }

  return <BookingEditor key={data.id} booking={data} />;
}

// ---------- Status actions ----------

/** Moves that need a confirmation first. */
const CONFIRM: Partial<
  Record<BookingStatus, { title: string; body: string; button: string }>
> = {
  cancelled: {
    title: "Cancel this booking?",
    body: "It becomes read-only. You can reopen it later as an inquiry.",
    button: "Cancel booking",
  },
  completed: {
    title: "Mark the trip as completed?",
    body: "Completed bookings are final and can't be changed afterwards.",
    button: "Complete trip",
  },
};

function StatusActions({
  booking,
  disabled,
}: {
  booking: BookingDetail;
  disabled: boolean;
}) {
  const change = useChangeBookingStatus();
  const [confirming, setConfirming] = useState<BookingStatus | null>(null);
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(
    null,
  );

  function go(status: BookingStatus) {
    setPendingStatus(status);
    change.mutate(
      { bookingId: booking.id, status },
      {
        onSuccess: () => setConfirming(null),
        onSettled: () => setPendingStatus(null),
      },
    );
  }

  // Forward moves first and filled; backward / cancel as outlined buttons.
  const order: BookingStatus[] = [
    "quoted",
    "confirmed",
    "in_progress",
    "completed",
    "inquiry",
    "cancelled",
  ];
  const forward = new Set<BookingStatus>([
    "quoted",
    "confirmed",
    "in_progress",
    "completed",
  ]);
  const actions = [...booking.allowedStatuses].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b),
  );
  const isBack = (s: BookingStatus) =>
    !forward.has(s) || (booking.status === "confirmed" && s === "quoted");

  if (!actions.length) return null;

  const dialog = confirming ? CONFIRM[confirming] : undefined;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled || change.isPending}
            title={disabled ? "Save or discard your changes first" : undefined}
            onClick={() => (CONFIRM[s] ? setConfirming(s) : go(s))}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
              s === "cancelled"
                ? "text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50"
                : isBack(s)
                  ? "text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
                  : "bg-ink text-white hover:bg-lagoon-deep"
            }`}
          >
            {pendingStatus === s && !confirming && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {statusActionLabel(booking.status, s)}
          </button>
        ))}
      </div>
      {change.error && !confirming && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {change.error.message}
        </p>
      )}

      <ConfirmDeleteDialog
        open={!!dialog}
        title={dialog?.title ?? ""}
        confirmLabel={dialog?.button ?? ""}
        isPending={change.isPending}
        error={confirming ? change.error : null}
        onClose={() => setConfirming(null)}
        onConfirm={() => confirming && go(confirming)}
      >
        <p>{dialog?.body}</p>
      </ConfirmDeleteDialog>
    </>
  );
}

// ---------- Travellers ----------

function TravellerRow({
  t,
  index,
  readOnly,
  onChange,
  onRemove,
  onMakeLead,
}: {
  t: DraftTraveller;
  index: number;
  readOnly: boolean;
  onChange: (t: DraftTraveller) => void;
  onRemove: () => void;
  onMakeLead: () => void;
}) {
  const set =
    (k: keyof DraftTraveller) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...t, [k]: e.target.value });
  const small = `${inputCls} h-9`;

  return (
    <li className="space-y-2 rounded-xl border border-line p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-mist text-xs font-bold text-ink-soft">
          {index + 1}
        </span>
        <input
          aria-label={`Traveller ${index + 1} name`}
          value={t.name}
          onChange={set("name")}
          disabled={readOnly}
          placeholder="Full name as on passport"
          className={`${small} font-semibold`}
        />
        <button
          type="button"
          onClick={onMakeLead}
          disabled={readOnly}
          aria-pressed={t.isLead}
          aria-label={
            t.isLead
              ? `${t.name || "Traveller"} is the lead`
              : `Make ${t.name || "traveller"} the lead`
          }
          title={t.isLead ? "Lead traveller" : "Make lead traveller"}
          className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
            t.isLead
              ? "text-marigold"
              : "text-ink-soft/40 hover:bg-mist hover:text-ink"
          }`}
        >
          <Star size={16} className={t.isLead ? "fill-marigold" : ""} />
        </button>
        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove traveller ${index + 1}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
          >
            <X size={15} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 pl-9 sm:grid-cols-3">
        <input
          aria-label="Nationality"
          value={t.nationality}
          onChange={set("nationality")}
          disabled={readOnly}
          placeholder="Nationality"
          className={small}
        />
        <input
          aria-label="Date of birth"
          type="date"
          value={t.dateOfBirth}
          onChange={set("dateOfBirth")}
          disabled={readOnly}
          className={small}
        />
        <input
          aria-label="Passport or CID"
          value={t.passportOrCid}
          onChange={set("passportOrCid")}
          disabled={readOnly}
          placeholder="Passport / CID"
          className={`${small} font-mono`}
        />
      </div>
    </li>
  );
}

// ---------- Days ----------

function DayCard({
  day,
  number,
  date,
  isFirst,
  isLast,
  readOnly,
  onEdit,
  onMove,
  onDelete,
  onLinesChange,
  prices,
  totals,
  currency,
  pickers,
}: {
  day: BookingDraftDay;
  number: number;
  date: string;
  isFirst: boolean;
  isLast: boolean;
  readOnly: boolean;
  onEdit: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onLinesChange: (lines: BookingDraftDay["lines"]) => void;
  prices: Map<string, LinePrice>;
  totals: LineTotals;
  currency: string;
  pickers: PlanPickers;
}) {
  const meals = MEALS.filter((m) => day.meals.includes(m.value)).map(
    (m) => m.label,
  );
  const iconBtn =
    "grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <li className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-14 shrink-0 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            Day {number}
          </p>
          <p className="text-sm font-bold text-ink">{formatDayMonth(date)}</p>
          <p className="text-[11px] text-ink-soft">{formatWeekday(date)}</p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          disabled={readOnly}
          className="min-w-0 flex-1 text-left disabled:cursor-default"
        >
          <p className="font-semibold text-ink">{day.title}</p>
          {day.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
              {day.description}
            </p>
          )}
          <span className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
            {(day.overnightLocation || day.suggestedHotel) && (
              <span className="flex items-center gap-1.5">
                <BedDouble size={14} aria-hidden="true" />
                {day.overnightLocation || day.suggestedHotel?.city}
                {day.suggestedHotel && (
                  <span className="text-ink">· {day.suggestedHotel.name}</span>
                )}
              </span>
            )}
            {meals.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Utensils size={14} aria-hidden="true" /> {meals.join(", ")}
              </span>
            )}
            {day.activities.length > 0 && (
              <span className="flex max-w-[26rem] items-center gap-1.5">
                <MapPin size={14} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{day.activities.join(" · ")}</span>
              </span>
            )}
          </span>
        </button>

        {!readOnly && (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={isFirst}
              aria-label={`Move day ${number} up`}
              className={iconBtn}
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={isLast}
              aria-label={`Move day ${number} down`}
              className={iconBtn}
            >
              <ArrowDown size={15} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit day ${number}`}
              className={iconBtn}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete day ${number}`}
              className="grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <DayPlan
        lines={day.lines}
        onChange={onLinesChange}
        prices={prices}
        totals={totals}
        currency={currency}
        readOnly={readOnly}
        pickers={pickers}
      />
    </li>
  );
}

// ---------- Editor ----------

function BookingEditor({ booking }: { booking: BookingDetail }) {
  const router = useRouter();
  const saveTravellers = useSaveBookingTravellers();
  const saveDays = useSaveBookingDays();
  const remove = useDeleteBooking();

  const [travellers, setTravellers] = useState<DraftTraveller[]>(() =>
    travellersFrom(booking),
  );
  const [days, setDays] = useState<BookingDraftDay[]>(() => daysFrom(booking));
  const [editingDay, setEditingDay] = useState<{
    day: BookingDraftDay;
    index: number;
  } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const readOnly =
    booking.status === "completed" || booking.status === "cancelled";
  const travellersDirty = !sameTravellers(travellers, travellersFrom(booking));
  const daysDirty = !sameDays(days, daysFrom(booking));
  const dirty = travellersDirty || daysDirty;

  // ----- day plans: pickers, live prices, totals -----
  const { hotels } = useHotels({ status: "active", limit: PICKER_LIMIT });
  const { vehicles } = useVehicles({ status: "active", limit: PICKER_LIMIT });
  const { drivers } = useDrivers({ status: "active", limit: PICKER_LIMIT });
  const { guides } = useGuides({ status: "active", limit: PICKER_LIMIT });
  const { services } = useServices({ status: "active", limit: PICKER_LIMIT });
  const pickers: PlanPickers = { hotels, vehicles, drivers, guides, services };

  const prices = useDayPlanPrices(booking.id, days);
  const dayTotals = days.map((d) => sumLines(d.lines, prices));
  const hasLines = days.some((d) => d.lines.length > 0);

  const setDayLines = (key: string, lines: BookingDraftDay["lines"]) =>
    setDays((ds) => ds.map((d) => (d.key === key ? { ...d, lines } : d)));

  /** A new day starts with the last day's vehicle, driver and guide. */
  const blankDay = (): BookingDraftDay => ({
    ...newDay(),
    lines: carryOverLines(days[days.length - 1]?.lines),
  });

  // When the server copy changes and nothing is being edited, follow it.
  useEffect(() => {
    if (dirty) return;
    setTravellers(travellersFrom(booking));
    setDays(daysFrom(booking));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.updatedAt]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function moveDay(index: number, dir: -1 | 1) {
    setDays((ds) => {
      const next = [...ds];
      const [d] = next.splice(index, 1);
      next.splice(index + dir, 0, d!);
      return next;
    });
  }

  function saveDayFromDialog(edited: DraftDay) {
    setDays((ds) => {
      const existing = ds.find((d) => d.key === edited.key);
      // The dialog edits the day's details; its lines are edited on the card.
      const day: BookingDraftDay = {
        ...edited,
        lines:
          existing?.lines ?? (edited as Partial<BookingDraftDay>).lines ?? [],
      };
      return existing
        ? ds.map((d) => (d.key === day.key ? day : d))
        : [...ds, day];
    });
    setEditingDay(null);
  }

  function discard() {
    setTravellers(travellersFrom(booking));
    setDays(daysFrom(booking));
    setSaveError(null);
  }

  async function save() {
    const unnamed = travellers.findIndex((t) => !t.name.trim());
    if (unnamed !== -1) {
      setSaveError(`Traveller ${unnamed + 1} needs a name.`);
      return;
    }
    const dayProblem = daysProblem(days);
    if (dayProblem) {
      setSaveError(dayProblem);
      return;
    }
    const unpriced = dayTotals.findIndex((t) => t.needsPrice > 0);
    if (unpriced !== -1) {
      setSaveError(
        `Day ${unpriced + 1}: something has no rate. Set a price for it, or add the rate first.`,
      );
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      let latest = booking;
      if (travellersDirty) {
        latest = (
          await saveTravellers.mutateAsync({
            bookingId: booking.id,
            travellers: travellersToInput(travellers),
          })
        ).data;
        setTravellers(travellersFrom(latest));
      }
      if (daysDirty) {
        latest = (
          await saveDays.mutateAsync({
            bookingId: booking.id,
            days: daysToInput(days),
          })
        ).data;
        setDays(daysFrom(latest));
      }
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Couldn't save the booking.",
      );
    } finally {
      setSaving(false);
    }
  }

  const { customer } = booking;
  const length = tripLength(booking.startDate, booking.endDate);
  const nextDate = addDays(booking.startDate, days.length);
  const canDelete = booking.status === "inquiry" || booking.status === "quoted";
  const travellerGap = booking.adults + booking.children - travellers.length;

  /** Re-price every line from today's rates (special prices stay). */
  function refreshRates() {
    setSaveError(null);
    saveDays.mutate(
      { bookingId: booking.id, days: daysToInput(days), refreshRates: true },
      { onSuccess: (res) => setDays(daysFrom(res.data)) },
    );
  }

  return (
    <div className={dirty ? "pb-24" : ""}>
      {backLink}

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-ink-soft">
                {booking.reference}
              </span>
              <BookingStatusBadge status={booking.status} />
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              {booking.title}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden="true" />
                {formatDateRange(booking.startDate, booking.endDate)} · {length}{" "}
                day{length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} aria-hidden="true" />
                {formatPax(booking.adults, booking.children)}
              </span>
              {booking.itinerary && (
                <Link
                  href={`/dashboard/itineraries/${booking.itinerary.id}`}
                  className="inline-flex items-center gap-1.5 hover:text-lagoon-deep"
                >
                  <Route size={14} aria-hidden="true" /> From{" "}
                  {booking.itinerary.name}
                </Link>
              )}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {!readOnly && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
              >
                <Pencil size={14} /> Edit details
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete booking"
                title="Delete booking"
                className="grid size-9 place-items-center rounded-full text-ink-soft ring-1 ring-inset ring-line hover:bg-red-50 hover:text-red-600 hover:ring-red-200"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <StatusActions booking={booking} disabled={dirty} />
        </div>
      </div>

      {readOnly && (
        <p className="mb-6 flex items-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm text-ink-soft">
          <Lock size={15} aria-hidden="true" />
          {booking.status === "completed"
            ? "This trip is completed, so the booking can't be changed."
            : "This booking is cancelled. Reopen it to make changes."}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Days */}
        <section aria-labelledby="days-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="days-heading" className="text-lg font-bold text-ink">
              Itinerary
            </h2>
            {!readOnly && days.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hasLines && (
                  <button
                    type="button"
                    onClick={refreshRates}
                    disabled={dirty || saveDays.isPending}
                    title={
                      dirty
                        ? "Save your changes first"
                        : "Re-price every line from today's rates. Special prices stay."
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink-soft ring-1 ring-inset ring-line hover:text-ink hover:ring-ink/40 disabled:opacity-50"
                  >
                    {saveDays.isPending && !saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Current rates
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setEditingDay({ day: blankDay(), index: days.length })
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
                >
                  <Plus size={15} /> Add day
                </button>
              </div>
            )}
          </div>

          {saveDays.error && !dirty && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              {saveDays.error.message}
            </p>
          )}

          {days.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
              <p className="font-semibold text-ink">No days planned yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Day 1 is {formatDayDate(booking.startDate)}. Add what happens
                each day.
              </p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setEditingDay({ day: blankDay(), index: 0 })}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
                >
                  <Plus size={16} /> Add day 1
                </button>
              )}
            </div>
          ) : (
            <>
              <ol className="space-y-3">
                {days.map((d, i) => (
                  <DayCard
                    key={d.key}
                    day={d}
                    number={i + 1}
                    date={addDays(booking.startDate, i)}
                    isFirst={i === 0}
                    isLast={i === days.length - 1}
                    readOnly={readOnly}
                    onEdit={() => setEditingDay({ day: d, index: i })}
                    onMove={(dir) => moveDay(i, dir)}
                    onDelete={() =>
                      setDays((ds) => ds.filter((x) => x.key !== d.key))
                    }
                    onLinesChange={(lines) => setDayLines(d.key, lines)}
                    prices={prices}
                    totals={dayTotals[i]!}
                    currency={booking.currency}
                    pickers={pickers}
                  />
                ))}
              </ol>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingDay({ day: blankDay(), index: days.length })
                  }
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-semibold text-ink-soft transition-colors hover:border-lagoon-deep hover:bg-lagoon-tint hover:text-lagoon-deep"
                >
                  <Plus size={15} /> Add day {days.length + 1} ·{" "}
                  {formatDayDate(nextDate)}
                </button>
              )}
              {days.length > length && (
                <p className="mt-2 text-sm text-ink-soft">
                  Saving will extend the end date to{" "}
                  {formatDayDate(addDays(booking.startDate, days.length - 1))}.
                </p>
              )}
            </>
          )}
        </section>

        {/* Side column: quotes, customer, travellers */}
        <div className="space-y-6">
          <QuotesPanel booking={booking} unsavedChanges={dirty} />

          <section
            aria-labelledby="customer-heading"
            className="rounded-2xl border border-line bg-white p-5"
          >
            <h2
              id="customer-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft"
            >
              Customer
            </h2>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-marigold/30 text-ink">
                {customer.type === "company" ? (
                  <Building2 size={17} />
                ) : (
                  <User size={17} />
                )}
              </span>
              <div className="min-w-0 space-y-1 text-sm">
                <p className="font-semibold text-ink">{customer.name}</p>
                {customer.contactPerson && (
                  <p className="text-ink-soft">
                    Contact: {customer.contactPerson}
                  </p>
                )}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-1.5 text-ink-soft hover:text-lagoon-deep"
                  >
                    <Mail size={13} aria-hidden="true" />{" "}
                    <span className="truncate">{customer.email}</span>
                  </a>
                )}
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-1.5 text-ink-soft hover:text-lagoon-deep"
                  >
                    <Phone size={13} aria-hidden="true" /> {customer.phone}
                  </a>
                )}
                {customer.country && (
                  <p className="flex items-center gap-1.5 text-ink-soft">
                    <MapPin size={13} aria-hidden="true" /> {customer.country}
                  </p>
                )}
              </div>
            </div>
            {booking.notes && (
              <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm text-ink-soft">
                {booking.notes}
              </p>
            )}
          </section>

          <section
            aria-labelledby="travellers-heading"
            className="rounded-2xl border border-line bg-white p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="travellers-heading"
                className="text-sm font-semibold uppercase tracking-wide text-ink-soft"
              >
                Travellers · {travellers.length}
              </h2>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() =>
                    setTravellers((ts) => [
                      ...ts,
                      newTraveller(ts.length === 0),
                    ])
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>

            {travellers.length === 0 ? (
              <p className="text-sm text-ink-soft">
                No travellers yet. Their nationality and age are needed for fees
                and permits.
              </p>
            ) : (
              <ol className="space-y-2">
                {travellers.map((t, i) => (
                  <TravellerRow
                    key={t.key}
                    t={t}
                    index={i}
                    readOnly={readOnly}
                    onChange={(next) =>
                      setTravellers((ts) =>
                        ts.map((x) => (x.key === t.key ? next : x)),
                      )
                    }
                    onRemove={() =>
                      setTravellers((ts) => ts.filter((x) => x.key !== t.key))
                    }
                    onMakeLead={() =>
                      setTravellers((ts) =>
                        ts.map((x) => ({ ...x, isLead: x.key === t.key })),
                      )
                    }
                  />
                ))}
              </ol>
            )}
            {!readOnly && travellerGap > 0 && travellers.length > 0 && (
              <p className="mt-3 text-xs text-ink-soft">
                {travellerGap} more guest{travellerGap === 1 ? "" : "s"}{" "}
                expected ({formatPax(booking.adults, booking.children)}).
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Trip totals, from the day plans above (including unsaved changes). */}
      <PricingSection
        booking={booking}
        days={days}
        dayTotals={dayTotals}
        dirty={daysDirty}
        travellersDirty={travellersDirty}
      />

      <DayFormDialog
        open={!!editingDay}
        dayNumber={(editingDay?.index ?? 0) + 1}
        initial={editingDay?.day ?? null}
        subtitle={
          editingDay
            ? `${formatDayDate(addDays(booking.startDate, editingDay.index))} · changes are kept until you save.`
            : undefined
        }
        withServices={false}
        onClose={() => setEditingDay(null)}
        onSave={saveDayFromDialog}
      />

      <EditBookingDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={booking}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete booking?"
        confirmLabel="Delete booking"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          remove.mutate(booking.id, {
            onSuccess: () => router.push("/dashboard/bookings"),
          })
        }
      >
        <p>
          <span className="font-semibold text-ink">{booking.reference}</span>{" "}
          and its travellers and days will be deleted. This can&apos;t be
          undone.
        </p>
      </ConfirmDeleteDialog>

      {/* Save bar: rendered into <body> so no parent transform can clip it. */}
      {dirty &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
            <div
              role="region"
              aria-label="Unsaved changes"
              className="animate-rise flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-deep [animation-duration:0.2s] sm:flex-row sm:items-center"
            >
              <p className="flex-1 text-sm">
                {saveError ? (
                  <span className="text-red-200">{saveError}</span>
                ) : (
                  `Unsaved changes to ${[
                    travellersDirty && "travellers",
                    daysDirty && "days",
                  ]
                    .filter(Boolean)
                    .join(" and ")}.`
                )}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={discard}
                  disabled={saving}
                  className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-white/80 ring-1 ring-inset ring-white/25 hover:text-white disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink hover:bg-lagoon-tint disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving..." : "Save booking"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
