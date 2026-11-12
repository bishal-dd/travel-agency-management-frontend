export interface Guide {
  id: string;
  organizationId: string;
  name: string;
  cid: string;
  email: string | null;
  phone: string;
  licenseNumber: string | null;
  languages: string[];
  experienceYears: number | null;
  specialization: string | null;
  bio: string | null;
  /** Per day, what the customer pays for the guide. "3500.00" or null. */
  dailyPrice: string | null;
  /** Per day, what the agency pays the guide. */
  dailyCost: string | null;
  /** Currency of the rate, e.g. "BTN". */
  rateCurrency: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuideInput {
  name: string;
  cid: string;
  email?: string;
  phone: string;
  licenseNumber?: string;
  languages: string[];
  experienceYears?: number;
  specialization?: string;
  bio?: string;
  /** null = no rate (clears it on update). Send rateCurrency with a price or cost. */
  dailyPrice?: string | null;
  dailyCost?: string | null;
  rateCurrency?: string | null;
  status?: "active" | "inactive";
}

export interface UpdateGuideInput {
  name?: string;
  cid?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  languages?: string[];
  experienceYears?: number;
  specialization?: string;
  bio?: string;
  dailyPrice?: string | null;
  dailyCost?: string | null;
  rateCurrency?: string | null;
  status?: "active" | "inactive";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GuideResponse {
  success: boolean;
  message?: string;
  data: Guide;
}

export interface GuidesResponse {
  success: boolean;
  data: Guide[];
  pagination: Pagination;
}
