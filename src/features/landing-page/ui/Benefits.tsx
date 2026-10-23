import { Check, X } from "lucide-react";
import { Container, SectionHeading } from "./ui";

const rows = [
  {
    before: "Customer details scattered across inboxes, chats and notebooks",
    after: "One profile per traveller, with every trip and preference attached",
  },
  {
    before: "Rebuilding the same itinerary in a document for every enquiry",
    after: "Reusable packages you tailor in minutes and send from one screen",
  },
  {
    before: "Finding out about an unpaid balance the week of departure",
    after:
      "Overdue payments flagged the day they slip, with the booking beside them",
  },
  {
    before: "Hunting for a visa scan while the customer waits on the phone",
    after: "Every document filed against its booking and found in one search",
  },
  {
    before: "No clear picture of which agent is handling what",
    after: "Assigned owners, shared notes and a live view of the whole agency",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          title="Less admin between the enquiry and the airport."
          lead="Agencies move to Help Make Travel when the back office starts costing them sales. Here is what changes."
        />

        <div className="mt-12 overflow-hidden rounded-3xl ring-1 ring-line">
          <div className="hidden grid-cols-2 text-sm font-bold md:grid">
            <p className="bg-mist px-7 py-4 text-ink-soft">
              The way it works now
            </p>
            <p className="bg-lagoon px-7 py-4 text-white">
              With Help Make Travel
            </p>
          </div>
          <ul>
            {rows.map((r) => (
              <li
                key={r.before}
                className="grid border-t border-line first:border-0 md:grid-cols-2 md:first:border-t"
              >
                <p className="flex gap-3 bg-mist/60 px-5 py-4 text-ink-soft sm:px-7 md:py-5">
                  <X
                    size={18}
                    className="mt-0.5 shrink-0 text-ink-soft/60"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="sr-only">Before: </span>
                    {r.before}
                  </span>
                </p>
                <p className="flex gap-3 bg-white px-5 py-4 font-medium sm:px-7 md:py-5">
                  <Check
                    size={18}
                    strokeWidth={3}
                    className="mt-0.5 shrink-0 text-lagoon"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="sr-only">With Help Make Travel: </span>
                    {r.after}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
