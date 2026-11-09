"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bus,
  CalendarCheck,
  Compass,
  CreditCard,
  FileText,
  Hotel,
  IdCard,
  LayoutDashboard,
  LogOut,
  Package,
  Plane,
  Ticket,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { AgencySwitcher } from "./AgencySwitcher";
import type { AgencyDashboard } from "./useAgencyDashboard";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Not built yet: shown greyed out with a "Soon" tag instead of linking to a 404. */
  soon?: boolean;
};

// Same order as the marketing preview. Flip `soon` off as each page ships.
const nav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Hotels",
    href: "/dashboard/hotels",
    icon: Hotel,
  },
  { label: "Drivers", href: "/dashboard/drivers", icon: IdCard },
  { label: "Vehicles", href: "/dashboard/vehicles", icon: Bus },
  { label: "Guides", href: "/dashboard/guides", icon: Compass },
  { label: "Services", href: "/dashboard/services", icon: Ticket },
  { label: "Itineraries", href: "/dashboard/itineraries", icon: CalendarCheck },
  { label: "Customers", href: "/dashboard/customers", icon: UsersRound },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarCheck,
  },
  { label: "Packages", href: "/dashboard/packages", icon: Package, soon: true },
  { label: "Trips", href: "/dashboard/trips", icon: Plane },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    soon: true,
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    soon: true,
  },
  { label: "Team", href: "/dashboard/team", icon: Users },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const itemBase =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150";

/** The nav list itself. `pathname` is null in the prerendered fallback (no link highlighted yet). */
function NavList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="space-y-0.5">
      {nav.map((item) => {
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
