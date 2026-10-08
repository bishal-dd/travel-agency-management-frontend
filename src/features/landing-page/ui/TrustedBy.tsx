import { Container } from "./ui";

const agencies = [
  "Meridian Travel Co.",
  "Saffron Routes",
  "Northwind Tours",
  "Atlas & Anchor",
  "Blue Lantern Journeys",
  "Kestrel Expeditions",
];

export function TrustedBy() {
  return (
    <section aria-label="Agencies using Tripdesk" className="border-y border-line bg-white py-8">
      <Container className="flex flex-col items-center gap-5">
        <p className="shrink-0 text-sm font-medium text-ink-soft">
          Trusted by 1,200+ agencies in 40 countries
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:w-full lg:justify-between">
          {agencies.map((a) => (
            <li key={a} className="font-display text-lg font-medium text-ink/55">
              {a}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
