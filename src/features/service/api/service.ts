import {
  GetServicesParams,
  ServicesResponse,
  ServiceResponse,
  CreateServiceInput,
  UpdateServiceInput,
} from "../types/service";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result as T;
}

// GET /services
export async function getServices(
  params: GetServicesParams = {},
): Promise<ServicesResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/services?${query.toString()}`, {
    credentials: "include",
  });

  return handleResponse<ServicesResponse>(res);
}

// GET /services/:serviceId
export async function getServiceById(
  serviceId: string,
): Promise<ServiceResponse> {
  const res = await fetch(`${BACKEND_URL}/services/${serviceId}`, {
    credentials: "include",
  });

  return handleResponse<ServiceResponse>(res);
}

// POST /services
export async function createService(
  data: CreateServiceInput,
): Promise<ServiceResponse> {
  const res = await fetch(`${BACKEND_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<ServiceResponse>(res);
}

// PATCH /services/:serviceId
export async function updateService(
  serviceId: string,
  data: UpdateServiceInput,
): Promise<ServiceResponse> {
  const res = await fetch(`${BACKEND_URL}/services/${serviceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<ServiceResponse>(res);
}

// DELETE /services/:serviceId
export async function deleteService(
  serviceId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BACKEND_URL}/services/${serviceId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res);
}
