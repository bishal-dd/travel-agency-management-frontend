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
  createdAt: string;
  updatedAt: string;
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
  items: BookingItem[];
  totals: BookingTotals;
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
  unitPrice: string | number;
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
}

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
