import { DeleteHotelResponse } from "../types/hotel";

export async function deleteHotel(
  hotelId: string,
): Promise<DeleteHotelResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels/${hotelId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete hotel: ${text}`);
  }

  return res.json();
}
