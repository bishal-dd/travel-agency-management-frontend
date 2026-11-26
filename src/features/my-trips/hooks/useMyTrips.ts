import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import { getMyTrip, listMyTrips, type ListMyTripsParams } from "../api/myTrips";

/** Keys start with the agency id, so switching agency never shows the old agency's trips. */
function useOrgId() {
  const { data } = authClient.useActiveOrganization();
  return data?.id;
}

const retry = (count: number, error: Error) => {
  const status = (error as Error & { status?: number }).status;
  return status !== 403 && status !== 404 && count < 2;
};

export function useMyTrips(params: ListMyTripsParams) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["my-trips", orgId, "list", params],
    queryFn: () => listMyTrips(params),
    placeholderData: keepPreviousData,
    enabled: !!orgId,
    retry,
  });
}

export function useMyTrip(bookingId: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["my-trips", orgId, "detail", bookingId],
    queryFn: async () => (await getMyTrip(bookingId)).data,
    enabled: !!orgId,
    retry,
  });
}
