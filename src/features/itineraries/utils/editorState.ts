import type {
  ItineraryDetail,
  ItineraryDayInput,
  ItineraryHotelSummary,
  ItineraryServiceSummary,
  ItineraryStatus,
  Meal,
  UpdateItineraryInput,
} from "../types/itinerary";

/**
 * The editor keeps everything in memory and sends it with one Save:
 * PATCH for the overview (if changed) and PUT for the days (if changed).
 */

export type DraftOverview = {
  name: string;
  description: string;
  category: string;
  destinations: string[];
  coverImageUrl: string;
  inclusions: string[];
  exclusions: string[];
  status: ItineraryStatus;
};

export type DraftDay = {
  /** Stable React key: the saved day id, or a temporary one for new days. */
  key: string;
  title: string;
  description: string;
  destination: string;
  activities: string[];
  meals: Meal[];
  overnightLocation: string;
  suggestedHotel: ItineraryHotelSummary | null;
  services: { service: ItineraryServiceSummary; quantity: number }[];
};

export function overviewFrom(it: ItineraryDetail): DraftOverview {
  return {
    name: it.name,
    description: it.description ?? "",
    category: it.category ?? "",
    destinations: it.destinations,
    coverImageUrl: it.coverImageUrl ?? "",
    inclusions: it.inclusions,
    exclusions: it.exclusions,
    status: it.status,
  };
}

export function daysFrom(it: ItineraryDetail): DraftDay[] {
  return it.days.map((d) => ({
    key: d.id,
    title: d.title,
    description: d.description ?? "",
    destination: d.destination ?? "",
    activities: d.activities,
    meals: d.meals,
    overnightLocation: d.overnightLocation ?? "",
    suggestedHotel: d.suggestedHotel,
    services: d.services.map((s) => ({
      service: s.service,
      quantity: s.quantity,
    })),
  }));
}

let tempId = 0;
export function newDay(): DraftDay {
  tempId += 1;
  return {
    key: `new-${Date.now()}-${tempId}`,
    title: "",
    description: "",
    destination: "",
    activities: [],
    meals: [],
    overnightLocation: "",
    suggestedHotel: null,
    services: [],
  };
}

const textOrNull = (v: string) => v.trim() || null;

export function overviewToInput(o: DraftOverview): UpdateItineraryInput {
  return {
    name: o.name.trim(),
    description: textOrNull(o.description),
    category: textOrNull(o.category),
    destinations: o.destinations,
    coverImageUrl: textOrNull(o.coverImageUrl),
    inclusions: o.inclusions,
    exclusions: o.exclusions,
    status: o.status,
  };
}

export function daysToInput(days: DraftDay[]): ItineraryDayInput[] {
  return days.map((d) => ({
    title: d.title.trim(),
    description: textOrNull(d.description),
    destination: textOrNull(d.destination),
    activities: d.activities,
    meals: d.meals,
    overnightLocation: textOrNull(d.overnightLocation),
    suggestedHotelId: d.suggestedHotel?.id ?? null,
    services: d.services.map((s) => ({
      serviceId: s.service.id,
      quantity: s.quantity,
    })),
  }));
}

/** Compare what would be sent, so cosmetic differences don't count as changes. */
export const sameOverview = (a: DraftOverview, b: DraftOverview) =>
  JSON.stringify(overviewToInput(a)) === JSON.stringify(overviewToInput(b));

export const sameDays = (a: DraftDay[], b: DraftDay[]) =>
  JSON.stringify(daysToInput(a)) === JSON.stringify(daysToInput(b));

/** Services total per currency, e.g. { BTN: 4500, USD: 40 }. */
export function servicesTotal(days: DraftDay[]) {
  const totals: Record<string, number> = {};
  for (const d of days) {
    for (const { service, quantity } of d.services) {
      const amount = Number(service.price) * quantity;
      if (Number.isFinite(amount))
        totals[service.currency] = (totals[service.currency] ?? 0) + amount;
    }
  }
  return totals;
}
