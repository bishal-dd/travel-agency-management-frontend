import {
  ItineraryEditorSkeleton,
  ItineraryEditorPage,
} from "@/src/features/itineraries/ui/ItineraryEditorPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ItineraryEditorSkeleton />}>
      <ItineraryEditorPage />
    </Suspense>
  );
}
