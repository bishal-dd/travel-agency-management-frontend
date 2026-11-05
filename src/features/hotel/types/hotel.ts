export interface CreateHotelPayload {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  starRating?: number;
  status?: "active" | "inactive";
}

export interface Hotel {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  contactNumber: string | null;
  email: string | null;
  website: string | null;
  starRating: number | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelResponse {
  success: boolean;
  message: string;
  data: Hotel;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetHotelsResponse {
  success: boolean;
  data: Hotel[];
  pagination: Pagination;
}

export interface UpdateHotelPayload {
  name?: string;
  description?: string | null;
  address?: string;
  city?: string;
  country?: string;
  contactNumber?: string | null;
  email?: string | null;
  website?: string | null;
  starRating?: number | null;
  status?: "active" | "inactive";
}

export interface UpdateHotelResponse {
  success: boolean;
  message: string;
  data: Hotel;
}

export interface DeleteHotelResponse {
  success: boolean;
  message: string;
}
