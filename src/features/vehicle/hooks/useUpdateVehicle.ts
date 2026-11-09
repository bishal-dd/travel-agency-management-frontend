import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVehicle } from "../api/vehicle";
import { UpdateVehicleInput } from "../types/vehicle";

interface UpdateVehicleVariables {
  vehicleId: string;
  input: UpdateVehicleInput;
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, input }: UpdateVehicleVariables) =>
      updateVehicle(vehicleId, input),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });

      queryClient.invalidateQueries({
        queryKey: ["vehicles", variables.vehicleId],
      });
    },
  });
}
