import {
  HotelDetailPage,
  HotelDetailSkeleton,
} from "@/src/features/hotel/ui/HotelDetailPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<HotelDetailSkeleton />}>
      <HotelDetailPage />
    </Suspense>
  );
}
