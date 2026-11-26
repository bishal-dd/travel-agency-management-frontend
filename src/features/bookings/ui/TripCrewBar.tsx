"use client";

import { useEffect, useMemo, useState } from "react";
import { Bus, Check, ChevronDown, Compass } from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import type { DraftLine } from "./dayPlanState";
import type { PlanPickers } from "./DayPlan";
import { CrewChoice, detectCrew, crewApplied, applyCrew } from "./tripCrew";

type DayWithLines = { key: string; lines: DraftLine[] };

function Picker({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1 sm:max-w-56">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} h-10 appearance-none pr-9`}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
        />
      </div>
    </div>
  );
}

/** Day 1, 2, 3… toggles: which days get this guide / vehicle. */
function DayChips({
  label,
  days,
  chosen,
  disabled,
  onChange,
}: {
  label: string;
  days: DayWithLines[];
  chosen: Set<string>;
  disabled: boolean;
  onChange: (next: Set<string>) => void;
}) {
  const all = days.every((d) => chosen.has(d.key));
  const toggle = (key: string) => {
    const next = new Set(chosen);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold text-ink-soft">On days</p>
      <div
        role="group"
        aria-label={`${label}: days`}
        className="flex flex-wrap items-center gap-1"
      >
        {days.map((d, i) => {
          const on = chosen.has(d.key);
          return (
            <button
              key={d.key}
              type="button"
              disabled={disabled}
              aria-pressed={on}
              aria-label={`Day ${i + 1}`}
              onClick={() => toggle(d.key)}
              className={`grid size-8 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors disabled:opacity-40 ${
                on
                  ? "bg-ink text-white"
                  : "bg-white text-ink-soft ring-1 ring-inset ring-line hover:text-ink"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
        {days.length > 1 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onChange(all ? new Set() : new Set(days.map((d) => d.key)))
            }
            className="ml-1 text-xs font-semibold text-lagoon-deep hover:underline disabled:opacity-40"
          >
            {all ? "None" : "All"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Set the guide and vehicle for the whole trip once, instead of on every day.
 * "Apply" fills the day plans below (still per day: untick trek days, or
 * change a single day afterwards). Changes are saved with "Save booking".
 */
export function TripCrewBar<D extends DayWithLines>({
  days,
  pickers,
  onApply,
}: {
  days: D[];
  pickers: PlanPickers;
  onApply: (days: D[]) => void;
}) {
  const dayKeys = days.map((d) => d.key).join("|");
  const [guide, setGuide] = useState<CrewChoice>(() =>
    detectCrew(days, "guide"),
  );
  const [vehicle, setVehicle] = useState<CrewChoice>(() =>
    detectCrew(days, "vehicle"),
  );
  /** What "whole trip" meant before this change, so Apply can swap it out. */
  const [previous, setPrevious] = useState(() => ({
    guide: guide.id,
    vehicle: vehicle.id,
  }));

  // New or reloaded days (added, reordered, saved): read the plan again.
  useEffect(() => {
    const g = detectCrew(days, "guide");
    const v = detectCrew(days, "vehicle");
    setGuide(g);
    setVehicle(v);
    setPrevious({ guide: g.id, vehicle: v.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKeys]);

  const guides = useMemo(
    () =>
      guide.id && !pickers.guides.some((g) => g.id === guide.id)
        ? [{ id: guide.id, name: "Saved guide" }, ...pickers.guides]
        : pickers.guides,
    [pickers.guides, guide.id],
  );
  const vehicles = pickers.vehicles;

  const pending =
    !crewApplied(days, "guide", guide) ||
    !crewApplied(days, "vehicle", vehicle);
  const nothingChosen = !guide.id && !vehicle.id;

  function apply() {
    let next = days;
    if (guide.id || previous.guide)
      next = applyCrew(next, "guide", guide, previous.guide);
    if (vehicle.id || previous.vehicle)
      next = applyCrew(next, "vehicle", vehicle, previous.vehicle);
    setPrevious({ guide: guide.id, vehicle: vehicle.id });
    onApply(next);
  }

  return (
    <section
      aria-labelledby="trip-crew-h"
      className="mb-4 rounded-2xl border border-line bg-white p-4 sm:p-5"
    >
      <div className="mb-3">
        <h3 id="trip-crew-h" className="font-semibold text-ink">
          Guide and vehicle for the whole trip
        </h3>
        <p className="text-sm text-ink-soft">
          Choose once and apply to the days below. Untick days they aren&apos;t
          needed, like trek days.
        </p>
      </div>

      <div className="space-y-4">
        {/* Guide */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <span
            className="hidden size-10 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-lagoon-deep sm:grid"
            aria-hidden="true"
          >
            <Compass size={16} />
          </span>
          <Picker
            id="crew-guide"
            label="Guide"
            value={guide.id}
            onChange={(id) => setGuide((g) => ({ ...g, id }))}
          >
            <option value="">No guide</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Picker>
          {/* Lines the day buttons up with the vehicle row (which has a driver box). */}
          <div
            className="hidden min-w-0 flex-1 sm:block sm:max-w-56"
            aria-hidden="true"
          />
          <DayChips
            label="Guide"
            days={days}
            chosen={guide.days}
            disabled={!guide.id}
            onChange={(d) => setGuide((g) => ({ ...g, days: d }))}
          />
        </div>

        {/* Vehicle + driver */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <span
            className="hidden size-10 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-lagoon-deep sm:grid"
            aria-hidden="true"
          >
            <Bus size={16} />
          </span>
          <Picker
            id="crew-vehicle"
            label="Vehicle"
            value={vehicle.id}
            onChange={(id) => {
              // Use the vehicle's usual driver, like on a day.
              const usual = vehicles.find((x) => x.id === id)?.driverId ?? "";
              setVehicle((v) => ({
                ...v,
                id,
                driverId: id ? usual || v.driverId : "",
              }));
            }}
          >
            <option value="">No vehicle</option>
            {vehicle.id && !vehicles.some((v) => v.id === vehicle.id) && (
              <option value={vehicle.id}>Saved vehicle</option>
            )}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.registrationNumber ? ` (${v.registrationNumber})` : ""}
              </option>
            ))}
          </Picker>
          <Picker
            id="crew-driver"
            label="Driver"
            value={vehicle.driverId}
            onChange={(driverId) => setVehicle((v) => ({ ...v, driverId }))}
          >
            <option value="">No driver</option>
            {vehicle.driverId &&
              !pickers.drivers.some((d) => d.id === vehicle.driverId) && (
                <option value={vehicle.driverId}>Saved driver</option>
              )}
            {pickers.drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Picker>
          <DayChips
            label="Vehicle"
            days={days}
            chosen={vehicle.days}
            disabled={!vehicle.id}
            onChange={(d) => setVehicle((v) => ({ ...v, days: d }))}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <button
          type="button"
          onClick={apply}
          disabled={
            !pending || (nothingChosen && !previous.guide && !previous.vehicle)
          }
          className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-lagoon-deep disabled:opacity-40"
        >
          Apply to days
        </button>
        {pending ? (
          <p className="text-xs text-ink-soft">
            Not applied yet. Then save the booking.
          </p>
        ) : (
          !nothingChosen && (
            <p className="inline-flex items-center gap-1 text-xs text-emerald-700">
              <Check size={13} aria-hidden="true" /> The days below match
            </p>
          )
        )}
      </div>
    </section>
  );
}
