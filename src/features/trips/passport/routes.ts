export const tripRoutes = {
  dashboard: "/dashboard",
  list: "/dashboard/trips",
  create: "/dashboard/trips/new",
  detail: (tripId: string) => `/dashboard/trips/${encodeURIComponent(tripId)}`,
  signIn: "/sign-in",
  onboarding: "/onboarding",
} as const;
