import { Hotel } from "../types/hotel";

export interface GetHotelByIdResponse {
  success: boolean;
  data: Hotel;
}

export async function getHotelById(
  hotelId: string,
): Promise<GetHotelByIdResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels/${hotelId}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch hotel: ${text}`);
  }

  return res.json();
}
