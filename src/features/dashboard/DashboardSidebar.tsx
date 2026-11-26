"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Bus,
  CalendarCheck,
  Compass,
  CreditCard,
  FileText,
  Hotel,
  IdCard,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  Plane,
  Route,
  Ticket,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useCan } from "@/src/lib/useCan";
import type { PermissionInput } from "@/src/lib/permissions";
import { AgencySwitcher } from "./AgencySwitcher";
import type { AgencyDashboard } from "./useAgencyDashboard";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Not built yet: shown greyed out with a "Soon" tag instead of linking to a 404. */
  soon?: boolean;
  /**
   * What the page needs (same as its backend route). Hidden for roles without it.
   * Leave out for pages everyone can open.
   */
  needs?: PermissionInput;
  /** Hidden for roles that have this (e.g. "My trips" is for guides, not the office). */
  hideIf?: PermissionInput;
};

// Same order as the marketing preview. Flip `soon` off as each page ships.
// `needs` = the permission the page's main backend route checks.
const nav: NavItem[] = [
  // Guides only: the trips they're assigned to. The office uses Trips instead.
  {
    label: "My trips",
    href: "/dashboard/my-trips",
    icon: Compass,
    needs: { myTrips: ["read"] },
    hideIf: { booking: ["read"] },
  },
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    needs: { booking: ["read"] },
  },
  {
    label: "Hotels",
    href: "/dashboard/hotels",
    icon: Hotel,
    needs: { hotel: ["read"] },
  },
  {
    label: "Drivers",
    href: "/dashboard/drivers",
    icon: IdCard,
    needs: { driver: ["read"] },
  },
  {
    label: "Vehicles",
    href: "/dashboard/vehicles",
    icon: Bus,
    needs: { vehicle: ["read"] },
  },
  {
    label: "Guides",
    href: "/dashboard/guides",
    icon: Compass,
    needs: { guide: ["read"] },
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: Ticket,
    needs: { service: ["read"] },
  },
  {
    label: "Itineraries",
    href: "/dashboard/itineraries",
    icon: Route,
    needs: { itinerary: ["read"] },
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: UsersRound,
    needs: { customer: ["read"] },
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarCheck,
    needs: { booking: ["read"] },
  },
  // {
  //   label: "Packages",
  //   href: "/dashboard/packages",
  //   icon: Package,
  //   soon: true,
  //   needs: { itinerary: ["read"] },
  // },
  {
    label: "Trips",
    href: "/dashboard/trips",
    icon: Plane,
    needs: { operation: ["read"] },
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    needs: { payment: ["read"] },
  },
  {
    label: "Accounts",
    href: "/dashboard/accounts",
    icon: Wallet,
    needs: { payment: ["read"], payable: ["read"] },
  },
  // {
  //   label: "Documents",
  //   href: "/dashboard/documents",
  //   icon: FileText,
  //   soon: true,
  //   needs: { booking: ["read"] },
  // },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
    needs: { teamManagement: ["read"] },
  },
];

// Agency-wide settings, shown in their own group under the main nav.
// Needs the permission that SAVES the setting: no point showing a form you can't save.
const settingsNav: NavItem[] = [
  {
    label: "Taxes & fees",
    href: "/dashboard/settings/pricing",
    icon: Landmark,
    needs: { rate: ["update"] },
  },
  {
    label: "Exchange rates",
    href: "/dashboard/settings/exchange-rates",
    icon: ArrowLeftRight,
    needs: { rate: ["update"] },
  },
  {
    label: "Quotes",
    href: "/dashboard/settings/quotes",
    icon: FileText,
    needs: { agency: ["update"] },
  },
  {
    label: "Payment terms",
    href: "/dashboard/settings/payments",
    icon: CreditCard,
    needs: { agency: ["update"] },
  },
  {
    label: "Trip checklist",
    href: "/dashboard/settings/trips",
    icon: ListChecks,
    needs: { operation: ["update"] },
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const itemBase =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150";

/** One group of links. `pathname` is null in the prerendered fallback (no link highlighted yet). */
function NavItems({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string | null;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        if (item.href === LOADING) {
          return (
            <li
              key={item.label}
              aria-hidden="true"
              className={`${itemBase} pointer-events-none`}
            >
              <span className="size-4 rounded bg-mist" />
              <span className="h-3 w-24 rounded bg-mist" />
            </li>
          );
        }
        if (item.soon) {
          return (
            <li
              key={item.href}
              aria-disabled="true"
              className={`${itemBase} cursor-default text-ink-soft/50`}
            >
              <item.icon size={16} aria-hidden="true" />
              {item.label}
              <span className="ml-auto rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                Soon
              </span>
            </li>
          );
        }

        const on = pathname !== null && isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`${itemBase} ${
                on
                  ? "bg-lagoon-tint text-lagoon-deep"
                  : "text-ink-soft hover:bg-mist hover:text-ink"
              }`}
            >
              <item.icon size={16} aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const LOADING = "#loading";
/** Grey placeholder rows while the role loads, so forbidden links never flash up. */
const placeholders = (n: number): NavItem[] =>
  Array.from({ length: n }, (_, i) => ({
    label: `loading-${i}`,
    href: LOADING,
    icon: LayoutDashboard,
  }));

/** Main nav, then the Settings group: each filtered by what the user's role allows. */
function NavList({ pathname }: { pathname: string | null }) {
  const { can, ready } = useCan();

  const shown = (i: NavItem) => can(i.needs) && !(i.hideIf && can(i.hideIf));
  const main = ready ? nav.filter(shown) : placeholders(7);
  const settings = ready ? settingsNav.filter(shown) : [];

  return (
    <>
      <NavItems items={main} pathname={pathname} />
      {settings.length > 0 && (
        <div className="mt-6">
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/80">
            Settings
          </p>
          <NavItems items={settings} pathname={pathname} />
        </div>
      )}
    </>
  );
}

function ActiveNavList() {
  return <NavList pathname={usePathname()} />;
}

export function DashboardSidebar({ d }: { d: AgencyDashboard }) {
  const user = d.session?.user;
  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    // Height, stickiness and border come from the wrapper in DashboardLayout
    // (desktop column or mobile drawer); the logo now lives in the top bar.
    <aside className="flex h-full flex-col gap-6 bg-white p-5">
      <AgencySwitcher {...d} />

      <nav aria-label="Dashboard" className="-mx-2 flex-1 overflow-y-auto px-2">
        {/* usePathname() must sit inside <Suspense> on dynamic routes */}
        <Suspense fallback={<NavList pathname={null} />}>
          <ActiveNavList />
        </Suspense>
      </nav>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-marigold text-sm font-bold"
          >
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-ink-soft">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={d.handleSignOut}
          aria-label="Sign out"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink ring-1 ring-inset ring-line transition-colors hover:ring-ink/40"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
