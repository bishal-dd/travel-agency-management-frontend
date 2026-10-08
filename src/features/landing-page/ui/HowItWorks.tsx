import { Container, SectionHeading } from "./ui";

const steps = [
  {
    title: "Bring your agency in",
    body: "Import customers and past bookings from a spreadsheet, invite your team and add your logo. Most agencies finish in an afternoon.",
  },
  {
    title: "Build packages and itineraries",
    body: "Set up the tours you sell most, with pricing and inclusions. Tailor a day-by-day itinerary for each customer from there.",
  },
  {
    title: "Confirm bookings and track payments",
    body: "Turn an accepted quote into a booking in one step. Record deposits and balances, and attach tickets, visas and vouchers.",
  },
  {
    title: "Run the trip, watch the business",
    body: "See who is travelling today, what is owed and how each agent and package is performing, all from the overview.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-mist py-20 sm:py-28">
      <Container>
        <SectionHeading
          align="center"
          title="From sign-up to first booking in four stops."
        />

        <ol className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
          {/* Route line connecting the stops */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-[12.5%] left-[12.5%] hidden border-t-2 border-dashed border-lagoon/40 lg:block"
          />
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-6 border-l-2 border-dashed border-lagoon/40 lg:hidden"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
              <span
                className={`font-display relative z-10 grid size-12 shrink-0 place-items-center rounded-full text-xl font-semibold ring-8 ring-mist ${
                  i === steps.length - 1 ? "bg-marigold text-ink" : "bg-lagoon text-white"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
