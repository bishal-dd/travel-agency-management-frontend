import { TripDetailPage } from "@/src/features/trips/ui/TripDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <TripDetailPage bookingId={bookingId} />;
}
