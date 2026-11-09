import {
  CreateHotelAmenityPayload,
  CreateHotelAmenityResponse,
} from "../types/hotel-amenity";

export async function createHotelAmenity(
  data: CreateHotelAmenityPayload,
): Promise<CreateHotelAmenityResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-amenities`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create hotel amenity: ${text}`);
  }

  return res.json();
}
