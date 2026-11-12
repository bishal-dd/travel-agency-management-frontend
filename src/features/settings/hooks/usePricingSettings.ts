import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getPricingSettings,
  updatePricingSettings,
} from "../api/pricingSettings";
import { PricingSettingsInput } from "../types/pricingSettings";

export function usePricingSettings() {
  return useQuery({
    queryKey: ["pricing-settings"],
    queryFn: getPricingSettings,
    select: (response) => response.data,
  });
}

export function useUpdatePricingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingSettingsInput) => updatePricingSettings(input),
    onSuccess: (response) => {
      queryClient.setQueryData(["pricing-settings"], response);
      // Unconfirmed bookings show fees and GST from these settings.
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
