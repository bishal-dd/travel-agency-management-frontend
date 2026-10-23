import {
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  Package,
  Route,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Container, SectionHeading } from "./ui";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  wide?: boolean;
  visual?: ReactNode;
};

function CustomerVisual() {
  const people = [
    {
      n: "Tashi Dorji",
      t: "Family tour, 4 travellers",
      c: "bg-marigold",
    },
    {
      n: "Emma Wilson",
      t: "Arrival in Paro, 12 November",
      c: "bg-lagoon",
    },
    {
      n: "Arjun Mehta",
      t: "Cultural tour, 7 days",
      c: "bg-ink",
    },
  ];

  return (
    <ul className="space-y-2">
      {people.map((p) => (
        <li
          key={p.n}
          className="flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 ring-line"
        >
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${p.c}`}
          >
            {p.n[0]}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{p.n}</span>
            <span className="block truncate text-xs text-ink-soft">{p.t}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function BookingVisual() {
  const rows = [
    {
      ref: "HMT-2041",
      trip: "Bhutan Cultural Tour",
      s: "Confirmed",
      c: "bg-lagoon-tint text-lagoon-deep",
    },
    {
      ref: "HMT-2042",
      trip: "Bangkok Holiday",
      s: "Awaiting deposit",
      c: "bg-marigold-tint text-ink",
    },
    {
      ref: "HMT-2043",
      trip: "Himalayan Trek",
      s: "Quote sent",
      c: "bg-mist text-ink-soft",
    },
  ];
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.ref}
          className="flex items-center justify-between gap-3 rounded-xl bg-white p-2.5 pl-3.5 ring-1 ring-line"
        >
          <span className="min-w-0">
            <span className="block text-xs text-ink-soft tabular-nums">
              {r.ref}
            </span>
            <span className="block truncate text-sm font-semibold">
              {r.trip}
            </span>
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${r.c}`}
          >
            {r.s}
          </span>
        </li>
      ))}
    </ul>
  );
}

const features: Feature[] = [
  {
    icon: Users,
    title: "Customers",
    body: "Keep contact details, traveller preferences, important documents and trip history together in one profile your team can access.",
    wide: true,
    visual: <CustomerVisual />,
  },
  {
    icon: CalendarCheck,
    title: "Bookings",
    body: "Track every booking from enquiry to departure. See what's confirmed, awaiting payment or needs follow-up.",
    wide: true,
    visual: <BookingVisual />,
  },
  {
    icon: Package,
    title: "Tour packages",
    body: "Create reusable packages with pricing, inclusions and departure dates. Spend less time rebuilding the same offers.",
  },
  {
    icon: Route,
    title: "Itineraries",
    body: "Plan trips day by day, organise activities and share professional itineraries with your customers.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    body: "Track deposits, instalments, outstanding balances and supplier costs to keep every trip's finances organised.",
  },
  {
    icon: FileText,
    title: "Documents",
    body: "Keep passports, visas, tickets, vouchers and invoices organised by booking, so important files are easy to find.",
    wide: true,
  },
  {
    icon: Building2,
    title: "Agency operations",
    body: "Assign tasks, manage team access and keep track of bookings and operations across your agency.",
    wide: true,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          title="Everything your agency needs to run smoothly."
          lead="Bring customer records, bookings, itineraries, payments and documents together in one organised workspace."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {features.map((f) => (
            <article
              key={f.title}
              className={`group rounded-3xl p-6 ring-1 ring-line transition-shadow duration-300 hover:shadow-lift sm:p-7 ${
                f.visual ? "bg-mist" : "bg-white"
              } ${f.wide ? "lg:col-span-3" : "lg:col-span-2"} ${
                f.visual ? "md:col-span-1" : ""
              }`}
            >
              <div
                className={
                  f.visual
                    ? "grid gap-6 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 xl:items-center"
                    : ""
                }
              >
                <div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-lagoon text-white">
                    <f.icon size={20} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{f.body}</p>
                </div>
                {f.visual}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
