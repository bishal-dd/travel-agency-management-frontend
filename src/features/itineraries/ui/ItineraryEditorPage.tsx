"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BedDouble,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Ticket,
  Trash2,
  Utensils,
} from "lucide-react";
import { StatusBadge } from "../../hotel/ui/StatusBadge";
import {
  ChipPicker,
  Field,
  StatusToggle,
  inputCls,
} from "../../shared/components/FormBits";
import { TagInput } from "../../shared/components/TagInput";
import { useItineraryById } from "../hooks/useItineraryById";
import { useSaveItineraryDays } from "../hooks/useSaveItineraryDays";
import { useUpdateItinerary } from "../hooks/useUpdateItinerary";
import type { ItineraryDetail } from "../types/itinerary";

import { DayFormDialog } from "./DayFormDialog";
import { formatPrice } from "@/src/lib/format";
import {
  MEALS,
  formatLength,
  ITINERARY_CATEGORIES,
  DESTINATIONS,
  INCLUSIONS,
  EXCLUSIONS,
} from "../constants/itinerary";
import {
  DraftDay,
  DraftOverview,
  overviewFrom,
  daysFrom,
  sameOverview,
  sameDays,
  overviewToInput,
  daysToInput,
  servicesTotal,
  newDay,
} from "../utils/editorState";

const backLink = (
  <Link
    href="/dashboard/itineraries"
    className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
  >
    <ArrowLeft size={15} /> Itineraries
  </Link>
);

/** Prerendered placeholder (the page reads the id with useParams inside <Suspense>). */
export function ItineraryEditorSkeleton() {
  return (
    <div aria-label="Loading itinerary">
      <div className="mb-5 h-5 w-24 animate-pulse rounded bg-mist" />
      <div className="mb-6 h-10 w-1/2 animate-pulse rounded-lg bg-mist" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-mist" />
      </div>
    </div>
  );
}

