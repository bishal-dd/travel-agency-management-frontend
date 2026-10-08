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
    { n: "Amara Okafor", t: "3 trips, prefers window seats", c: "bg-marigold" },
    { n: "Jonas Lindqvist", t: "Passport expires in 4 months", c: "bg-lagoon" },
    { n: "Priya Raman", t: "Vegetarian, honeymoon in May", c: "bg-ink" },
  ];
  return (
    <ul className="space-y-2">
      {people.map((p) => (
        <li key={p.n} className="flex items-center gap-3 rounded-xl bg-white p-2.5 ring-1 ring-line">
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
    { ref: "TD-2041", trip: "Kyoto in autumn", s: "Confirmed", c: "bg-lagoon-tint text-lagoon-deep" },
    { ref: "TD-2042", trip: "Marrakech weekend", s: "Awaiting deposit", c: "bg-marigold-tint text-ink" },
    { ref: "TD-2043", trip: "Patagonia trek", s: "Quote sent", c: "bg-mist text-ink-soft" },
  ];
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.ref}
          className="flex items-center justify-between gap-3 rounded-xl bg-white p-2.5 pl-3.5 ring-1 ring-line"
        >
          <span className="min-w-0">
            <span className="block text-xs text-ink-soft tabular-nums">{r.ref}</span>
            <span className="block truncate text-sm font-semibold">{r.trip}</span>
          </span>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${r.c}`}>
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
    body: "Every traveller's contact details, preferences, passport dates and trip history on one profile your whole team can see.",
    wide: true,
    visual: <CustomerVisual />,
  },
  {
    icon: CalendarCheck,
    title: "Bookings",
    body: "Follow each booking from first enquiry to return flight. See what's confirmed, what's waiting, and what needs a nudge today.",
    wide: true,
    visual: <BookingVisual />,
  },
  {
    icon: Package,
    title: "Tour packages",
    body: "Build a package once with pricing, inclusions and departure dates, then reuse it for every customer who asks.",
  },
  {
    icon: Route,
    title: "Itineraries",
    body: "Lay out trips day by day and send a branded itinerary your customers will actually want to open.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    body: "Record deposits, instalments and balances. Know who has paid and who is overdue without opening a spreadsheet.",
  },
  {
    icon: FileText,
    title: "Documents",
    body: "Passports, visas, vouchers, tickets and invoices stored against the right booking and easy to find at the airport gate.",
    wide: true,
  },
  {
    icon: Building2,
    title: "Agency operations",
    body: "Assign work to agents, set who can see what, and track sales and supplier costs across branches.",
    wide: true,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          title="Everything an agency touches in a day, in one place."
          lead="Tripdesk replaces the inbox folders, shared drives and spreadsheets that hold your business together today."
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
                  f.visual ? "grid gap-6 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 xl:items-center" : ""
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
