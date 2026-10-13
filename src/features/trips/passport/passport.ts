import { IsoDate, PassportStatus, Trip, TripStatus } from "./types";

/** Many countries require a passport to be valid 6 months beyond the stay. */
export const PASSPORT_VALIDITY_MONTHS = 6;

function addMonths(date: IsoDate, months: number): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Passport validity judged against the trip's return date. */
export function passportStatus(
  expiryDate: IsoDate,
  tripEndDate: IsoDate,
): PassportStatus {
  if (expiryDate < tripEndDate) return "expires-before-return";
  if (expiryDate < addMonths(tripEndDate, PASSPORT_VALIDITY_MONTHS))
    return "short-validity";
  return "valid";
}

export const passportStatusLabel: Record<PassportStatus, string> = {
  valid: "Valid",
  "short-validity": `Under ${PASSPORT_VALIDITY_MONTHS} months after return`,
  "expires-before-return": "Expires before return",
};

export function passportIssueCount(trip: Trip) {
  return trip.travellers.filter(
    (t) => passportStatus(t.passport.expiryDate, trip.endDate) !== "valid",
  ).length;
}

/** "•••• 4821": never show a full passport number by default. */
export function maskPassportNumber(value: string) {
  return value.length <= 4 ? "••••" : `•••• ${value.slice(-4)}`;
}

export const tripStatusLabel: Record<TripStatus, string> = {
  planning: "Planning",
  confirmed: "Confirmed",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatIsoDate(value: IsoDate) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function formatDateRange(start: IsoDate, end: IsoDate) {
  return `${formatIsoDate(start)} – ${formatIsoDate(end)}`;
}

export function tripLengthInDays(start: IsoDate, end: IsoDate) {
  const ms =
    new Date(`${end}T00:00:00Z`).getTime() -
    new Date(`${start}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000) + 1;
}
