import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDriver } from "../api/driver";
import { CreateDriverInput } from "../types/driver";

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDriverInput) => createDriver(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["drivers"],
      });
    },
  });
}
