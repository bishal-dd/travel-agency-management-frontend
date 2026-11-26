import type { MyTripDetail, MyTripsResponse, TripPhase } from "../types/myTrip";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, { credentials: "include" });
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(result?.message || "Something went wrong") as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return result as T;
}

export interface ListMyTripsParams {
  phase?: TripPhase;
  page?: number;
  limit?: number;
}

export function listMyTrips(params: ListMyTripsParams = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
  const s = q.toString();
  return get<MyTripsResponse>(`/my-trips${s ? `?${s}` : ""}`);
}

export const getMyTrip = (bookingId: string) => get<{ success: boolean; data: MyTripDetail }>(`/my-trips/${bookingId}`);
