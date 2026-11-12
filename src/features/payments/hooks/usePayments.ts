import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getBookingPayments,
  getPaymentSettings,
  listPayments,
  recordPayment,
  savePaymentSchedule,
  updatePayment,
  updatePaymentSettings,
  voidPayment,
} from "../api/payments";
import type {
  BookingPaymentsResponse,
  ListPaymentsParams,
  PaymentSettings,
  RecordPaymentInput,
  ScheduleInput,
  UpdatePaymentInput,
} from "../types/payment";

/** A booking's payments, schedule and balance. Staff get a 403 (no payment:read). */
export function useBookingPayments(bookingId: string) {
  return useQuery({
    queryKey: ["payments", "booking", bookingId],
    queryFn: () => getBookingPayments(bookingId),
    select: (response) => response.data,
    retry: (count, error) =>
      (error as { status?: number }).status !== 403 && count < 2,
  });
}

/** After any change: store the fresh payments, refresh the booking (its summary) and lists. */
function useAfterChange(bookingId: string) {
  const queryClient = useQueryClient();
  return (response: BookingPaymentsResponse) => {
    queryClient.setQueryData(["payments", "booking", bookingId], response);
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["payments", "list"] });
  };
}

export function useRecordPayment(bookingId: string) {
  const after = useAfterChange(bookingId);
  return useMutation({
    mutationFn: (input: RecordPaymentInput) => recordPayment(bookingId, input),
    onSuccess: after,
  });
}

export function useUpdatePayment(bookingId: string) {
  const after = useAfterChange(bookingId);
  return useMutation({
    mutationFn: ({
      paymentId,
      input,
    }: {
      paymentId: string;
      input: UpdatePaymentInput;
    }) => updatePayment(paymentId, input),
    onSuccess: after,
  });
}

export function useVoidPayment(bookingId: string) {
  const after = useAfterChange(bookingId);
  return useMutation({
    mutationFn: ({
      paymentId,
      reason,
    }: {
      paymentId: string;
      reason: string;
    }) => voidPayment(paymentId, reason),
    onSuccess: after,
  });
}

export function useSavePaymentSchedule(bookingId: string) {
  const after = useAfterChange(bookingId);
  return useMutation({
    mutationFn: (input: ScheduleInput) => savePaymentSchedule(bookingId, input),
    onSuccess: after,
  });
}

export function usePaymentsList(params: ListPaymentsParams) {
  return useQuery({
    queryKey: ["payments", "list", params],
    queryFn: () => listPayments(params),
    placeholderData: keepPreviousData,
  });
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ["payment-settings"],
    queryFn: getPaymentSettings,
    select: (r) => r.data,
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Omit<PaymentSettings, "updatedAt">>) =>
      updatePaymentSettings(input),
    onSuccess: (response) =>
      queryClient.setQueryData(["payment-settings"], response),
  });
}
