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

const perks = [
  "Early access updates",
  "Built for travel agencies",
  "All your operations in one place",
];

function ItineraryCard() {
  return (
    <div className="relative w-full max-w-md rounded-2xl bg-white p-4 shadow-deep ring-1 ring-line sm:rounded-3xl sm:p-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-lagoon">Tour package</p>

          <p className="font-display mt-1 text-xl leading-tight font-medium sm:text-2xl">
            Bhutan Highlights, 7 days
          </p>

          <p className="mt-1 text-sm text-ink-soft">
            Sharma family, 4 travellers
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lagoon-tint px-2 py-1 text-[11px] font-semibold text-lagoon-deep sm:px-2.5 sm:text-xs">
          <Check size={13} strokeWidth={3} /> Confirmed
        </span>
      </div>

      {/* Route map */}
      <div className="relative mt-4 overflow-hidden rounded-xl bg-mist sm:mt-5 sm:rounded-2xl">
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

      <ol className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
        {stops.map((s) => (
          <li
            key={s.day}
            className="flex items-start gap-2.5 sm:items-center sm:gap-3"
          >
            <span className="w-11 shrink-0 pt-0.5 text-xs font-semibold text-ink-soft sm:w-12 sm:pt-0">
              {s.day}
            </span>
            <MapPin size={15} className="mt-0.5 shrink-0 text-lagoon sm:mt-0" />
            {/* Stacks on phones so the note isn't cut off; single truncated line from sm up */}
            <span className="min-w-0 text-sm sm:truncate">
              <span className="block font-semibold sm:inline">{s.place}</span>
              <span className="hidden text-ink-soft sm:inline">, </span>
              <span className="block text-ink-soft sm:inline">{s.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-line pt-4 sm:mt-5">
        <div className="flex min-w-0 items-center gap-2 text-sm text-ink-soft">
          <FileText size={15} className="shrink-0" />
          <span className="truncate">6 documents attached</span>
        </div>

        <p className="shrink-0 text-sm font-bold tabular-nums">Nu. 85,000</p>
      </div>
    </div>
  );
}

function PaymentChip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-lift ring-1 ring-line ${className}`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-marigold-tint text-ink">
        <CreditCard size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-soft">Payment received</p>
        <p className="text-sm font-bold tabular-nums">Nu. 25,000</p>
      </div>
    </div>
  );
}

function DepartingChip({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-ink p-3 pr-4 text-white shadow-lift ${className}`}
      style={style}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
        <CalendarCheck size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-white/60">Departing this week</p>
        <p className="text-sm font-bold">12 bookings, all confirmed</p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="contours relative overflow-hidden pt-24 pb-14 sm:pt-40 sm:pb-28"
    >
      <Container className="grid items-center gap-12 sm:gap-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="min-w-0">
          <h1 className="font-display animate-rise text-[2.25rem] leading-[1.05] font-medium text-balance text-ink min-[400px]:text-[2.6rem] sm:text-6xl sm:leading-[1.02] lg:text-[4.25rem]">
            Run your whole travel agency from one desk.
          </h1>
          <p
            className="animate-rise mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:mt-6 sm:text-xl"
            style={{ animationDelay: "120ms" }}
          >
            Help Make Travel keeps customers, bookings, tour packages,
            itineraries, payments and documents in one place, so your team
            spends the day selling trips instead of chasing spreadsheets.
          </p>

          <div
            className="animate-rise mt-7 sm:mt-8"
            style={{ animationDelay: "240ms" }}
          >
            <WaitlistForm />
          </div>

          <ul
            className="animate-rise mt-6 flex flex-col gap-2 text-sm text-ink-soft sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-x-6"
            style={{ animationDelay: "340ms" }}
          >
            {perks.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check
                  size={15}
                  strokeWidth={3}
                  className="shrink-0 text-lagoon"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-rise relative mx-auto w-full max-w-md lg:mr-0"
          style={{ animationDelay: "300ms" }}
        >
          <ItineraryCard />

          {/* Floating chips: tablet and up */}
          <PaymentChip className="animate-bob absolute -top-12 right-0 hidden sm:flex lg:-right-8" />
          <DepartingChip
            className="animate-bob absolute -bottom-12 left-0 hidden sm:flex lg:-left-10"
            style={{ animationDelay: "-3.5s" }}
          />

          {/* Phones: same chips in normal flow below the card */}
          <div className="mt-3 grid gap-3 sm:hidden">
            <PaymentChip />
            <DepartingChip />
          </div>
        </div>
      </Container>
    </section>
  );
}
