import { GetHotelAmenitiesResponse } from "../types/hotel-amenity";

export async function getHotelAmenities(
  hotelId: string,
): Promise<GetHotelAmenitiesResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-amenities?hotelId=${encodeURIComponent(hotelId)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch hotel amenities: ${text}`);
  }

  return res.json();
}
