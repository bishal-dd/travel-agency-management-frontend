import type {
  GuidesResponse,
  GuideResponse,
  CreateGuideInput,
  UpdateGuideInput,
} from "../types/guide";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Something went wrong");
  }

  return res.json();
}

export interface GetGuidesParams {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

// Get all guides with search, filters and pagination
export async function getGuides(
  params: GetGuidesParams = {},
): Promise<GuidesResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BACKEND_URL}/guides?${query.toString()}`, {
    credentials: "include",
  });

  return handleResponse<GuidesResponse>(res);
}

// Get guide by ID
export async function getGuideById(guideId: string): Promise<GuideResponse> {
  const res = await fetch(`${BACKEND_URL}/guides/${guideId}`, {
    credentials: "include",
  });

  return handleResponse<GuideResponse>(res);
}

// Create guide
export async function createGuide(
  data: CreateGuideInput,
): Promise<GuideResponse> {
  const res = await fetch(`${BACKEND_URL}/guides`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<GuideResponse>(res);
}

// Update guide
export async function updateGuide(
  guideId: string,
  data: UpdateGuideInput,
): Promise<GuideResponse> {
  const res = await fetch(`${BACKEND_URL}/guides/${guideId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse<GuideResponse>(res);
}

// Delete guide
export async function deleteGuide(guideId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${BACKEND_URL}/guides/${guideId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(res);
}
