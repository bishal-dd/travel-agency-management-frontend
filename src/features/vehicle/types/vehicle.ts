export type VehicleStatus = "active" | "inactive";

export interface Vehicle {
  id: string;
  organizationId: string;
  driverId: string | null;
  name: string;
  registrationNumber: string;
  vehicleType: string;
  seatingCapacity: number;
  /** Per day, what the customer pays (including the driver). "8500.00" or null. */
  dailyPrice: string | null;
  /** Per day, what the agency pays for the vehicle (the driver's cost is on the driver). */
  dailyCost: string | null;
  /** Currency of the rate, e.g. "BTN". */
  rateCurrency: string | null;
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
  /** null = no rate (clears it on update). Send rateCurrency with a price or cost. */
  dailyPrice?: string | null;
  dailyCost?: string | null;
  rateCurrency?: string | null;
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
