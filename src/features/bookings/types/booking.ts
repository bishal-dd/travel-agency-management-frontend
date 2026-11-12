import type { Meal } from "../../itineraries/types/itinerary";

export const BOOKING_STATUSES = [
  "inquiry",
  "quoted",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingCustomerSummary {
  id: string;
  name: string;
  type: "individual" | "company";
}

/** A row in GET /bookings. */
export interface BookingListItem {
  id: string;
  reference: string;
  title: string;
  status: BookingStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  adults: number;
  children: number;
  currency: string;
  itineraryId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: BookingCustomerSummary;
  travellerCount: number;
  dayCount: number;
}

export interface BookingTraveller {
  id: string;
  bookingId: string;
  position: number;
  name: string;
  nationality: string | null;
  dateOfBirth: string | null;
  passportOrCid: string | null;
  isLead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDay {
  id: string;
  bookingId: string;
  dayNumber: number;
  date: string;
  title: string;
  description: string | null;
  destination: string | null;
  activities: string[];
  meals: Meal[];
  overnightLocation: string | null;
  suggestedHotelId: string | null;
  suggestedHotel: { id: string; name: string; city: string } | null;
  /** What's used on this day (hotel, vehicle, guide, services, other), priced. */
  lines: BookingItem[];
  totals: DayTotals;
  createdAt: string;
  updatedAt: string;
}

/** One day's price / cost / profit, in the booking currency. */
export interface DayTotals {
  price: string;
  cost: string;
  profit: string;
  itemCount: number;
  itemsWithoutCost: number;
}

/** GET /bookings/:id */
export interface BookingDetail {
  id: string;
  organizationId: string;
  reference: string;
  customerId: string;
  itineraryId: string | null;
  title: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: BookingCustomerSummary & {
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
  };
  itinerary: { id: string; name: string } | null;
  /** Statuses this booking can move to next (drives the action buttons). */
  allowedStatuses: BookingStatus[];
  travellers: BookingTraveller[];
  days: BookingDay[];
  /** Sent by the stage 2 backend (booking items); missing on older backends. */
  items?: BookingItem[];
  totals?: BookingTotals;
  /** Sent by the fees backend; missing on older backends. */
  fees?: BookingFees;
  /** null when the agency isn't GST-registered. */
  gst?: { rate: string; inclusive: boolean; amount: string } | null;
  summary?: BookingSummary;
}

// ---------- Items & pricing ----------

export const BOOKING_ITEM_TYPES = [
  "hotel",
  "vehicle",
  "guide",
  "service",
  "other",
] as const;
export type BookingItemType = (typeof BOOKING_ITEM_TYPES)[number];

/**
 * Dates by type: hotel = check-in → check-out (nights); vehicle / guide =
 * start → end inclusive (days); service / other = one day.
 * Money is always a "123.45" string in the booking's currency.
 */
export interface BookingItem {
  id: string;
  bookingId: string;
  organizationId: string;
  type: BookingItemType;
  /** The day it belongs to (1 = Day 1); null for an extra not tied to a day. */
  dayNumber: number | null;
  startDate: string;
  endDate: string;
  hotelId: string | null;
  hotelRoomId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  guideId: string | null;
  serviceId: string | null;
  description: string;
  notes: string | null;
  quantity: number;
  unitPrice: string;
  unitCost: string | null;
  /** "rate" = priced from the room / service rate; "manual" = typed. */
  priceSource?: "rate" | "manual";
  sourceCurrency?: string | null;
  sourceUnitPrice?: string | null;
  sourceUnitCost?: string | null;
  fxRate?: string | null;
  /** Nights (hotel), days (vehicle / guide) or 1. */
  units: number;
  per: "night" | "day" | "unit";
  lineTotal: string;
  lineCost: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingTotals {
  price: string;
  cost: string;
  /** Only complete when itemsWithoutCost is 0. */
  profit: string;
  itemCount: number;
  itemsWithoutCost: number;
  itemsWithoutPrice: number;
  byType: Partial<
    Record<BookingItemType, { price: string; cost: string; count: number }>
  >;
}

type ItemMoney = {
  quantity?: number;
  /** Leave out to price from the rate (room / service), converted by the server. */
  unitPrice?: string | number;
  /** Leave out to use the rate's cost; null = no cost. */
  unitCost?: string | number | null;
  /** Leave out to use the linked record's name. */
  description?: string;
  notes?: string | null;
};

export type BookingItemInput =
  | ({
      type: "hotel";
      hotelId: string;
      hotelRoomId?: string | null;
      checkIn: string;
      checkOut: string;
    } & ItemMoney)
  | ({
      type: "vehicle";
      vehicleId: string;
      driverId?: string | null;
      startDate: string;
      endDate: string;
    } & ItemMoney)
  | ({
      type: "guide";
      guideId: string;
      startDate: string;
      endDate: string;
    } & ItemMoney)
  | ({ type: "service"; serviceId: string; date: string } & ItemMoney)
  | ({ type: "other"; date: string } & ItemMoney & { description: string });

export interface LastPriceParams {
  hotelRoomId?: string;
  hotelId?: string;
  vehicleId?: string;
  guideId?: string;
  serviceId?: string;
  currency: string;
}

export interface LastPrice {
  unitPrice: string;
  unitCost: string | null;
  usedOn: string;
  bookingReference: string;
}

export interface LastPriceResponse {
  success: boolean;
  data: LastPrice | null;
}

/** GET /booking-items/default-price — what an item would cost from its rate. */
export interface DefaultPriceParams {
  bookingId: string;
  hotelRoomId?: string;
  serviceId?: string;
  vehicleId?: string;
  driverId?: string;
  guideId?: string;
}

export interface DefaultPrice {
  /** In the booking's currency; null if the rate has no price or a rate is missing. */
  unitPrice: string | null;
  unitCost: string | null;
  currency: string;
  source: {
    label: string; // e.g. "the Deluxe rate", "Tashi's rate"
    currency: string;
    unitPrice: string | null;
    unitCost: string | null;
    /** 1 source currency = fxRate booking currency (null if missing). */
    fxRate: string | null;
  };
  /** On vehicles: the driver's part of unitCost (already included in it). */
  extraCost: {
    label: string; // e.g. "Karma's daily cost"
    currency: string;
    amount: string; // in its own currency
    converted: string; // in the booking currency
  } | null;
  /** Set when the agency has no exchange rate for this currency yet. */
  missingExchangeRate: string | null;
}

export interface DefaultPriceResponse {
  success: boolean;
  data: DefaultPrice | null;
}

export interface HotelsFromDaysResponse extends BookingDetailResponse {
  added: number;
}

// ---------- Inputs ----------

export interface TravellerInput {
  name: string;
  nationality?: string | null;
  dateOfBirth?: string | null;
  passportOrCid?: string | null;
  isLead?: boolean;
}

/** Position = day number; the date follows the booking's start date. */
export interface BookingDayInput {
  title: string;
  description?: string | null;
  destination?: string | null;
  activities: string[];
  meals: Meal[];
  overnightLocation?: string | null;
  suggestedHotelId?: string | null;
  lines: DayLineInput[];
}

/**
 * One thing used on a day. Dates come from the day. Send `id` back to keep
 * the saved price; leave out unitPrice to use the rate, send it for a special price.
 */
type LineBase = {
  id?: string;
  quantity: number;
  unitPrice?: string;
  notes?: string | null;
};
export type DayLineInput =
  | (LineBase & { type: "hotel"; hotelId: string; hotelRoomId?: string | null })
  | (LineBase & {
      type: "vehicle";
      vehicleId: string;
      driverId?: string | null;
    })
  | (LineBase & { type: "guide"; guideId: string })
  | (LineBase & { type: "service"; serviceId: string })
  | (LineBase & { type: "other"; description: string; unitPrice: string });

export interface CreateBookingInput {
  customerId: string;
  itineraryId?: string;
  title?: string;
  startDate: string;
  endDate?: string;
  adults?: number;
  children?: number;
  currency?: string;
  notes?: string | null;
  customerIsTraveller?: boolean;
  travellers?: TravellerInput[];
}

export interface UpdateBookingInput {
  customerId?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  currency?: string;
  notes?: string | null;
}

export interface GetBookingsParams {
  search?: string;
  status?: BookingStatus;
  departFrom?: string;
  departTo?: string;
  sort?: "created" | "departure";
  page?: number;
  limit?: number;
}

// ---------- Responses ----------

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookingsResponse {
  success: boolean;
  data: BookingListItem[];
  pagination: Pagination;
}

export interface BookingDetailResponse {
  success: boolean;
  message?: string;
  data: BookingDetail;
}

// ---------- Government fees & GST ----------

export interface BookingFeeLine {
  kind: "sdf" | "visa";
  travellerId: string | null;
  /** "SDF · John · international rate" */
  description: string;
  /** Nights for SDF, 1 for visa. */
  quantity: number;
  /** Per night / per visa, in sourceCurrency. */
  unitAmount: string;
  sourceCurrency: string;
  /** In the booking currency; null if an exchange rate is missing. */
  amount: string | null;
  fxRate: string | null;
}

export interface BookingFees {
  /** Locked at confirmation (true) or following today's rules (false). */
  frozen: boolean;
  frozenAt: string | null;
  /** Travellers, dates or rules changed since the fees were locked. */
  changedSinceFrozen: boolean;
  nights: number;
  lines: BookingFeeLine[];
  sdf: string;
  visa: string;
  total: string;
  warnings: string[];
  missingExchangeRate: string | null;
}

/** What the customer pays, from the saved booking. */
export interface BookingSummary {
  tripPrice: string;
  gst: string;
  gstInclusive: boolean;
  governmentFees: string;
  total: string;
  tripCost: string;
  profit: string;
}
