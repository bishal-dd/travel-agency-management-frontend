import type {
  BookingDayInput,
  BookingItemInput,
  HotelsFromDaysResponse,
  LastPriceParams,
  LastPriceResponse,
  BookingDetailResponse,
  BookingsResponse,
  BookingStatus,
  CreateBookingInput,
  GetBookingsParams,
  TravellerInput,
  UpdateBookingInput,
} from "../types/booking";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  const result = await res.json().catch(() => null);

  if (!res.ok) {
    // 400s carry { message, errors: ZodIssue[] }; 409s carry a readable message.
    const detail = result?.errors?.[0]?.message;
    const message = result?.message || "Something went wrong";
    throw new Error(detail ? `${message}: ${detail}` : message);
  }

  return result as T;
}

const json = { "Content-Type": "application/json" };

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : json,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

// GET /bookings
export function getBookings(
  params: GetBookingsParams = {},
): Promise<BookingsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.departFrom) query.set("departFrom", params.departFrom);
  if (params.departTo) query.set("departTo", params.departTo);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  return send<BookingsResponse>("GET", `/bookings?${query.toString()}`);
}

// GET /bookings/:bookingId
export const getBookingById = (bookingId: string) =>
  send<BookingDetailResponse>("GET", `/bookings/${bookingId}`);

// POST /bookings
export const createBooking = (data: CreateBookingInput) =>
  send<BookingDetailResponse>("POST", "/bookings", data);

// PATCH /bookings/:bookingId
export const updateBooking = (bookingId: string, data: UpdateBookingInput) =>
  send<BookingDetailResponse>("PATCH", `/bookings/${bookingId}`, data);

// POST /bookings/:bookingId/status
export const changeBookingStatus = (bookingId: string, status: BookingStatus) =>
  send<BookingDetailResponse>("POST", `/bookings/${bookingId}/status`, {
    status,
  });

// PUT /bookings/:bookingId/travellers
export const saveBookingTravellers = (
  bookingId: string,
  travellers: TravellerInput[],
) =>
  send<BookingDetailResponse>("PUT", `/bookings/${bookingId}/travellers`, {
    travellers,
  });

// PUT /bookings/:bookingId/days
export const saveBookingDays = (bookingId: string, days: BookingDayInput[]) =>
  send<BookingDetailResponse>("PUT", `/bookings/${bookingId}/days`, { days });

// DELETE /bookings/:bookingId
export const deleteBooking = (bookingId: string) =>
  send<{ message: string }>("DELETE", `/bookings/${bookingId}`);

// ---------- Items ----------

// POST /bookings/:bookingId/items
export const createBookingItem = (bookingId: string, item: BookingItemInput) =>
  send<BookingDetailResponse>("POST", `/bookings/${bookingId}/items`, item);

// PUT /bookings/:bookingId/items/:itemId
export const updateBookingItem = (
  bookingId: string,
  itemId: string,
  item: BookingItemInput,
) =>
  send<BookingDetailResponse>(
    "PUT",
    `/bookings/${bookingId}/items/${itemId}`,
    item,
  );

// DELETE /bookings/:bookingId/items/:itemId
export const deleteBookingItem = (bookingId: string, itemId: string) =>
  send<BookingDetailResponse>(
    "DELETE",
    `/bookings/${bookingId}/items/${itemId}`,
  );

// POST /bookings/:bookingId/items/hotels-from-days
export const addHotelsFromDays = (bookingId: string) =>
  send<HotelsFromDaysResponse>(
    "POST",
    `/bookings/${bookingId}/items/hotels-from-days`,
  );

// GET /booking-items/last-price
export function getLastPrice(
  params: LastPriceParams,
): Promise<LastPriceResponse> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) query.set(k, v);
  return send<LastPriceResponse>(
    "GET",
    `/booking-items/last-price?${query.toString()}`,
  );
}
