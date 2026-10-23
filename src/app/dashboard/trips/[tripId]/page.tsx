import { Suspense } from "react";
import type { Metadata } from "next";
import { TripDetailPage } from "@/src/features/trips/ui/TripDetailPage";

export const metadata: Metadata = { title: "Trip | Help Make Travel" };

/** `params` is request data, so it's read inside Suspense (Cache Components). */
async function TripDetailRoute({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripDetailPage tripId={tripId} />;
}

export default function Page({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="min-h-dvh bg-mist" aria-hidden="true" />}
    >
      <TripDetailRoute params={params} />
    </Suspense>
  );
}
