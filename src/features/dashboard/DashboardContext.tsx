"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AgencyDashboard } from "./useAgencyDashboard";

const DashboardContext = createContext<AgencyDashboard | null>(null);

export function DashboardProvider({
  value,
  children,
}: {
  value: AgencyDashboard;
  children: ReactNode;
}) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboardContext must be used inside DashboardProvider",
    );
  }

  return context;
}
