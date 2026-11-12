import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getExchangeRates, saveExchangeRates } from "../api/exchangeRates";
import type { ExchangeRateInput } from "../types/exchangeRate";

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: getExchangeRates,
    select: (response) => response.data,
  });
}

export function useSaveExchangeRates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rates: ExchangeRateInput[]) => saveExchangeRates(rates),
    onSuccess: (response) => {
      queryClient.setQueryData(["exchange-rates"], response);
      // Price previews depend on the rates.
      queryClient.invalidateQueries({ queryKey: ["booking-default-price"] });
    },
  });
}
