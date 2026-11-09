import { DeleteRoomResponse } from "../types/room";

export async function deleteRoom(roomId: string): Promise<DeleteRoomResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/${roomId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete room: ${text}`);
  }

  return res.json();
}
