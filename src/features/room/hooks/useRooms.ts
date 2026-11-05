import { useQuery } from "@tanstack/react-query";
import { getRooms } from "../api/getRooms";
import { Room } from "../types/room";

export function useRooms(hotelId: string) {
  const { data, isLoading, error, refetch } = useQuery<Room[], Error>({
    queryKey: ["rooms", hotelId],
    queryFn: async () => {
      const response = await getRooms(hotelId);
      return response.data;
    },
    enabled: !!hotelId,
    staleTime: 0,
    retry: 1,
  });

  return {
    rooms: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
