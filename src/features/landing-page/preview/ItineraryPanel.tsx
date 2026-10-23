import {
  BedDouble,
  Camera,
  Plane,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const days: {
  day: string;
  place: string;
  items: { icon: LucideIcon; time: string; text: string }[];
}[] = [
  {
    day: "Day 1",
    place: "Paro to Thimphu",
    items: [
      {
        icon: Plane,
        time: "09:40",
        text: "Arrive at Paro International Airport",
      },
      {
        icon: BedDouble,
        time: "13:00",
        text: "Hotel check-in and welcome lunch in Thimphu",
      },
      {
        icon: Camera,
        time: "15:30",
        text: "Visit Buddha Dordenma and enjoy valley views",
      },
    ],
  },
  {
    day: "Day 2",
    place: "Thimphu",
    items: [
      {
        icon: Camera,
        time: "09:00",
        text: "Explore Tashichho Dzong and local landmarks",
      },
      {
        icon: Utensils,
        time: "12:30",
        text: "Traditional Bhutanese lunch",
      },
      {
        icon: Camera,
        time: "14:30",
        text: "Visit the National Memorial Chorten and local markets",
      },
    ],
  },
];

export function ItineraryPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
      <div className="rounded-xl bg-white p-5 ring-1 ring-line">
        <p className="text-xs font-semibold text-lagoon">
          Itinerary for Emma Wilson
        </p>
        <h3 className="font-display mt-1 text-2xl font-medium">
          Bhutan Cultural Tour, 7 days
        </h3>

        <ol className="mt-6 space-y-6">
          {days.map((d) => (
            <li key={d.day} className="relative pl-6">
              <span className="absolute top-1.5 left-0 size-2.5 rounded-full bg-lagoon ring-4 ring-lagoon-tint" />
              <span className="absolute top-5 bottom-[-1.5rem] left-[4.5px] w-px bg-line" />
              <p className="text-sm font-bold">
                {d.day}{" "}
                <span className="font-medium text-ink-soft">{d.place}</span>
              </p>
              <ul className="mt-2.5 space-y-2">
                {d.items.map((it) => (
                  <li
                    key={it.text}
                    className="flex items-center gap-3 rounded-lg bg-mist px-3 py-2.5 text-sm"
                  >
                    <it.icon size={15} className="shrink-0 text-lagoon" />
                    <span className="w-10 shrink-0 text-xs text-ink-soft tabular-nums">
                      {it.time}
                    </span>
                    <span className="min-w-0">{it.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <aside className="space-y-3">
        <div className="rounded-xl bg-white p-4 ring-1 ring-line">
          <h4 className="text-sm font-bold">Trip summary</h4>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Travellers", "2 adults"],
              ["Dates", "14 to 20 Nov"],
              ["Hotels", "3 properties"],
              ["Activities", "12 planned"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-xl bg-lagoon p-4 text-white">
          <p className="text-sm font-bold">Ready to send</p>
          <p className="mt-1 text-sm text-white/75">
            Share as a branded web page or PDF with your agency logo.
          </p>
        </div>
      </aside>
    </div>
  );
}
