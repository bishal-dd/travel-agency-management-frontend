import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicle } from "../api/vehicle";
import { CreateVehicleInput } from "../types/vehicle";

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVehicleInput) => createVehicle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },
  });
}
