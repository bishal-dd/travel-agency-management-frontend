import {
  VehiclesResponse,
  VehicleResponse,
  CreateVehicleInput,
  UpdateVehicleInput,
} from "../types/vehicle";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface GetVehiclesParams {
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

export async function getVehicles(
  params: GetVehiclesParams = {},
): Promise<VehiclesResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/vehicles?${query.toString()}`, {
    credentials: "include",
  });

  return handleResponse<VehiclesResponse>(res);
}

export async function getVehicleById(
  vehicleId: string,
): Promise<VehicleResponse> {
  const res = await fetch(`${BACKEND_URL}/vehicles/${vehicleId}`, {
    credentials: "include",
  });

  return handleResponse<VehicleResponse>(res);
}

export async function createVehicle(
  input: CreateVehicleInput,
): Promise<VehicleResponse> {
  const res = await fetch(`${BACKEND_URL}/vehicles`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<VehicleResponse>(res);
}

export async function updateVehicle(
  vehicleId: string,
  input: UpdateVehicleInput,
): Promise<VehicleResponse> {
  const res = await fetch(`${BACKEND_URL}/vehicles/${vehicleId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<VehicleResponse>(res);
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/vehicles/${vehicleId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to delete vehicle");
  }
}
