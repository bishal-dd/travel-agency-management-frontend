export type SearchGroupType =
  | "booking"
  | "traveller"
  | "customer"
  | "document"
  | "hotel"
  | "guide"
  | "driver"
  | "vehicle"
  | "itinerary"
  | "service";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string | null;
  bookingId?: string;
}

export interface SearchGroup {
  type: SearchGroupType;
  items: SearchItem[];
}

export const GROUP_LABEL: Record<SearchGroupType, string> = {
  booking: "Bookings",
  traveller: "Travellers",
  customer: "Customers",
  document: "Documents",
  hotel: "Hotels",
  guide: "Guides",
  driver: "Drivers",
  vehicle: "Vehicles",
  itinerary: "Itineraries",
  service: "Services",
};

const list = (page: string, q: string) =>
  `/dashboard/${page}?q=${encodeURIComponent(q)}`;

/** Where a result goes: its own page where there is one, else its list filtered to it. */
export function hrefFor(type: SearchGroupType, item: SearchItem) {
  switch (type) {
    case "booking":
      return `/dashboard/bookings/${item.id}`;
    case "traveller":
    case "document":
      return `/dashboard/bookings/${item.bookingId}`;
    case "hotel":
      return `/dashboard/hotels/${item.id}`;
    case "itinerary":
      return `/dashboard/itineraries/${item.id}`;
    case "customer":
      return list("customers", item.title);
    case "guide":
      return list("guides", item.title);
    case "driver":
      return list("drivers", item.title);
    case "vehicle":
      return list("vehicles", item.subtitle ?? item.title);
    case "service":
      return list("services", item.title);
  }
}

/** Fired when the header search opens a list page with ?q= (see useListParams). */
export const LIST_SEARCH_EVENT = "hmt:list-search";
