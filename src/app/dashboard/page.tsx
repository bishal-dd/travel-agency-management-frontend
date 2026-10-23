import { Dashboard } from "@/src/features/dashboard/Dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Help Make Travel" };

export default function DashboardPage() {
  return <Dashboard />;
}
