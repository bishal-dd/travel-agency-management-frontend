import {
  DriversResponse,
  DriverResponse,
  CreateDriverInput,
  UpdateDriverInput,
} from "../types/driver";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface GetDriversParams {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }

  return res.json();
}

export async function getDrivers(
  params: GetDriversParams = {},
): Promise<DriversResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/drivers?${query.toString()}`, {
    credentials: "include",
  });

  return handleResponse<DriversResponse>(res);
}

export async function getDriverById(driverId: string): Promise<DriverResponse> {
  const res = await fetch(`${BACKEND_URL}/drivers/${driverId}`, {
    credentials: "include",
  });

  return handleResponse<DriverResponse>(res);
}

export async function createDriver(
  input: CreateDriverInput,
): Promise<DriverResponse> {
  const res = await fetch(`${BACKEND_URL}/drivers`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<DriverResponse>(res);
}

export async function updateDriver(
  driverId: string,
  input: UpdateDriverInput,
): Promise<DriverResponse> {
  const res = await fetch(`${BACKEND_URL}/drivers/${driverId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<DriverResponse>(res);
}

export async function deleteDriver(driverId: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/drivers/${driverId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to delete driver");
  }
}
