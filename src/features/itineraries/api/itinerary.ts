import type {
  CreateItineraryInput,
  GetItinerariesParams,
  ItinerariesResponse,
  ItineraryDayInput,
  ItineraryDetailResponse,
  ItineraryResponse,
  UpdateItineraryInput,
} from "../types/itinerary";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  const result = await res.json().catch(() => null);

  if (!res.ok) {
    // The backend sends { message, errors: ZodIssue[] } for 400s; show the first issue too.
    const detail = result?.errors?.[0]?.message;
    const message = result?.message || "Something went wrong";
    throw new Error(detail ? `${message}: ${detail}` : message);
  }

  return result as T;
}

const json = { "Content-Type": "application/json" };

// GET /itineraries
export async function getItineraries(
  params: GetItinerariesParams = {},
): Promise<ItinerariesResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/itineraries?${query.toString()}`, {
    credentials: "include",
  });

  return handleResponse<ItinerariesResponse>(res);
}

// GET /itineraries/:itineraryId  (with days + services)
export async function getItineraryById(
  itineraryId: string,
): Promise<ItineraryDetailResponse> {
  const res = await fetch(`${BACKEND_URL}/itineraries/${itineraryId}`, {
    credentials: "include",
  });

  return handleResponse<ItineraryDetailResponse>(res);
}

// POST /itineraries
export async function createItinerary(
  data: CreateItineraryInput,
): Promise<ItineraryResponse> {
  const res = await fetch(`${BACKEND_URL}/itineraries`, {
    method: "POST",
    headers: json,
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<ItineraryResponse>(res);
}

// PATCH /itineraries/:itineraryId
export async function updateItinerary(
  itineraryId: string,
  data: UpdateItineraryInput,
): Promise<ItineraryResponse> {
  const res = await fetch(`${BACKEND_URL}/itineraries/${itineraryId}`, {
    method: "PATCH",
    headers: json,
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<ItineraryResponse>(res);
}

// PUT /itineraries/:itineraryId/days  (complete ordered list)
export async function saveItineraryDays(
  itineraryId: string,
  days: ItineraryDayInput[],
): Promise<ItineraryDetailResponse> {
  const res = await fetch(`${BACKEND_URL}/itineraries/${itineraryId}/days`, {
    method: "PUT",
    headers: json,
    credentials: "include",
    body: JSON.stringify({ days }),
  });

  return handleResponse<ItineraryDetailResponse>(res);
}

// POST /itineraries/:itineraryId/duplicate
export async function duplicateItinerary(
  itineraryId: string,
): Promise<ItineraryDetailResponse> {
  const res = await fetch(
    `${BACKEND_URL}/itineraries/${itineraryId}/duplicate`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  return handleResponse<ItineraryDetailResponse>(res);
}

// DELETE /itineraries/:itineraryId
export async function deleteItinerary(
  itineraryId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BACKEND_URL}/itineraries/${itineraryId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res);
}
