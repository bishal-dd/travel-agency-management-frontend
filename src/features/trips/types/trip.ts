export type TripPhase = "upcoming" | "in_country" | "completed";
export type ResourceKind = "guide" | "driver" | "vehicle";
/** "start" = guests have arrived but the booking is still confirmed; "close" = ended but not completed. */
export type StatusHint = "start" | "close" | null;
export type TripBookingStatus = "confirmed" | "in_progress" | "completed";

export interface CrewMember {
  kind: ResourceKind;
  id: string;
  name: string;
  phone: string | null;
}

export interface Logistics {
  arrivalFlight: string | null;
  arrivalTime: string | null;
  departureFlight: string | null;
  departureTime: string | null;
  pickupPoint: string | null;
  dropoffPoint: string | null;
}

export interface TripListItem extends Logistics {
  bookingId: string;
  reference: string;
  title: string;
  customerName: string;
  status: TripBookingStatus;
  startDate: string;
  endDate: string;
  pax: number;
  phase: TripPhase;
  statusHint: StatusHint;
  totalDays: number;
  currentDay: number | null;
  crew: CrewMember[];
  checklist: { done: number; total: number; overdue: number };
  clashes: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TripsListResponse {
  success: boolean;
  data: TripListItem[];
  pagination: Pagination;
}

export interface ListTripsParams {
  phase?: TripPhase;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface Clash {
  kind: ResourceKind;
  resourceId: string;
  name: string;
  from: string;
  to: string;
  bookings: { id: string; reference: string; title: string }[];
}

export interface TripNote {
  id: string;
  bookingId: string;
  dayNumber: number | null;
  body: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  dueDate: string | null;
  done: boolean;
  doneAt: string | null;
  doneBy: string | null;
  overdue: boolean;
}

export interface TripDay {
  dayNumber: number;
  date: string;
  title: string;
  destination: string | null;
  overnightLocation: string | null;
  activities: string[];
  meals: string[];
  isToday: boolean;
  crew: (CrewMember & { clash: boolean })[];
  hotels: { description: string; rooms: number; notes: string | null }[];
  services: { description: string; quantity: number; notes: string | null }[];
  notes: TripNote[];
}

export interface TripTraveller {
  id: string;
  name: string;
  nationality: string | null;
  dateOfBirth: string | null;
  passportOrCid: string | null;
  isLead: boolean;
}

export interface TripDetail extends Logistics {
  bookingId: string;
  reference: string;
  title: string;
  status: TripBookingStatus;
  phase: TripPhase;
  statusHint: StatusHint;
  startDate: string;
  endDate: string;
  totalDays: number;
  currentDay: number | null;
  pax: { adults: number; children: number };
  customer: { name: string; phone: string | null; email: string | null };
  bookingNotes: string | null;
  travellers: TripTraveller[];
  days: TripDay[];
  crew: CrewMember[];
  clashes: Clash[];
  checklist: ChecklistItem[];
  notes: TripNote[];
  extras: { type: string; description: string; date: string }[];
}

export interface BoardCard extends Logistics {
  bookingId: string;
  reference: string;
  title: string;
  customerName: string;
  status: TripBookingStatus;
  statusHint: StatusHint;
  pax: number;
  startDate: string;
  endDate: string;
  dayNumber: number;
  totalDays: number;
  day: {
    title: string;
    destination: string | null;
    overnightLocation: string | null;
  };
  hotels: string[];
  crew: CrewMember[];
}

export interface Board {
  date: string;
  arrivals: BoardCard[];
  departures: BoardCard[];
  inCountry: BoardCard[];
  dueSoon: {
    id: string;
    bookingId: string;
    reference: string;
    title: string;
    label: string;
    dueDate: string;
    overdue: boolean;
  }[];
  clashes: Clash[];
}

export interface ChecklistTemplateItem {
  label: string;
  /** Due this many days before the trip starts; null = no deadline. */
  daysBefore: number | null;
}

export interface TripSettings {
  checklist: ChecklistTemplateItem[];
  isDefault: boolean;
}

export interface Availability {
  type: ResourceKind;
  from: string;
  to: string;
  resources: {
    id: string;
    name: string;
    phone: string | null;
    free: boolean;
    busy: {
      bookingId: string;
      reference: string;
      title: string;
      tentative: boolean;
      from: string;
      to: string;
    }[];
  }[];
}

export type UpdateLogisticsInput = Partial<Logistics>;
