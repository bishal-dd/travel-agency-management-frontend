import type {
  Availability,
  Board,
  ChecklistItem,
  ChecklistTemplateItem,
  Clash,
  ListTripsParams,
  ResourceKind,
  TripDetail,
  TripNote,
  TripSettings,
  TripsListResponse,
  UpdateLogisticsInput,
} from "../types/trip";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function send<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(
      result?.message || "Something went wrong",
    ) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return result as T;
}

const qs = (params: object) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};

type Data<T> = { success: boolean; data: T; message?: string };

export const listTrips = (params: ListTripsParams = {}) =>
  send<TripsListResponse>("GET", `/trips${qs(params)}`);

export const getBoard = (date?: string) =>
  send<Data<Board>>("GET", `/trips/board${qs({ date })}`);

export const getClashes = (from?: string, to?: string) =>
  send<Data<{ from: string; to: string; clashes: Clash[] }>>(
    "GET",
    `/trips/clashes${qs({ from, to })}`,
  );

export const getTrip = (bookingId: string) =>
  send<Data<TripDetail>>("GET", `/trips/${bookingId}`);

export const updateLogistics = (
  bookingId: string,
  input: UpdateLogisticsInput,
) => send<Data<TripDetail>>("PATCH", `/trips/${bookingId}`, input);

export const addChecklistItem = (
  bookingId: string,
  input: { label: string; dueDate?: string | null },
) => send<Data<ChecklistItem>>("POST", `/trips/${bookingId}/checklist`, input);

export const updateChecklistItem = (
  bookingId: string,
  itemId: string,
  input: { label?: string; dueDate?: string | null; done?: boolean },
) =>
  send<Data<ChecklistItem>>(
    "PATCH",
    `/trips/${bookingId}/checklist/${itemId}`,
    input,
  );

export const deleteChecklistItem = (bookingId: string, itemId: string) =>
  send<{ success: boolean }>(
    "DELETE",
    `/trips/${bookingId}/checklist/${itemId}`,
  );

export const addNote = (
  bookingId: string,
  input: { body: string; dayNumber?: number | null },
) => send<Data<TripNote>>("POST", `/trips/${bookingId}/notes`, input);

export const deleteNote = (bookingId: string, noteId: string) =>
  send<{ success: boolean }>("DELETE", `/trips/${bookingId}/notes/${noteId}`);

/** Moves the booking along (Start trip / Complete trip). Same endpoint the booking page uses. */
export const changeBookingStatus = (
  bookingId: string,
  status: "in_progress" | "completed",
) => send<Data<unknown>>("POST", `/bookings/${bookingId}/status`, { status });

export const getTripSettings = () =>
  send<Data<TripSettings>>("GET", "/trip-settings");

export const updateTripSettings = (checklist: ChecklistTemplateItem[]) =>
  send<Data<TripSettings>>("PUT", "/trip-settings", { checklist });

export const getAvailability = (params: {
  type: ResourceKind;
  from: string;
  to: string;
  excludeBookingId?: string;
}) => send<Data<Availability>>("GET", `/availability${qs(params)}`);
