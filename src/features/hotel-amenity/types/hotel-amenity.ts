export interface CreateHotelAmenityPayload {
  hotelId: string;
  name: string;
  description?: string;
}

export interface HotelAmenity {
  id: string;
  hotelId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelAmenityResponse {
  success: boolean;
  message: string;
  data: HotelAmenity;
}

export interface GetHotelAmenitiesResponse {
  success: boolean;
  data: HotelAmenity[];
}

export interface UpdateHotelAmenityPayload {
  name?: string;
  description?: string | null;
}

export interface UpdateHotelAmenityResponse {
  success: boolean;
  message: string;
  data: HotelAmenity;
}

export interface DeleteHotelAmenityResponse {
  success: boolean;
  message: string;
}
