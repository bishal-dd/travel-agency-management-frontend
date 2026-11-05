import { CreateHotelPayload, CreateHotelResponse } from "../types/hotel";

export async function createHotel(
  data: CreateHotelPayload,
): Promise<CreateHotelResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hotels`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();

    throw new Error(`Failed to create hotel: ${text}`);
  }

  return res.json();
}
