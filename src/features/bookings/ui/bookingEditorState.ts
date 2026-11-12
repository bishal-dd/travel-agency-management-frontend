import {
  type DraftLine,
  lineProblem,
  lineToInput,
  linesFromDay,
} from "./dayPlanState";
import type {
  BookingDayInput,
  BookingDetail,
  TravellerInput,
} from "../types/booking";
import { DraftDay } from "../../itineraries/utils/editorState";

/** Travellers and days are edited in memory and sent with one Save. */

export type DraftTraveller = {
  key: string;
  name: string;
  nationality: string;
  dateOfBirth: string; // "" or YYYY-MM-DD
  passportOrCid: string;
  isLead: boolean;
};

let seq = 0;
const tempKey = (prefix: string) => `${prefix}-${Date.now()}-${++seq}`;

export function travellersFrom(b: BookingDetail): DraftTraveller[] {
  return b.travellers.map((t) => ({
    key: t.id,
    name: t.name,
    nationality: t.nationality ?? "",
    dateOfBirth: t.dateOfBirth ?? "",
    passportOrCid: t.passportOrCid ?? "",
    isLead: t.isLead,
  }));
}

export function newTraveller(isLead: boolean): DraftTraveller {
  return {
    key: tempKey("t"),
    name: "",
    nationality: "",
    dateOfBirth: "",
    passportOrCid: "",
    isLead,
  };
}

/**
 * Booking days reuse the itinerary editor's day shape, plus what's used on
 * the day (hotel, vehicle, guide, services, other) — each priced from its rate.
 */
export type BookingDraftDay = DraftDay & { lines: DraftLine[] };

export function daysFrom(b: BookingDetail): BookingDraftDay[] {
  return b.days.map((d) => ({
    key: d.id,
    title: d.title,
    description: d.description ?? "",
    destination: d.destination ?? "",
    activities: d.activities,
    meals: d.meals,
    overnightLocation: d.overnightLocation ?? "",
    suggestedHotel: d.suggestedHotel,
    services: [],
    lines: linesFromDay(d),
  }));
}

const textOrNull = (v: string) => v.trim() || null;

export function travellersToInput(ts: DraftTraveller[]): TravellerInput[] {
  return ts.map((t) => ({
    name: t.name.trim(),
    nationality: textOrNull(t.nationality),
    dateOfBirth: t.dateOfBirth || null,
    passportOrCid: textOrNull(t.passportOrCid),
    isLead: t.isLead,
  }));
}

export function daysToInput(days: BookingDraftDay[]): BookingDayInput[] {
  return days.map((d) => ({
    title: d.title.trim(),
    description: textOrNull(d.description),
    destination: textOrNull(d.destination),
    activities: d.activities,
    meals: d.meals,
    overnightLocation: textOrNull(d.overnightLocation),
    suggestedHotelId: d.suggestedHotel?.id ?? null,
    lines: d.lines.map(lineToInput),
  }));
}

export const sameTravellers = (a: DraftTraveller[], b: DraftTraveller[]) =>
  JSON.stringify(travellersToInput(a)) === JSON.stringify(travellersToInput(b));

/** The first thing stopping the days from saving, e.g. "Day 2: Choose a vehicle". */
export function daysProblem(days: BookingDraftDay[]): string | null {
  for (const [i, d] of days.entries()) {
    for (const l of d.lines) {
      const problem = lineProblem(l);
      if (problem) return `Day ${i + 1}: ${problem}.`;
    }
  }
  return null;
}

export const sameDays = (a: BookingDraftDay[], b: BookingDraftDay[]) =>
  JSON.stringify(daysToInput(a)) === JSON.stringify(daysToInput(b));