export function ItineraryEditorPage() {
  const { itineraryId } = useParams<{ itineraryId: string }>();
  const { data, isPending, error } = useItineraryById(itineraryId);

  if (isPending) return <ItineraryEditorSkeleton />;

  if (error || !data) {
    return (
      <>
        {backLink}
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <p className="font-semibold text-ink">
            {error ? "Couldn't load this itinerary" : "Itinerary not found"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {error?.message ??
              "It may have been deleted, or belongs to another agency."}
          </p>
        </div>
      </>
    );
  }

  // key: a different itinerary (e.g. after Duplicate) starts a fresh editor.
  return <Editor key={data.id} itinerary={data} />;
}

function DayCard({
  day,
  number,
  isFirst,
  isLast,
  onEdit,
  onMove,
  onDelete,
}: {
  day: DraftDay;
  number: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const meals = MEALS.filter((m) => day.meals.includes(m.value)).map(
    (m) => m.label,
  );
  const iconBtn =
    "grid size-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <li className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-sm font-bold text-white">
          {number}
        </span>

        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 text-left"
        >
          <p className="font-semibold text-ink hover:text-lagoon-deep">
            {day.title}
          </p>
          {day.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
              {day.description}
            </p>
          )}
        </button>

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
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 pl-[3.25rem] text-sm text-ink-soft">
        {(day.overnightLocation || day.suggestedHotel) && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Overnight</dt>
            <BedDouble size={14} aria-hidden="true" />
            <dd>
              {day.overnightLocation || day.suggestedHotel?.city}
              {day.suggestedHotel && (
                <span className="text-ink"> · {day.suggestedHotel.name}</span>
              )}
            </dd>
          </div>
        )}
        {meals.length > 0 && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Meals</dt>
            <Utensils size={14} aria-hidden="true" />
            <dd>{meals.join(", ")}</dd>
          </div>
        )}
        {day.activities.length > 0 && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Activities</dt>
            <MapPin size={14} aria-hidden="true" />
            <dd className="max-w-[28rem] truncate">
              {day.activities.join(" · ")}
            </dd>
          </div>
        )}
        {day.services.length > 0 && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Services</dt>
            <Ticket size={14} aria-hidden="true" />
            <dd className="max-w-[28rem] truncate">
              {day.services
                .map((s) =>
                  s.quantity > 1
                    ? `${s.service.name} × ${s.quantity}`
                    : s.service.name,
                )
                .join(" · ")}
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function Editor({ itinerary }: { itinerary: ItineraryDetail }) {
  const update = useUpdateItinerary();
  const saveDays = useSaveItineraryDays();

  // `base` = what's saved on the server; drafts = what's on screen.
  const [base, setBase] = useState(itinerary);
  const [overview, setOverview] = useState<DraftOverview>(() =>
    overviewFrom(itinerary),
  );
  const [days, setDays] = useState<DraftDay[]>(() => daysFrom(itinerary));

  const [editing, setEditing] = useState<{
    day: DraftDay;
    index: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string>();

  const overviewDirty = !sameOverview(overview, overviewFrom(base));
  const daysDirty = !sameDays(days, daysFrom(base));
  const dirty = overviewDirty || daysDirty;

  // Warn before closing the tab / reloading with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setO = <K extends keyof DraftOverview>(
    key: K,
    value: DraftOverview[K],
  ) => setOverview((o) => ({ ...o, [key]: value }));

  function move(index: number, dir: -1 | 1) {
    setDays((ds) => {
      const next = [...ds];
      const [d] = next.splice(index, 1);
      next.splice(index + dir, 0, d!);
      return next;
    });
  }

  function saveDayFromDialog(day: DraftDay) {
    setDays((ds) => {
      const i = ds.findIndex((d) => d.key === day.key);
      return i === -1
        ? [...ds, day]
        : ds.map((d) => (d.key === day.key ? day : d));
    });
    setEditing(null);
  }

  function discard() {
    setOverview(overviewFrom(base));
    setDays(daysFrom(base));
    setSaveError(null);
    setNameError(undefined);
  }

  async function save() {
    if (!overview.name.trim()) {
      setNameError("Name is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    let current = base;
    try {
      if (overviewDirty) {
        const res = await update.mutateAsync({
          itineraryId: base.id,
          data: overviewToInput(overview),
        });
        current = { ...current, ...res.data };
        setBase(current); // keep the overview saved even if the days step fails
      }
      if (daysDirty) {
        const res = await saveDays.mutateAsync({
          itineraryId: base.id,
          days: daysToInput(days),
        });
        current = res.data;
        setBase(current);
        setDays(daysFrom(current)); // new days now have real ids
      }
      setOverview(overviewFrom(current));
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Couldn't save the itinerary.",
      );
    } finally {
      setSaving(false);
    }
  }

  const totals = Object.entries(servicesTotal(days));

  return (
    <div className={dirty ? "pb-24" : ""}>
      {backLink}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {overview.name.trim() || "Untitled itinerary"}
          </h1>
          <StatusBadge status={overview.status} />
        </div>
        <p className="text-sm text-ink-soft">
          {[formatLength(days.length), overview.destinations.join(" · ")]
            .filter(Boolean)
            .join(" · ")}
          {totals.length > 0 && (
            <>
              {" · "}Services{" "}
              <span className="font-semibold text-ink">
                {totals
                  .map(([cur, amt]) => formatPrice(String(amt), cur))
                  .join(" + ")}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Days */}
        <section aria-labelledby="days-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="days-heading" className="text-lg font-bold text-ink">
              Days
            </h2>
            {days.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setEditing({ day: newDay(), index: days.length })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
              >
                <Plus size={15} /> Add day
              </button>
            )}
          </div>

          {days.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
              <p className="font-semibold text-ink">No days yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Add Day 1: where the guests arrive, what they do and where they
                sleep.
              </p>
              <button
                type="button"
                onClick={() => setEditing({ day: newDay(), index: 0 })}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Add day 1
              </button>
            </div>
          ) : (
            <>
              <ol className="space-y-3">
                {days.map((d, i) => (
                  <DayCard
                    key={d.key}
                    day={d}
                    number={i + 1}
                    isFirst={i === 0}
                    isLast={i === days.length - 1}
                    onEdit={() => setEditing({ day: d, index: i })}
                    onMove={(dir) => move(i, dir)}
                    onDelete={() =>
                      setDays((ds) => ds.filter((x) => x.key !== d.key))
                    }
                  />
                ))}
              </ol>
              <button
                type="button"
                onClick={() =>
                  setEditing({ day: newDay(), index: days.length })
                }
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-semibold text-ink-soft transition-colors hover:border-lagoon-deep hover:bg-lagoon-tint hover:text-lagoon-deep"
              >
                <Plus size={15} /> Add day {days.length + 1}
              </button>
            </>
          )}
        </section>

        {/* Overview */}
        <aside
          aria-labelledby="overview-heading"
          className="h-fit space-y-5 rounded-2xl border border-line bg-white p-5 xl:sticky xl:top-20"
        >
          <h2 id="overview-heading" className="text-lg font-bold text-ink">
            Overview
          </h2>

          <Field label="Name" htmlFor="ov-name" required error={nameError}>
            <input
              id="ov-name"
              value={overview.name}
              onChange={(e) => {
                setO("name", e.target.value);
                if (nameError) setNameError(undefined);
              }}
              aria-invalid={!!nameError}
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <StatusToggle
              value={overview.status}
              onChange={(s) => setO("status", s)}
            />
          </Field>

          <Field label="Category" htmlFor="ov-category">
            <ChipPicker
              label="Common categories"
              options={ITINERARY_CATEGORIES}
              value={overview.category}
              onPick={(c) => setO("category", overview.category === c ? "" : c)}
            />
            <input
              id="ov-category"
              value={overview.category}
              onChange={(e) => setO("category", e.target.value)}
              placeholder="Or type your own"
              className={`${inputCls} mt-2`}
            />
          </Field>

          <Field label="Destinations" htmlFor="ov-destinations">
            <TagInput
              id="ov-destinations"
              value={overview.destinations}
              onChange={(v) => setO("destinations", v)}
              suggestions={DESTINATIONS}
              capitalize
            />
          </Field>

          <Field label="Description" htmlFor="ov-description">
            <textarea
              id="ov-description"
              value={overview.description}
              onChange={(e) => setO("description", e.target.value)}
              rows={4}
              placeholder="A short summary guests will read first"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>

          <Field label="Included" htmlFor="ov-inclusions">
            <TagInput
              id="ov-inclusions"
              value={overview.inclusions}
              onChange={(v) => setO("inclusions", v)}
              suggestions={INCLUSIONS}
            />
          </Field>

          <Field label="Not included" htmlFor="ov-exclusions">
            <TagInput
              id="ov-exclusions"
              value={overview.exclusions}
              onChange={(v) => setO("exclusions", v)}
              suggestions={EXCLUSIONS}
            />
          </Field>

          <Field
            label="Cover image URL"
            htmlFor="ov-cover"
            hint="Paste a link to an image for now."
          >
            <input
              id="ov-cover"
              type="url"
              value={overview.coverImageUrl}
              onChange={(e) => setO("coverImageUrl", e.target.value)}
              placeholder="https://"
              className={inputCls}
            />
          </Field>
        </aside>
      </div>

      <DayFormDialog
        open={!!editing}
        dayNumber={(editing?.index ?? 0) + 1}
        initial={editing?.day ?? null}
        onClose={() => setEditing(null)}
        onSave={saveDayFromDialog}
      />

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
                  "You have unsaved changes."
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
                  {saving ? "Saving..." : "Save itinerary"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
