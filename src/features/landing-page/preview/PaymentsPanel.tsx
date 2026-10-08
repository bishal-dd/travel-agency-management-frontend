const months = [
  { m: "May", v: 52 },
  { m: "Jun", v: 68 },
  { m: "Jul", v: 91 },
  { m: "Aug", v: 84 },
  { m: "Sep", v: 73 },
  { m: "Oct", v: 100 },
];

const invoices = [
  { who: "Priya Raman", trip: "Maldives honeymoon", paid: 100, due: "Paid in full", tone: "text-lagoon-deep" },
  { who: "Amara Okafor", trip: "Kyoto in autumn", paid: 60, due: "$2,592 due 30 Sep", tone: "text-ink-soft" },
  { who: "Jonas Lindqvist", trip: "Marrakech weekend", paid: 0, due: "Deposit overdue 3 days", tone: "text-red-700" },
  { who: "Daniel Mensah", trip: "Patagonia trek", paid: 25, due: "$14,850 due 15 Oct", tone: "text-ink-soft" },
];

export function PaymentsPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
      <div className="rounded-xl bg-white p-5 ring-1 ring-line">
        <p className="text-xs text-ink-soft">Collected in October</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">$96,410</p>
        <p className="mt-1 text-sm text-ink-soft">$51,890 still outstanding</p>

        <div className="mt-6 flex h-40 items-end gap-2.5" role="img" aria-label="Payments collected per month, May to October, rising to a peak in October">
          {months.map((b, i) => (
            <div key={b.m} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div
                className={`rounded-t-md ${i === months.length - 1 ? "bg-lagoon" : "bg-lagoon-tint"}`}
                style={{ height: `${b.v}%` }}
              />
              <span className="text-center text-xs text-ink-soft">{b.m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white ring-1 ring-line">
        <h3 className="border-b border-line px-4 py-3 text-sm font-bold">Balances by booking</h3>
        <ul>
          {invoices.map((inv) => (
            <li key={inv.who} className="border-b border-line px-4 py-3.5 last:border-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-semibold">
                  {inv.who} <span className="font-normal text-ink-soft">{inv.trip}</span>
                </p>
                <p className={`shrink-0 text-xs font-semibold ${inv.tone}`}>{inv.due}</p>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-lagoon" style={{ width: `${inv.paid}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
