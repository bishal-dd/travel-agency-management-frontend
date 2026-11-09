import { DraftDay } from "../../itineraries/utils/editorState";
import type {
  BookingDayInput,
  BookingDetail,
  TravellerInput,
} from "../types/booking";

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

/** Booking days reuse the itinerary editor's day shape (with no services). */
export function daysFrom(b: BookingDetail): DraftDay[] {
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

export function daysToInput(days: DraftDay[]): BookingDayInput[] {
  return days.map((d) => ({
    title: d.title.trim(),
    description: textOrNull(d.description),
    destination: textOrNull(d.destination),
    activities: d.activities,
    meals: d.meals,
    overnightLocation: textOrNull(d.overnightLocation),
    suggestedHotelId: d.suggestedHotel?.id ?? null,
  }));
}

export const sameTravellers = (a: DraftTraveller[], b: DraftTraveller[]) =>
  JSON.stringify(travellersToInput(a)) === JSON.stringify(travellersToInput(b));

export const sameDays = (a: DraftDay[], b: DraftDay[]) =>
  JSON.stringify(daysToInput(a)) === JSON.stringify(daysToInput(b));
