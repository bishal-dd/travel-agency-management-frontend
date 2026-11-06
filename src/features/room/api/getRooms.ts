import { GetRoomsResponse } from "../types/room";

export async function getRooms(hotelId: string): Promise<GetRoomsResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms?hotelId=${encodeURIComponent(hotelId)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch rooms: ${text}`);
  }

  return res.json();
}
