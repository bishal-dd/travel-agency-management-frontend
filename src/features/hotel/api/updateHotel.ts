import { UpdateHotelPayload, UpdateHotelResponse } from "../types/hotel";

export async function updateHotel(
  hotelId: string,
  data: UpdateHotelPayload,
): Promise<UpdateHotelResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels/${hotelId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update hotel: ${text}`);
  }

  return res.json();
}
