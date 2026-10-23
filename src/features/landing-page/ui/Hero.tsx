import {
  CalendarCheck,
  Check,
  CreditCard,
  FileText,
  MapPin,
} from "lucide-react";
import { Container } from "./ui";
import { WaitlistForm } from "./WaitlistForm";

const stops = [
  {
    day: "Day 1",
    place: "Paro",
    note: "Airport pickup, hotel check-in",
  },
  {
    day: "Day 3",
    place: "Thimphu",
    note: "Buddha Dordenma, city sightseeing",
  },
  {
    day: "Day 5",
    place: "Punakha",
    note: "Punakha Dzong, suspension bridge",
  },
];

function ItineraryCard() {
  return (
    <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-deep ring-1 ring-line sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-lagoon">Tour package</p>

          <p className="font-display mt-1 text-2xl font-medium">
            Bhutan Highlights, 7 days
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Sharma family, 4 travellers
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lagoon-tint px-2.5 py-1 text-xs font-semibold text-lagoon-deep">
          <Check size={13} strokeWidth={3} /> Confirmed
        </span>
      </div>

      {/* Route map */}
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-mist">
        <svg viewBox="0 0 400 150" className="block w-full" aria-hidden="true">
          <path
            d="M-10 120 C60 90 70 135 130 110 S220 40 260 70 330 60 410 20 V160 H-10Z"
            className="fill-lagoon-tint"
          />
          <path
            d="M48 108 C100 60 150 120 200 78 S300 70 348 40"
            pathLength={1}
            fill="none"
            className="animate-draw stroke-lagoon"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1"
          />
          {[
            [48, 108],
            [200, 78],
            [348, 40],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="9" className="fill-white" />
              <circle
                cx={x}
                cy={y}
                r="4.5"
                className={i === 2 ? "fill-marigold" : "fill-lagoon"}
              />
            </g>
          ))}
        </svg>
      </div>

      <ol className="mt-5 space-y-3.5">
        {stops.map((s) => (
          <li key={s.day} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs font-semibold text-ink-soft">
              {s.day}
            </span>
            <MapPin size={15} className="shrink-0 text-lagoon" />
            <span className="min-w-0 truncate text-sm">
              <span className="font-semibold">{s.place}</span>
              <span className="text-ink-soft">, {s.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between border-t border-dashed border-line pt-4">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <FileText size={15} />6 documents attached
        </div>

        <p className="text-sm font-bold tabular-nums">Nu. 85,000</p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="contours relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-28"
    >
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <h1 className="font-display animate-rise text-[2.6rem] leading-[1.02] font-medium text-ink sm:text-6xl lg:text-[4.25rem]">
            Run your whole travel agency from one desk.
          </h1>
          <p
            className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
            style={{ animationDelay: "120ms" }}
          >
            Help Make Travel keeps customers, bookings, tour packages,
            itineraries, payments and documents in one place, so your team
            spends the day selling trips instead of chasing spreadsheets.
          </p>

          <div
            className="animate-rise mt-8"
            style={{ animationDelay: "240ms" }}
          >
            <WaitlistForm />
          </div>

          <ul
            className="animate-rise mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft"
            style={{ animationDelay: "340ms" }}
          >
            {[
              "Early access updates",
              "Built for travel agencies",
              "All your operations in one place",
            ].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={15} strokeWidth={3} className="text-lagoon" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-rise relative mx-auto w-full max-w-md lg:mr-0"
          style={{ animationDelay: "300ms" }}
        >
          <ItineraryCard />

          <div className="animate-bob absolute -top-12 -right-2 hidden items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-lift ring-1 ring-line sm:flex lg:-right-8">
            <span className="grid size-9 place-items-center rounded-xl bg-marigold-tint text-ink">
              <CreditCard size={17} />
            </span>
            <div>
              <p className="text-xs text-ink-soft">Payment received</p>
              <p className="text-sm font-bold tabular-nums">Nu. 25,000</p>
            </div>
          </div>

          <div
            className="animate-bob absolute -bottom-12 -left-3 hidden items-center gap-3 rounded-2xl bg-ink p-3 pr-4 text-white shadow-lift sm:flex lg:-left-10"
            style={{ animationDelay: "-3.5s" }}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-white/10">
              <CalendarCheck size={17} />
            </span>
            <div>
              <p className="text-xs text-white/60">Departing this week</p>
              <p className="text-sm font-bold">12 bookings, all confirmed</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
