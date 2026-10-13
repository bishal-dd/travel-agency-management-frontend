"use client";

import { useCallback } from "react";
import { tripsRepository } from "../passport/repository";
import { useAsyncResource } from "./use-async-resource";

export function useTrips(organizationId: string | null) {
  const load = useCallback(
    () => tripsRepository.listTrips(organizationId as string),
    [organizationId],
  );
  const resource = useAsyncResource(
    organizationId ? `trips:${organizationId}` : null,
    load,
  );
  return { ...resource, trips: resource.data ?? [] };
}

export function useTrip(organizationId: string | null, tripId: string) {
  const load = useCallback(
    () => tripsRepository.getTrip(organizationId as string, tripId),
    [organizationId, tripId],
  );
  const resource = useAsyncResource(
    organizationId ? `trip:${organizationId}:${tripId}` : null,
    load,
  );
  return { ...resource, trip: resource.data };
}
