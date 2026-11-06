export type VehicleStatus = "active" | "inactive";

export interface Vehicle {
  id: string;
  organizationId: string;
  driverId: string | null;
  name: string;
  registrationNumber: string;
  vehicleType: string;
  seatingCapacity: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  driverId?: string | null;
  name: string;
  registrationNumber: string;
  vehicleType: string;
  seatingCapacity: number;
  status?: VehicleStatus;
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface VehicleResponse {
  data: Vehicle;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehiclesResponse {
  success: boolean;
  data: Vehicle[];
  pagination: Pagination;
}
