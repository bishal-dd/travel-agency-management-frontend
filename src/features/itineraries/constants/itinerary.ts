import type { Meal } from "../types/itinerary";

/** Suggestions only; agents can type anything. Edit freely. */
export const ITINERARY_CATEGORIES = [
  "Cultural",
  "Trekking",
  "Festival",
  "Spiritual",
  "Adventure",
  "Luxury",
  "Family",
];

export const DESTINATIONS = [
  "Paro",
  "Thimphu",
  "Punakha",
  "Wangdue",
  "Phobjikha",
  "Bumthang",
  "Trongsa",
  "Haa",
];

export const INCLUSIONS = [
  "Licensed guide",
  "Private vehicle & driver",
  "Accommodation",
  "All meals",
  "Sustainable Development Fee",
  "Visa fee",
  "Entrance fees",
];

export const EXCLUSIONS = [
  "International flights",
  "Travel insurance",
  "Tips",
  "Alcoholic drinks",
  "Personal expenses",
];

export const MEALS: { value: Meal; label: string; short: string }[] = [
  { value: "breakfast", label: "Breakfast", short: "B" },
  { value: "lunch", label: "Lunch", short: "L" },
  { value: "dinner", label: "Dinner", short: "D" },
];

/** "7 days · 6 nights", "1 day", "No days yet". */
export function formatLength(days: number) {
  if (days <= 0) return "No days yet";
  if (days === 1) return "1 day";
  return `${days} days · ${days - 1} night${days - 1 === 1 ? "" : "s"}`;
}
