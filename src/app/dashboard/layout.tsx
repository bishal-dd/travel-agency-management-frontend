import type { ReactNode } from "react";
import { DashboardLayout as DashboardShell } from "@/src/features/dashboard/DashboardLayout";

export default function DashboardRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
