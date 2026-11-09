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
