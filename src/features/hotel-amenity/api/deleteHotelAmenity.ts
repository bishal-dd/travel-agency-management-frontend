import { DeleteHotelAmenityResponse } from "../types/hotel-amenity";

export async function deleteHotelAmenity(
  amenityId: string,
): Promise<DeleteHotelAmenityResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-amenities/${amenityId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete hotel amenity: ${text}`);
  }

  return res.json();
}
