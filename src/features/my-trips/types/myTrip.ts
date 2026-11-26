import type {
  CrewMember,
  Logistics,
  Pagination,
  ResourceKind,
  TripPhase,
} from "../../trips/types/trip";

export type { TripPhase };

/** Someone else on the trip with you (driver, vehicle, another guide). */
export interface TeamMate {
  kind: ResourceKind;
  name: string;
  phone: string | null;
}

export interface MyTripListItem {
  bookingId: string;
  reference: string;
  title: string;
  customerName: string;
  customerPhone: string | null;
  startDate: string;
  endDate: string;
  pax: number;
  phase: TripPhase;
  totalDays: number;
  currentDay: number | null;
  /** The dates you're the guide (you may not be on every day). */
  myDates: string[];
  workingToday: boolean;
  arrivalFlight: string | null;
  arrivalTime: string | null;
  pickupPoint: string | null;
  crew: TeamMate[];
}

export interface MyTripsResponse {
  success: boolean;
  /** false = no guide profile has the signed-in email. */
  linked: boolean;
  email: string | null;
  guide: { id: string; name: string } | null;
  data: MyTripListItem[];
  pagination: Pagination;
}

export interface MyTripNote {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
}

export interface MyTripDay {
  dayNumber: number;
  date: string;
  title: string;
  destination: string | null;
  overnightLocation: string | null;
  activities: string[];
  meals: string[];
  isToday: boolean;
  /** You're the guide on this day. */
  mine: boolean;
  crew: (CrewMember & { isMe: boolean })[];
  hotels: { description: string; rooms: number; notes: string | null }[];
  services: { description: string; quantity: number; notes: string | null }[];
  notes: MyTripNote[];
}

export interface MyTraveller {
  id: string;
  name: string;
  nationality: string | null;
  passportOrCid: string | null;
  /** YYYY-MM-DD */
  dateOfBirth: string | null;
  isLead: boolean;
}

export interface MyTripDetail extends Logistics {
  bookingId: string;
  reference: string;
  title: string;
  status: string;
  phase: TripPhase;
  startDate: string;
  endDate: string;
  totalDays: number;
  currentDay: number | null;
  pax: { adults: number; children: number };
  customer: { name: string; phone: string | null };
  travellers: MyTraveller[];
  myDates: string[];
  days: MyTripDay[];
  notes: MyTripNote[];
  extras: { type: string; description: string; date: string }[];
}
