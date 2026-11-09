import { GetHotelsResponse } from "../types/hotel";

export interface GetHotelsParams {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export async function getHotels(
  params: GetHotelsParams = {},
): Promise<GetHotelsResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.set("search", params.search);
  }

  if (params.status) {
    queryParams.set("status", params.status);
  }

  if (params.page !== undefined) {
    queryParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    queryParams.set("limit", String(params.limit));
  }

  const query = queryParams.toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels${query ? `?${query}` : ""}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch hotels: ${text}`);
  }

  return res.json();
}
