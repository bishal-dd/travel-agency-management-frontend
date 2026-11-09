export type CustomerType = "individual" | "company";
export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  organizationId: string;
  type: CustomerType;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  notes: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  type?: CustomerType;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  notes?: string | null;
  status?: CustomerStatus;
}

/** Send only what changed; null clears an optional field. */
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface GetCustomersParams {
  search?: string;
  status?: CustomerStatus;
  type?: CustomerType;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: Pagination;
}

export interface CustomerResponse {
  success: boolean;
  message?: string;
  data: Customer;
}
