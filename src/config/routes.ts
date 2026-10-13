/** Every app route in one place, so links and redirects never drift apart. */
export const routes = {
  home: "/",
  signIn: "/signin",
  signUp: "/signup",
  onboarding: "/onboarding",
  dashboard: {
    overview: "/dashboard",
    customers: "/dashboard/customers",
    bookings: "/dashboard/bookings",
    packages: "/dashboard/packages",
    itineraries: "/dashboard/itineraries",
    payments: "/dashboard/payments",
    documents: "/dashboard/documents",
    team: "/dashboard/team",
  },
} as const;
