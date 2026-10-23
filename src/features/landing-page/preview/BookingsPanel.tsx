const stats = [
  { label: "Departures this week", value: "12" },
  { label: "Awaiting deposit", value: "5" },
  { label: "Quotes to follow up", value: "8" },
  { label: "Bookings this month", value: "24" },
];

const rows = [
  {
    ref: "HMT-2041",
    who: "Emma Wilson",
    trip: "Bhutan Cultural Tour",
    date: "14 Nov",
    pax: 2,
    status: "Confirmed",
    value: "Nu. 186,000",
  },
  {
    ref: "HMT-2042",
    who: "Tashi Dorji",
    trip: "Bangkok Holiday",
    date: "18 Nov",
    pax: 4,
    status: "Awaiting deposit",
    value: "Nu. 92,000",
  },
  {
    ref: "HMT-2043",
    who: "Priya Sharma",
    trip: "Maldives Honeymoon",
    date: "02 Dec",
    pax: 2,
    status: "Confirmed",
    value: "Nu. 245,000",
  },
  {
    ref: "HMT-2044",
    who: "Daniel Miller",
    trip: "Himalayan Trek",
    date: "09 Dec",
    pax: 6,
    status: "Quote sent",
    value: "Nu. 320,000",
  },
  {
    ref: "HMT-2045",
    who: "Sonam Choden",
    trip: "Singapore Getaway",
    date: "21 Dec",
    pax: 2,
    status: "Confirmed",
    value: "Nu. 118,000",
  },
];

const tone: Record<string, string> = {
  Confirmed: "bg-lagoon-tint text-lagoon-deep",
  "Awaiting deposit": "bg-marigold-tint text-ink",
  "Quote sent": "bg-mist text-ink-soft",
};

export function BookingsPanel() {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white p-4 ring-1 ring-line"
          >
            <dt className="text-xs text-ink-soft">{s.label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h3 className="text-sm font-bold">Upcoming bookings</h3>
          <span className="text-xs text-ink-soft">October to November</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs text-ink-soft">
              <tr>
                {[
                  "Ref",
                  "Customer",
                  "Trip",
                  "Departs",
                  "Travellers",
                  "Status",
                  "Value",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 font-medium ${i === 6 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ref} className="border-t border-line">
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft tabular-nums">
                    {r.ref}
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">
                    {r.who}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.trip}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {r.date}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.pax}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
