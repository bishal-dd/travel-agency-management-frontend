import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBookings } from "../api/booking";
import type { GetBookingsParams } from "../types/booking";

export function useBookings(params: GetBookingsParams = {}) {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["bookings", params],
    queryFn: () => getBookings(params),
    placeholderData: keepPreviousData,
  });

  return {
    bookings: data?.data ?? [],
    pagination: data?.pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  };
}
