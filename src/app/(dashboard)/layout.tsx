import type { ReactNode } from "react";
import { DashboardShell } from "@/src/features/dashboard/DashboardShell";

export default function DashboardRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
