import { CreateRoomPayload, CreateRoomResponse } from "../types/room";

export async function createRoom(
  data: CreateRoomPayload,
): Promise<CreateRoomResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create room: ${text}`);
  }

  return res.json();
}
