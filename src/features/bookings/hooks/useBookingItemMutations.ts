import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addHotelsFromDays,
  createBookingItem,
  deleteBookingItem,
  updateBookingItem,
} from "../api/booking";
import type { BookingItemInput } from "../types/booking";
import { storeBooking } from "./bookingCache";

// Every item endpoint returns the whole booking, so each hook just stores it.

export function useCreateBookingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      item,
    }: {
      bookingId: string;
      item: BookingItemInput;
    }) => createBookingItem(bookingId, item),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}

export function useUpdateBookingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      itemId,
      item,
    }: {
      bookingId: string;
      itemId: string;
      item: BookingItemInput;
    }) => updateBookingItem(bookingId, itemId, item),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}

export function useDeleteBookingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      itemId,
    }: {
      bookingId: string;
      itemId: string;
    }) => deleteBookingItem(bookingId, itemId),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}

export function useAddHotelsFromDays() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => addHotelsFromDays(bookingId),
    onSuccess: (response) => storeBooking(queryClient, response),
  });
}
