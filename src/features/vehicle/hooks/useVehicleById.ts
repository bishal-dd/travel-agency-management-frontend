import { useQuery } from "@tanstack/react-query";
import { getVehicleById } from "../api/vehicle";

export function useVehicleById(vehicleId: string) {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["vehicles", vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  return {
    vehicle: data?.data ?? null,
    isPending,
    isFetching,
    error,
    refetch,
  };
}
