"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Route,
  Search,
  Users,
} from "lucide-react";
import { Container, SectionHeading } from "./ui";
import { BookingsPanel } from "../preview/BookingsPanel";
import { ItineraryPanel } from "../preview/ItineraryPanel";
import { PaymentsPanel } from "../preview/PaymentsPanel";

const tabs = [
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    panel: <BookingsPanel />,
  },
  {
    id: "itinerary",
    label: "Itineraries",
    icon: Route,
    panel: <ItineraryPanel />,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    panel: <PaymentsPanel />,
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

const sidebar = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Bookings", icon: CalendarCheck, tab: "bookings" },
  { label: "Packages", icon: Package },
  { label: "Itineraries", icon: Route, tab: "itinerary" },
  { label: "Payments", icon: CreditCard, tab: "payments" },
  { label: "Documents", icon: FileText },
  { label: "Team", icon: Building2 },
];

export function ProductPreview() {
  const [active, setActive] = useState<TabId>("bookings");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section id="product" className="bg-ink py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            tone="dark"
            title="A dashboard that reads like your day."
            lead="Open Help Make Travel in the morning and see who is departing, who owes a balance and which quotes are waiting on you."
          />
          <div
            role="tablist"
            aria-label="Product views"
            className="flex shrink-0 gap-1 self-start rounded-full bg-white/10 p-1 lg:self-auto"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                id={`tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls="product-panel"
                onClick={() => setActive(t.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
                  active === t.id
                    ? "bg-white text-ink"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <t.icon size={15} className="hidden sm:block" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl bg-paper shadow-deep ring-1 ring-white/10 sm:rounded-3xl">
          {/* Window bar */}
          <div className="flex items-center gap-4 border-b border-line bg-white px-4 py-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
            </div>
            <div className="flex h-8 flex-1 items-center gap-2 rounded-lg bg-mist px-3 text-xs text-ink-soft sm:max-w-xs">
              <Search size={13} /> Search customers, bookings, documents
            </div>
            <Bell size={16} className="ml-auto hidden text-ink-soft sm:block" />
            <span className="hidden size-7 place-items-center rounded-full bg-marigold text-xs font-bold sm:grid">
              S
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            <nav
              aria-label="Product sections (preview)"
              className="hidden border-r border-line bg-white p-3 md:block"
            >
              <ul className="space-y-0.5">
                {sidebar.map((s) => {
                  const on = s.tab === active;
                  return (
                    <li
                      key={s.label}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                        on ? "bg-lagoon-tint text-lagoon-deep" : "text-ink-soft"
                      }`}
                    >
                      <s.icon size={16} /> {s.label}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div
              key={current.id}
              id="product-panel"
              role="tabpanel"
              aria-labelledby={`tab-${current.id}`}
              className="animate-rise min-h-[26rem] min-w-0 p-4 [animation-duration:0.4s] sm:p-6"
            >
              {current.panel}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
