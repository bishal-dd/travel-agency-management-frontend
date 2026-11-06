import { useQuery } from "@tanstack/react-query";
import { getDriverById } from "../api/driver";

export function useDriverById(driverId: string) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["drivers", driverId],
    queryFn: () => getDriverById(driverId),
    enabled: !!driverId,
  });

  return {
    driver: data?.data ?? null,
    isPending,
    isFetching,
    error,
    refetch,
  };
}
