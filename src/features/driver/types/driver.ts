export type DriverStatus = "active" | "inactive";

export interface Driver {
  id: string;
  organizationId: string;
  name: string;
  cid: string;
  phone: string;
  email: string | null;
  licenseNumber: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverInput {
  name: string;
  cid: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  status?: DriverStatus;
}

export type UpdateDriverInput = Partial<CreateDriverInput>;

export interface DriverResponse {
  data: Driver;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DriversResponse {
  success: boolean;
  data: Driver[];
  pagination: Pagination;
}
