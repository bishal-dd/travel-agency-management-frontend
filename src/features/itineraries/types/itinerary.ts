export type ItineraryStatus = "active" | "inactive";
export type Meal = "breakfast" | "lunch" | "dinner";

export interface Itinerary {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: string | null;
  destinations: string[];
  coverImageUrl: string | null;
  inclusions: string[];
  exclusions: string[];
  status: ItineraryStatus;
  createdAt: string;
  updatedAt: string;
}

/** List rows also carry how many days the itinerary has. */
export interface ItineraryListItem extends Itinerary {
  dayCount: number;
}

/** The parts of a service the itinerary endpoints return. */
export interface ItineraryServiceSummary {
  id: string;
  name: string;
  category: string;
  durationMinutes: number | null;
  price: string;
  currency: string;
  status: "active" | "inactive";
}

export interface ItineraryDayService {
  id: string;
  quantity: number;
  service: ItineraryServiceSummary;
}

export interface ItineraryHotelSummary {
  id: string;
  name: string;
  city: string;
}

export interface ItineraryDay {
  id: string;
  itineraryId: string;
  dayNumber: number;
  title: string;
  description: string | null;
  destination: string | null;
  activities: string[];
  meals: Meal[];
  overnightLocation: string | null;
  suggestedHotelId: string | null;
  suggestedHotel: ItineraryHotelSummary | null;
  services: ItineraryDayService[];
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDetail extends Itinerary {
  days: ItineraryDay[];
}

// ---------- Inputs ----------

export interface CreateItineraryInput {
  name: string;
  description?: string | null;
  category?: string | null;
  destinations?: string[];
  coverImageUrl?: string | null;
  inclusions?: string[];
  exclusions?: string[];
  status?: ItineraryStatus;
}

/** Send only what changed; null clears description / category / cover image. */
export type UpdateItineraryInput = Partial<CreateItineraryInput>;

/** One day in PUT /itineraries/:id/days. Its position in the array is its day number. */
export interface ItineraryDayInput {
  title: string;
  description?: string | null;
  destination?: string | null;
  activities: string[];
  meals: Meal[];
  overnightLocation?: string | null;
  suggestedHotelId?: string | null;
  services: { serviceId: string; quantity: number }[];
}

export interface GetItinerariesParams {
  search?: string;
  status?: ItineraryStatus;
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

export interface ItinerariesResponse {
  success: boolean;
  data: ItineraryListItem[];
  pagination: Pagination;
}

export interface ItineraryResponse {
  success: boolean;
  message?: string;
  data: Itinerary;
}

export interface ItineraryDetailResponse {
  success: boolean;
  message?: string;
  data: ItineraryDetail;
}
