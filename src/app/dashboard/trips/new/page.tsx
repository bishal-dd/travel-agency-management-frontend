import type { Metadata } from "next";
import { NewTripPage } from "@/src/features/trips/ui/NewTripPage";

export const metadata: Metadata = { title: "New trip | Tripdesk" };

export default function Page() {
  return <NewTripPage />;
}
