import type {
  CreateCustomerInput,
  CustomerResponse,
  CustomersResponse,
  GetCustomersParams,
  UpdateCustomerInput,
} from "../types/customer";

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

// GET /customers
export async function getCustomers(
  params: GetCustomersParams = {},
): Promise<CustomersResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/customers?${query.toString()}`, {
    credentials: "include",
  });

  return handleResponse<CustomersResponse>(res);
}

// GET /customers/:customerId
export async function getCustomerById(
  customerId: string,
): Promise<CustomerResponse> {
  const res = await fetch(`${BACKEND_URL}/customers/${customerId}`, {
    credentials: "include",
  });

  return handleResponse<CustomerResponse>(res);
}

// POST /customers
export async function createCustomer(
  data: CreateCustomerInput,
): Promise<CustomerResponse> {
  const res = await fetch(`${BACKEND_URL}/customers`, {
    method: "POST",
    headers: json,
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<CustomerResponse>(res);
}

// PATCH /customers/:customerId
export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerInput,
): Promise<CustomerResponse> {
  const res = await fetch(`${BACKEND_URL}/customers/${customerId}`, {
    method: "PATCH",
    headers: json,
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<CustomerResponse>(res);
}

// DELETE /customers/:customerId
export async function deleteCustomer(
  customerId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BACKEND_URL}/customers/${customerId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<{ message: string }>(res);
}
