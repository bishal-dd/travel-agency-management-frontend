import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer } from "../api/customer";
import type { CreateCustomerInput } from "../types/customer";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
