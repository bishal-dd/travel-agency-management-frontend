import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDriver } from "../api/driver";
import { UpdateDriverInput } from "../types/driver";

interface UpdateDriverVariables {
  driverId: string;
  input: UpdateDriverInput;
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, input }: UpdateDriverVariables) =>
      updateDriver(driverId, input),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["drivers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["drivers", variables.driverId],
      });
    },
  });
}
