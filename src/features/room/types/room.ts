export interface CreateRoomPayload {
  hotelId: string;
  name: string;
  description?: string;
  roomType: string;
  maxAdults?: number;
  maxChildren?: number;
  totalRooms?: number;
  ratePrice?: string | null;
  rateCost?: string | null;
  rateCurrency?: string | null;
  status?: "active" | "inactive";
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string | null;
  roomType: string;
  maxAdults: number;
  maxChildren: number;
  totalRooms: number;
  ratePrice: string | null;
  rateCost: string | null;
  rateCurrency: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  data: Room;
}

export interface GetRoomsResponse {
  success: boolean;
  data: Room[];
}

export interface UpdateRoomPayload {
  name?: string;
  description?: string | null;
  roomType?: string;
  maxAdults?: number;
  maxChildren?: number;
  totalRooms?: number;
  ratePrice?: string | null;
  rateCost?: string | null;
  rateCurrency?: string | null;
  status?: "active" | "inactive";
}

export interface UpdateRoomResponse {
  success: boolean;
  message: string;
  data: Room;
}

export interface DeleteRoomResponse {
  success: boolean;
  message: string;
}
