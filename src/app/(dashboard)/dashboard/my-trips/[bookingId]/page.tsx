import { Suspense } from "react";
import { MyTripDetailPage } from "@/src/features/my-trips/ui/MyTripDetailPage";

type Params = Promise<{ bookingId: string }>;

// Reading params waits for the request, so it sits inside <Suspense>:
// the grey placeholder is prerendered and shows instantly on navigation.
export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<TripSkeleton />}>
      <Trip params={params} />
    </Suspense>
  );
}

async function Trip({ params }: { params: Params }) {
  const { bookingId } = await params;
  return <MyTripDetailPage bookingId={bookingId} />;
}

function TripSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="h-4 w-24 animate-pulse rounded bg-mist" />
      <div className="h-8 w-64 animate-pulse rounded bg-mist" />
      <div className="h-40 animate-pulse rounded-2xl bg-mist" />
      <div className="h-40 animate-pulse rounded-2xl bg-mist" />
    </div>
  );
}
