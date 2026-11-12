export type DriverStatus = "active" | "inactive";

export interface Driver {
  id: string;
  organizationId: string;
  name: string;
  cid: string;
  phone: string;
  email: string | null;
  licenseNumber: string;
  /**
   * Per day, what the agency pays the driver (wage / allowance). "1500.00" or null.
   * Drivers have no price: customers pay the vehicle's rate, which includes the driver.
   */
  dailyCost: string | null;
  /** Currency of dailyCost, e.g. "BTN". */
  rateCurrency: string | null;
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
  /** null = no cost (clears it on update). Send rateCurrency with it. */
  dailyCost?: string | null;
  rateCurrency?: string | null;
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
