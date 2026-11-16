import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import {
  addChecklistItem,
  addNote,
  changeBookingStatus,
  deleteChecklistItem,
  deleteNote,
  getAvailability,
  getBoard,
  getTrip,
  getTripSettings,
  listTrips,
  updateChecklistItem,
  updateLogistics,
  updateTripSettings,
} from "../api/trips";
import type {
  ChecklistTemplateItem,
  ListTripsParams,
  ResourceKind,
  TripDetail,
  UpdateLogisticsInput,
} from "../types/trip";

/** Keys start with the agency id, so switching agency never shows the old agency's trips. */
function useOrgId() {
  const { data } = authClient.useActiveOrganization();
  return data?.id;
}

const noRetryOn403 = (count: number, error: Error) =>
  (error as Error & { status?: number }).status !== 403 && count < 2;

export function useTripsList(params: ListTripsParams) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["trips", orgId, "list", params],
    queryFn: () => listTrips(params),
    placeholderData: keepPreviousData,
    enabled: !!orgId,
    retry: noRetryOn403,
  });
}

export function useTripBoard(date?: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["trips", orgId, "board", date ?? "today"],
    queryFn: () => getBoard(date),
    select: (r) => r.data,
    placeholderData: keepPreviousData,
    enabled: !!orgId,
    refetchOnWindowFocus: true,
    retry: noRetryOn403,
  });
}

/** One trip. `enabled: false` for bookings that aren't confirmed yet. */
export function useTrip(bookingId: string, enabled = true) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["trips", orgId, "detail", bookingId],
    queryFn: () => getTrip(bookingId),
    select: (r) => r.data,
    enabled: !!orgId && enabled,
    retry: (count, error) =>
      ![403, 404, 409].includes((error as { status?: number }).status ?? 0) &&
      count < 2,
  });
}

/** After a change to one trip: refetch it, and the lists / board (progress and counts change). */
function useRefreshTrip(bookingId: string) {
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["trips", orgId] });
  };
}

export function useUpdateLogistics(bookingId: string) {
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: (input: UpdateLogisticsInput) =>
      updateLogistics(bookingId, input),
    onSuccess: (r) => {
      queryClient.setQueryData(["trips", orgId, "detail", bookingId], r);
      queryClient.invalidateQueries({ queryKey: ["trips", orgId, "list"] });
      queryClient.invalidateQueries({ queryKey: ["trips", orgId, "board"] });
    },
  });
}

/** Ticks show straight away; the server answer then refreshes progress everywhere. */
export function useToggleChecklistItem(bookingId: string) {
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  const refresh = useRefreshTrip(bookingId);
  const key = ["trips", orgId, "detail", bookingId];
  return useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      updateChecklistItem(bookingId, itemId, { done }),
    onMutate: async ({ itemId, done }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const before = queryClient.getQueryData<{
        success: boolean;
        data: TripDetail;
      }>(key);
      if (before)
        queryClient.setQueryData(key, {
          ...before,
          data: {
            ...before.data,
            checklist: before.data.checklist.map((i) =>
              i.id === itemId
                ? { ...i, done, overdue: done ? false : i.overdue }
                : i,
            ),
          },
        });
      return { before };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.before) queryClient.setQueryData(key, ctx.before);
    },
    onSettled: refresh,
  });
}

export function useAddChecklistItem(bookingId: string) {
  const refresh = useRefreshTrip(bookingId);
  return useMutation({
    mutationFn: (input: { label: string; dueDate?: string | null }) =>
      addChecklistItem(bookingId, input),
    onSuccess: refresh,
  });
}

export function useEditChecklistItem(bookingId: string) {
  const refresh = useRefreshTrip(bookingId);
  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: {
      itemId: string;
      label?: string;
      dueDate?: string | null;
    }) => updateChecklistItem(bookingId, itemId, input),
    onSuccess: refresh,
  });
}

export function useDeleteChecklistItem(bookingId: string) {
  const refresh = useRefreshTrip(bookingId);
  return useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem(bookingId, itemId),
    onSuccess: refresh,
  });
}

export function useAddNote(bookingId: string) {
  const refresh = useRefreshTrip(bookingId);
  return useMutation({
    mutationFn: (input: { body: string; dayNumber?: number | null }) =>
      addNote(bookingId, input),
    onSuccess: refresh,
  });
}

export function useDeleteNote(bookingId: string) {
  const refresh = useRefreshTrip(bookingId);
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(bookingId, noteId),
    onSuccess: refresh,
  });
}

/** "Start trip" / "Complete trip" from the trips screens. Refreshes trips and the booking. */
export function useMoveTrip() {
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: "in_progress" | "completed";
    }) => changeBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", orgId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

export function useTripSettings() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["trip-settings", orgId],
    queryFn: getTripSettings,
    select: (r) => r.data,
    enabled: !!orgId,
  });
}

export function useUpdateTripSettings() {
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: (checklist: ChecklistTemplateItem[]) =>
      updateTripSettings(checklist),
    onSuccess: (r) => queryClient.setQueryData(["trip-settings", orgId], r),
  });
}

/** Who's free between two dates (for the day plan pickers). */
export function useAvailability(
  params: {
    type: ResourceKind;
    from: string;
    to: string;
    excludeBookingId?: string;
  } | null,
) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["availability", orgId, params],
    queryFn: () => getAvailability(params!),
    select: (r) => r.data,
    enabled: !!orgId && !!params,
    staleTime: 30_000,
  });
}
