import { Plane } from "lucide-react";
import { Button, Container } from "./ui";

export function CallToAction() {
  return (
    <section id="get-started" className="pb-20 sm:pb-28">
      <Container>
        {/* Styled as a boarding pass: main coupon plus a perforated stub */}
        <div className="relative grid overflow-hidden rounded-[2rem] bg-ink text-white shadow-deep lg:grid-cols-[1fr_19rem]">
          <div className="relative p-8 sm:p-12 lg:p-14">
            <h2 className="font-display max-w-xl text-[2.25rem] leading-[1.05] font-medium sm:text-5xl">
              Your next booking could be your first in Tripdesk.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
              Try every feature free for 14 days. Bring your own customers and bookings,
              or explore with sample data.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#" variant="onDark" size="lg">
                Start free trial
              </Button>
              <Button
                href="#"
                size="lg"
                className="bg-transparent text-white shadow-none ring-1 ring-white/25 ring-inset hover:bg-white/10"
              >
                Book a demo
              </Button>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-white/20 bg-lagoon-deep p-8 sm:p-10 lg:border-t-0 lg:border-l-2">
            {/* Notches */}
            <span aria-hidden="true" className="absolute -top-4 -left-4 hidden size-8 rounded-full bg-paper lg:block" />
            <span aria-hidden="true" className="absolute -bottom-4 -left-4 hidden size-8 rounded-full bg-paper lg:block" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/60">From</p>
                <p className="font-display text-3xl font-medium">Spreadsheets</p>
              </div>
            </div>
            <div className="my-4 flex items-center gap-3 text-marigold" aria-hidden="true">
              <span className="h-px flex-1 border-t border-dashed border-white/30" />
              <Plane size={20} className="rotate-45" />
              <span className="h-px flex-1 border-t border-dashed border-white/30" />
            </div>
            <div>
              <p className="text-xs text-white/60">To</p>
              <p className="font-display text-3xl font-medium">One desk</p>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 text-sm">
              <div>
                <dt className="text-white/60">Boarding</dt>
                <dd className="font-bold">Today</dd>
              </div>
              <div>
                <dt className="text-white/60">Seats</dt>
                <dd className="font-bold">Whole team</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
