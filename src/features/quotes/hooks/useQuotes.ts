import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuote,
  getBookingQuotes,
  getQuoteSettings,
  revokeQuote,
  updateQuoteSettings,
} from "../api/quotes";
import type { CreateQuoteInput, QuoteSettingsInput } from "../types/quote";

/** All versions for a booking. Refetches on focus, so customer answers show up. */
export function useBookingQuotes(bookingId: string) {
  return useQuery({
    queryKey: ["quotes", bookingId],
    queryFn: () => getBookingQuotes(bookingId),
    select: (response) => response.data,
    refetchOnWindowFocus: true,
  });
}

export function useCreateQuote(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuote(bookingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes", bookingId] });
      // Sharing moves an inquiry to "quoted".
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useRevokeQuote(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: string) => revokeQuote(quoteId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["quotes", bookingId] }),
  });
}

export function useQuoteSettings() {
  return useQuery({
    queryKey: ["quote-settings"],
    queryFn: getQuoteSettings,
    select: (response) => response.data,
  });
}

export function useUpdateQuoteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuoteSettingsInput) => updateQuoteSettings(input),
    onSuccess: (response) =>
      queryClient.setQueryData(["quote-settings"], response),
  });
}
