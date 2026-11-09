import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getHotelById } from "../api/getHotelById";
import type { GetHotelsResponse } from "../types/hotel";

// Whatever your getHotelById returns ({ success, message, data: Hotel })
type HotelByIdResponse = Awaited<ReturnType<typeof getHotelById>>;

export function useHotelById(hotelId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, isPending, error, refetch } = useQuery({
    queryKey: ["hotels", hotelId],
    queryFn: () => getHotelById(hotelId),
    enabled: !!hotelId,
    staleTime: 0,
    retry: 1,

    // Show the hotel at once if a cached Hotels list page already has it.
    initialData: () => {
      const cached = queryClient.getQueriesData<GetHotelsResponse>({
        queryKey: ["hotels"],
      });

      for (const [, page] of cached) {
        // Skip single-hotel entries; only list pages have an array in `data`.
        if (!Array.isArray(page?.data)) continue;

        const hit = page.data.find((h) => h.id === hotelId);
        if (hit) {
          return { success: true, message: "", data: hit } as HotelByIdResponse;
        }
      }
      return undefined; // not cached → normal loading state
    },
    // Treat the cached copy as old, so the real GET /hotels/:id still runs immediately.
    initialDataUpdatedAt: 0,
  });

  return {
    hotel: data?.data ?? null,
    isLoading,
    isPending,
    error,
    refetch,
  };
}
