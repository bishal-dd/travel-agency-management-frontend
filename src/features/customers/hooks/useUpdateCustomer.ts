import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomer } from "../api/customer";
import type { UpdateCustomerInput } from "../types/customer";

interface UpdateCustomerVariables {
  customerId: string;
  data: UpdateCustomerInput;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: UpdateCustomerVariables) =>
      updateCustomer(customerId, data),
    onSuccess: () => {
      // Prefix match: refreshes the lists and the ["customers", id] detail.
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
