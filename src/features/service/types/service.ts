export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: string;
  durationMinutes: number | null;
  price: string;
  currency: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface GetServicesParams {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  category: string;
  durationMinutes?: number;
  price: string;
  currency?: string;
  status?: "active" | "inactive";
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  category?: string;
  durationMinutes?: number;
  price?: string;
  currency?: string;
  status?: "active" | "inactive";
}

export interface GetServicesParams {
  search?: string;
  page?: number;
  limit?: number;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ServicesResponse {
  success: boolean;
  data: Service[];
  pagination: Pagination;
}

export interface ServiceResponse {
  success?: boolean;
  message?: string;
  data: Service;
}
