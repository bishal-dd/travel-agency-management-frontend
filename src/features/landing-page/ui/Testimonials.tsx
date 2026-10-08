import { Quote } from "lucide-react";
import { Container, SectionHeading } from "./ui";

const featured = {
  quote:
    "We used to lose a day every week reconciling payments against bookings. Now I open one screen, see who owes what, and get back to planning trips.",
  name: "Elena Vasquez",
  role: "Founder, Meridian Travel Co.",
};

const others = [
  {
    quote:
      "Our itineraries finally look as good as the trips we sell. Customers reply faster, and they say yes more often.",
    name: "Tomasz Nowak",
    role: "Operations lead, Northwind Tours",
  },
  {
    quote:
      "New agents are productive in their first week because everything about a customer is in one place.",
    name: "Ngozi Adeyemi",
    role: "Managing director, Saffron Routes",
  },
];

const stats = [
  { value: "1,200+", label: "agencies on Tripdesk" },
  { value: "3.4M", label: "trips managed" },
  { value: "9 hrs", label: "saved per agent each week" },
];

function Person({ name, role, tone = "light" }: { name: string; role: string; tone?: "light" | "dark" }) {
  return (
    <figcaption className="flex items-center gap-3">
      <span
        className={`grid size-10 place-items-center rounded-full text-sm font-bold ${
          tone === "dark" ? "bg-marigold text-ink" : "bg-lagoon-tint text-lagoon-deep"
        }`}
        aria-hidden="true"
      >
        {name.split(" ").map((p) => p[0]).join("")}
      </span>
      <span>
        <span className="block text-sm font-bold">{name}</span>
        <span className={`block text-sm ${tone === "dark" ? "text-white/65" : "text-ink-soft"}`}>
          {role}
        </span>
      </span>
    </figcaption>
  );
}

export function Testimonials() {
  return (
    <section id="customers" className="py-20 sm:py-28">
      <Container>
        <SectionHeading title="Agencies that stopped running on spreadsheets." />

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <figure className="flex flex-col justify-between gap-10 rounded-3xl bg-lagoon-deep p-7 text-white sm:p-10">
            <div>
              <Quote size={30} className="text-marigold" aria-hidden="true" />
              <blockquote className="font-display mt-6 text-2xl leading-snug font-medium sm:text-[2rem] sm:leading-[1.25]">
                {featured.quote}
              </blockquote>
            </div>
            <Person {...featured} tone="dark" />
          </figure>

          <div className="grid gap-4">
            {others.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between gap-6 rounded-3xl bg-white p-7 ring-1 ring-line"
              >
                <blockquote className="text-lg leading-relaxed">{t.quote}</blockquote>
                <Person {...t} />
              </figure>
            ))}
          </div>
        </div>

        <dl className="mt-4 grid divide-y divide-line rounded-3xl bg-mist sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse px-7 py-6">
              <dt className="text-ink-soft">{s.label}</dt>
              <dd className="font-display text-4xl font-medium">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
