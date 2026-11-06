import { useQuery } from "@tanstack/react-query";
import { getHotelAmenities } from "../api/getHotelAmenities";
import { HotelAmenity } from "../types/hotel-amenity";

export function useHotelAmenities(hotelId: string) {
  const { data, isLoading, error, refetch } = useQuery<HotelAmenity[], Error>({
    queryKey: ["hotel-amenities", hotelId],
    queryFn: async () => {
      const response = await getHotelAmenities(hotelId);
      return response.data;
    },
    enabled: !!hotelId,
    staleTime: 0,
    retry: 1,
  });

  return {
    hotelAmenities: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
