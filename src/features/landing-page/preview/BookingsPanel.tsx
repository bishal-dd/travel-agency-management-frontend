const stats = [
  { label: "Departing this week", value: "12" },
  { label: "Awaiting deposit", value: "5" },
  { label: "Quotes to follow up", value: "8" },
  { label: "Booked this month", value: "$148,300" },
];

const rows = [
  { ref: "TD-2041", who: "Amara Okafor", trip: "Kyoto in autumn", date: "14 Oct", pax: 2, status: "Confirmed", value: "$6,480" },
  { ref: "TD-2042", who: "Jonas Lindqvist", trip: "Marrakech weekend", date: "18 Oct", pax: 4, status: "Awaiting deposit", value: "$3,920" },
  { ref: "TD-2043", who: "Priya Raman", trip: "Maldives honeymoon", date: "02 Nov", pax: 2, status: "Confirmed", value: "$11,250" },
  { ref: "TD-2044", who: "Daniel Mensah", trip: "Patagonia trek", date: "09 Nov", pax: 6, status: "Quote sent", value: "$19,800" },
  { ref: "TD-2045", who: "Sofia Marchetti", trip: "Amalfi coast drive", date: "21 Nov", pax: 2, status: "Confirmed", value: "$5,140" },
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
          <div key={s.label} className="rounded-xl bg-white p-4 ring-1 ring-line">
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
                {["Ref", "Customer", "Trip", "Departs", "Travellers", "Status", "Value"].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 font-medium ${i === 6 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ref} className="border-t border-line">
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft tabular-nums">{r.ref}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{r.who}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.trip}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">{r.date}</td>
                  <td className="px-4 py-3 tabular-nums">{r.pax}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
