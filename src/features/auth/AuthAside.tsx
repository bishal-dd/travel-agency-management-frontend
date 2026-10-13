import { CalendarCheck, CreditCard, FileText, Quote } from "lucide-react";

const today = [
  { icon: CalendarCheck, label: "Departing this week", value: "12 bookings" },
  { icon: CreditCard, label: "Collected in October", value: "$96,410" },
  { icon: FileText, label: "Documents filed", value: "348" },
];

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-lagoon-deep text-white lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-16">
      {/* Contour lines */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_100%_0%,transparent_0_44px,rgb(255_255_255/0.05)_44px_45px)]"
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-ink shadow-deep">
        <p className="text-xs font-semibold text-lagoon">Your agency today</p>
        <svg viewBox="0 0 400 110" className="mt-4 block w-full rounded-2xl bg-mist" aria-hidden="true">
          <path
            d="M-10 90 C60 60 70 105 130 80 S220 20 260 45 330 40 410 5 V120 H-10Z"
            className="fill-lagoon-tint"
          />
          <path
            d="M48 80 C100 35 150 92 200 55 S300 48 348 24"
            pathLength={1}
            fill="none"
            className="animate-draw stroke-lagoon"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1"
          />
          <circle cx="48" cy="80" r="5" className="fill-lagoon" />
          <circle cx="200" cy="55" r="5" className="fill-lagoon" />
          <circle cx="348" cy="24" r="5" className="fill-marigold" />
        </svg>
        <ul className="mt-5 divide-y divide-line">
          {today.map((t) => (
            <li key={t.label} className="flex items-center gap-3 py-3 last:pb-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lagoon-tint text-lagoon-deep">
                <t.icon size={16} />
              </span>
              <span className="flex-1 text-sm text-ink-soft">{t.label}</span>
              <span className="text-sm font-bold tabular-nums">{t.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <figure className="relative mt-12 max-w-lg">
        <Quote size={28} className="text-marigold" aria-hidden="true" />
        <blockquote className="font-display mt-5 text-[1.75rem] leading-snug font-medium">
          Now I open one screen, see who owes what, and get back to planning trips.
        </blockquote>
        <figcaption className="mt-5 text-sm text-white/70">
          <span className="font-bold text-white">Elena Vasquez</span>, Founder, Meridian
          Travel Co.
        </figcaption>
      </figure>
    </aside>
  );
}
