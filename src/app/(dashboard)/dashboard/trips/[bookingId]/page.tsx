import { Suspense } from "react";
import { TripDetailPage } from "@/src/features/trips/ui/TripDetailPage";

type Params = Promise<{ bookingId: string }>;

/** Reads the URL param inside <Suspense>, as Cache Components requires. */
async function TripFromParams({ params }: { params: Params }) {
  const { bookingId } = await params;
  return <TripDetailPage bookingId={bookingId} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-2xl bg-mist" />}
    >
      <TripFromParams params={params} />
    </Suspense>
  );
}
