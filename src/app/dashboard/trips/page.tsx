import { TripsListPage } from "@/src/features/trips/ui/TripsListPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trips | Help Make Travel" };

export default function TripsPage() {
  return <TripsListPage />;
}
