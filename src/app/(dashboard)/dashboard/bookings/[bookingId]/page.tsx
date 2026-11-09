import {
  BookingPageSkeleton,
  BookingPage,
} from "@/src/features/bookings/ui/BookingPage";
import { Suspense } from "react";

// must sit inside <Suspense> (Next.js instant navigation). The skeleton is prerendered.
export default function Page() {
  return (
    <Suspense fallback={<BookingPageSkeleton />}>
      <BookingPage />
    </Suspense>
  );
}
