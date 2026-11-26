import { type DraftLine, newLine } from "./dayPlanState";

/**
 * "Whole trip" guide and vehicle: set once, applied to the chosen days.
 * The plan is still saved per day (prices, clashes and guides' My trips use it);
 * this only fills those day lines in.
 */

type DayWithLines = { key: string; lines: DraftLine[] };

export type CrewKind = "guide" | "vehicle";

export interface CrewChoice {
  /** guideId or vehicleId; "" = not set. */
  id: string;
  /** Vehicles only. */
  driverId: string;
  /** Day keys that should have it. */
  days: Set<string>;
}

const resourceOf = (l: DraftLine, kind: CrewKind) =>
  kind === "guide" ? l.guideId : l.vehicleId;

/**
 * What the trip already uses: the guide / vehicle on the most days, and which
 * days have it. Empty when none is set yet (all days ticked by default).
 */
export function detectCrew(days: DayWithLines[], kind: CrewKind): CrewChoice {
  const count = new Map<string, number>();
  for (const d of days)
    for (const id of new Set(
      d.lines
        .filter((l) => l.type === kind)
        .map((l) => resourceOf(l, kind))
        .filter(Boolean),
    ))
      count.set(id, (count.get(id) ?? 0) + 1);
  const top = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  if (!top)
    return { id: "", driverId: "", days: new Set(days.map((d) => d.key)) };
  const withIt = days.filter((d) =>
    d.lines.some((l) => l.type === kind && resourceOf(l, kind) === top),
  );
  const driver =
    kind === "vehicle"
      ? (withIt
          .flatMap((d) => d.lines)
          .find((l) => l.type === "vehicle" && l.vehicleId === top)?.driverId ??
        "")
      : "";
  return { id: top, driverId: driver, days: new Set(withIt.map((d) => d.key)) };
}

/**
 * Gives the chosen days this guide / vehicle and takes it off the others.
 * - A ticked day with the previous whole-trip choice (or the same one) gets it
 *   updated in place, keeping quantity and any special price.
 * - A ticked day without one gets a new line at the normal rate.
 * - An unticked day loses the whole-trip guide / vehicle.
 * - Anything else on a day (another guide, a second vehicle) isn't touched.
 */
export function applyCrew<D extends DayWithLines>(
  days: D[],
  kind: CrewKind,
  next: CrewChoice,
  previousId: string,
): D[] {
  const matches = (l: DraftLine) =>
    l.type === kind &&
    !!resourceOf(l, kind) &&
    (resourceOf(l, kind) === previousId || resourceOf(l, kind) === next.id);
  const patch: Partial<DraftLine> =
    kind === "guide"
      ? { guideId: next.id }
      : { vehicleId: next.id, driverId: next.driverId };

  return days.map((d) => {
    const wanted = next.id !== "" && next.days.has(d.key);
    const existing = d.lines.find(matches);
    let lines: DraftLine[];
    if (wanted && existing) {
      // Update the first, drop duplicates of it on the same day.
      lines = d.lines
        .filter((l) => l === existing || !matches(l))
        .map((l) => {
          if (l !== existing) return l;
          const same = (Object.keys(patch) as (keyof DraftLine)[]).every(
            (k) => l[k] === patch[k],
          );
          return same ? l : { ...l, ...patch };
        });
    } else if (wanted) {
      lines = [...d.lines, newLine(kind, patch)];
    } else {
      lines = d.lines.filter((l) => !matches(l));
    }
    const changed =
      lines.length !== d.lines.length || lines.some((l, i) => l !== d.lines[i]);
    return changed ? { ...d, lines } : d;
  });
}

/** Does every chosen day already match? (Then "Apply" has nothing to do.) */
export function crewApplied(
  days: DayWithLines[],
  kind: CrewKind,
  choice: CrewChoice,
) {
  if (!choice.id) return true;
  return days.every((d) => {
    const has = d.lines.some(
      (l) =>
        l.type === kind &&
        resourceOf(l, kind) === choice.id &&
        (kind === "guide" || l.driverId === choice.driverId),
    );
    return choice.days.has(d.key) ? has : !has;
  });
}
