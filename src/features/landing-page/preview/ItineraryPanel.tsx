import { BedDouble, Camera, Plane, Utensils, type LucideIcon } from "lucide-react";

const days: { day: string; place: string; items: { icon: LucideIcon; time: string; text: string }[] }[] = [
  {
    day: "Day 1",
    place: "Tokyo to Kyoto",
    items: [
      { icon: Plane, time: "09:40", text: "Arrive Kansai International, private transfer" },
      { icon: BedDouble, time: "14:00", text: "Check in, Hoshinoya Kyoto, river view room" },
      { icon: Utensils, time: "19:00", text: "Kaiseki dinner in Gion" },
    ],
  },
  {
    day: "Day 2",
    place: "Arashiyama",
    items: [
      { icon: Camera, time: "07:30", text: "Bamboo grove before the crowds, with guide" },
      { icon: Utensils, time: "12:30", text: "Lunch at a temple garden restaurant" },
      { icon: Camera, time: "15:00", text: "Tea ceremony and kimono fitting" },
    ],
  },
];

export function ItineraryPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
      <div className="rounded-xl bg-white p-5 ring-1 ring-line">
        <p className="text-xs font-semibold text-lagoon">Itinerary for Amara Okafor</p>
        <h3 className="font-display mt-1 text-2xl font-medium">Kyoto in autumn, 6 days</h3>

        <ol className="mt-6 space-y-6">
          {days.map((d) => (
            <li key={d.day} className="relative pl-6">
              <span className="absolute top-1.5 left-0 size-2.5 rounded-full bg-lagoon ring-4 ring-lagoon-tint" />
              <span className="absolute top-5 bottom-[-1.5rem] left-[4.5px] w-px bg-line" />
              <p className="text-sm font-bold">
                {d.day} <span className="font-medium text-ink-soft">{d.place}</span>
              </p>
              <ul className="mt-2.5 space-y-2">
                {d.items.map((it) => (
                  <li key={it.text} className="flex items-center gap-3 rounded-lg bg-mist px-3 py-2.5 text-sm">
                    <it.icon size={15} className="shrink-0 text-lagoon" />
                    <span className="w-10 shrink-0 text-xs text-ink-soft tabular-nums">{it.time}</span>
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
              ["Dates", "14 to 19 Oct"],
              ["Hotels", "2 properties"],
              ["Activities", "9 booked"],
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
