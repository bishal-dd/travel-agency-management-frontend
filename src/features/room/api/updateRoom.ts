import { UpdateRoomPayload, UpdateRoomResponse } from "../types/room";

export async function updateRoom(
  roomId: string,
  data: UpdateRoomPayload,
): Promise<UpdateRoomResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/${roomId}`,
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
    throw new Error(`Failed to update room: ${text}`);
  }

  return res.json();
}
