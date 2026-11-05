import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVehicle } from "../api/vehicle";

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },
  });
}
