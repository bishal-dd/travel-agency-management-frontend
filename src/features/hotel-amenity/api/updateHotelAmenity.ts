import {
  UpdateHotelAmenityPayload,
  UpdateHotelAmenityResponse,
} from "../types/hotel-amenity";

export async function updateHotelAmenity(
  amenityId: string,
  data: UpdateHotelAmenityPayload,
): Promise<UpdateHotelAmenityResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-amenities/${amenityId}`,
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
    throw new Error(`Failed to update hotel amenity: ${text}`);
  }

  return res.json();
}
