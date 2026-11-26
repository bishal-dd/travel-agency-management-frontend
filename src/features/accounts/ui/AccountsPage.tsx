"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import { methodLabel } from "../../payments/types/payment";
import { formatPrice } from "@/src/lib/format";
import { useCan } from "@/src/lib/useCan";
import { useAccountsSummary, useTransactions } from "../hooks/useAccounts";
import {
  categoryLabel,
  supplierLabel,
  type AccountSupplier,
  type AccountsSummary,
  type Period,
  type SupplierType,
  type Transaction,
} from "../types/accounts";
import {
  SupplierPaymentDialog,
  VoidSupplierPaymentDialog,
  bhutanToday,
  type PayPreset,
} from "./AccountDialogs";

const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();
const btn = (amount: string) => formatPrice(amount, "BTN");

// ---------- period ----------

type Preset =
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "custom";
const PRESETS: { id: Preset; label: string }[] = [
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_year", label: "This year" },
  { id: "last_year", label: "Last year" },
  { id: "custom", label: "Custom" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const lastDayOf = (y: number, m: number) =>
  new Date(Date.UTC(y, m, 0)).getUTCDate();

function presetPeriod(
  preset: Exclude<Preset, "custom">,
  today: string,
): Period {
  const [y, m] = today.split("-").map(Number) as [number, number];
  switch (preset) {
    case "this_month":
      return {
        from: `${y}-${pad(m)}-01`,
        to: `${y}-${pad(m)}-${pad(lastDayOf(y, m))}`,
      };
    case "last_month": {
      const ly = m === 1 ? y - 1 : y;
      const lm = m === 1 ? 12 : m - 1;
      return {
        from: `${ly}-${pad(lm)}-01`,
        to: `${ly}-${pad(lm)}-${pad(lastDayOf(ly, lm))}`,
      };
    }
    case "this_year":
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    case "last_year":
      return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
  }
}

const fmtDay = (iso: string, withYear = true) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
const fmtRange = (p: Period) =>
  p.from.slice(0, 4) === p.to.slice(0, 4)
    ? `${fmtDay(p.from, false)} – ${fmtDay(p.to)}`
    : `${fmtDay(p.from)} – ${fmtDay(p.to)}`;

function PeriodPicker({
  preset,
  period,
  onPreset,
  onCustom,
}: {
  preset: Preset;
  period: Period;
  onPreset: (p: Preset) => void;
  onCustom: (p: Period) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div
        role="radiogroup"
        aria-label="Period"
        className="flex flex-wrap gap-1 rounded-full bg-mist/70 p-1"
      >
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={preset === p.id}
            onClick={() => onPreset(p.id)}
            className={`h-8 rounded-full px-3.5 text-sm font-medium transition-colors ${
              preset === p.id
                ? "bg-white text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="From"
            value={period.from}
            max={period.to}
            onChange={(e) =>
              e.target.value && onCustom({ ...period, from: e.target.value })
            }
            className={`${sizedInputCls} w-full sm:w-40`}
          />
          <span className="text-sm text-ink-soft">to</span>
          <input
            type="date"
            aria-label="To"
            value={period.to}
            min={period.from}
            onChange={(e) =>
              e.target.value && onCustom({ ...period, to: e.target.value })
            }
            className={`${sizedInputCls} w-full sm:w-40`}
          />
        </div>
      ) : (
        <p className="text-sm text-ink-soft">{fmtRange(period)}</p>
      )}
    </div>
  );
}

// ---------- figures ----------

function Figure({
  label,
  value,
  note,
  tone = "plain",
  icon: Icon,
}: {
  label: string;
  value: string;
  note?: React.ReactNode;
  tone?: "plain" | "good" | "bad";
  icon?: typeof ArrowDownLeft;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        {Icon && <Icon size={15} aria-hidden="true" />}
        {label}
      </p>
      <p
        className={`mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight tabular-nums ${
          tone === "good"
            ? "text-emerald-700"
            : tone === "bad"
              ? "text-red-700"
              : "text-ink"
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

function CashFigures({ s }: { s: AccountsSummary }) {
  const net = Number(s.cash.net);
  return (
    <section aria-labelledby="cash-h" className="mb-8">
      <h2 id="cash-h" className="mb-3 font-semibold text-ink">
        Money that moved
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <Figure
          icon={ArrowDownLeft}
          label="Money in"
          value={btn(s.cash.in)}
          note={`${s.cash.customerPayments} customer payment${s.cash.customerPayments === 1 ? "" : "s"}`}
        />
        <Figure
          icon={ArrowUpRight}
          label="Money out"
          value={btn(s.cash.out)}
          note={
            Number(s.cash.refunds) > 0
              ? `${btn(s.cash.paidToSuppliers)} to suppliers · ${btn(s.cash.refunds)} refunds`
              : "Paid to suppliers and others"
          }
        />
        <Figure
          label={net >= 0 ? "Net: more in than out" : "Net: more out than in"}
          value={`${net > 0 ? "+" : net < 0 ? "−" : ""}${btn(String(Math.abs(net)))}`}
          tone={net > 0 ? "good" : net < 0 ? "bad" : "plain"}
          note="Money in minus money out"
        />
      </div>
    </section>
  );
}

function TripFigures({ s }: { s: AccountsSummary }) {
  const t = s.trips;
  return (
    <section
      aria-labelledby="trips-h"
      className="mb-8 rounded-2xl border border-line bg-white"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
        <h2 id="trips-h" className="font-semibold text-ink">
          Trips starting in this period
        </h2>
        <p className="text-sm text-ink-soft">
          {t.count} trip{t.count === 1 ? "" : "s"} · from confirmed bookings
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
        {[
          {
            label: "Sales",
            value: btn(t.revenue),
            note: "Trip prices, without GST",
          },
          {
            label: "Costs",
            value: btn(t.cost),
            note: "Hotels, guides, transport, services",
          },
          {
            label: "Profit",
            value: btn(t.profit),
            note: t.margin == null ? "—" : `${t.margin}% of sales`,
            tone: Number(t.profit) < 0 ? "text-red-700" : "text-emerald-700",
          },
        ].map((f) => (
          <div
            key={f.label}
            className="bg-white px-5 py-4 last:col-span-2 sm:last:col-span-1"
          >
            <dt className="text-sm text-ink-soft">{f.label}</dt>
            <dd
              className={`mt-1 text-xl font-bold tabular-nums ${f.tone ?? "text-ink"}`}
            >
              {f.value}
            </dd>
            <dd className="text-xs text-ink-soft">{f.note}</dd>
          </div>
        ))}
      </dl>
      {Number(t.governmentFees) > 0 && (
        <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">
          Also collected {btn(t.governmentFees)} in SDF and visa fees. You pass
          these on to the government, so they aren&apos;t counted as sales or
          costs.
        </p>
      )}
    </section>
  );
}

function Categories({ s }: { s: AccountsSummary }) {
  const rows = s.categories.filter(
    (c) => Number(c.cost) > 0 || Number(c.paid) > 0,
  );
  const max = Math.max(
    1,
    ...rows.map((c) => Math.max(Number(c.cost), Number(c.paid))),
  );
  return (
    <section
      aria-labelledby="cat-h"
      className="rounded-2xl border border-line bg-white"
    >
      <div className="border-b border-line px-5 py-4">
        <h2 id="cat-h" className="font-semibold text-ink">
          Where the money goes
        </h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-lagoon" aria-hidden="true" />{" "}
            Trip costs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-3 rounded-sm bg-marigold"
              aria-hidden="true"
            />{" "}
            Paid this period
          </span>
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-soft">
          No costs or payments in this period.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((c) => (
            <li key={c.type} className="px-5 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-medium text-ink">
                  {categoryLabel(c.type)}
                </span>
                <span className="text-xs tabular-nums text-ink-soft">
                  <span className="text-ink">{btn(c.cost)}</span> costs ·{" "}
                  <span className="text-ink">{btn(c.paid)}</span> paid
                </span>
              </div>
              <div className="mt-2 space-y-1" aria-hidden="true">
                <div
                  className="h-2 rounded-full bg-lagoon"
                  style={{
                    width: `${(Number(c.cost) / max) * 100}%`,
                    minWidth: Number(c.cost) ? 4 : 0,
                  }}
                />
                <div
                  className="h-2 rounded-full bg-marigold"
                  style={{
                    width: `${(Number(c.paid) / max) * 100}%`,
                    minWidth: Number(c.paid) ? 4 : 0,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Owed({ s }: { s: AccountSupplier }) {
  if (s.owed == null) return <span className="text-ink-soft">—</span>;
  const n = Number(s.owed);
  if (n === 0)
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <Check size={13} aria-hidden="true" /> Settled
      </span>
    );
  if (n < 0)
    return <span className="text-ink-soft">{btn(String(-n))} paid ahead</span>;
  return <span className="font-semibold text-ink">{btn(s.owed)}</span>;
}

function Suppliers({
  s,
  canPay,
  onPay,
}: {
  s: AccountsSummary;
  canPay: boolean;
  onPay: (p: PayPreset) => void;
}) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const [type, setType] = useState<SupplierType | "">("");
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return s.suppliers.filter(
      (x) =>
        (!type || x.type === type) &&
        (!needle || x.name.toLowerCase().includes(needle)),
    );
  }, [s.suppliers, q, type]);
  const shown = all ? list : list.slice(0, 8);
  const types = [...new Set(s.suppliers.map((x) => x.type))];

  return (
    <section
      aria-labelledby="sup-h"
      className="rounded-2xl border border-line bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 id="sup-h" className="font-semibold text-ink">
            Suppliers
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Still to pay:{" "}
            <strong className="font-semibold text-ink">
              {btn(s.stillToPay)}
            </strong>{" "}
            for trips up to {fmtDay(s.period.to)}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              type="search"
              aria-label="Search suppliers"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className={`${inputCls} pl-9`}
            />
          </div>
          {types.length > 1 && (
            <select
              aria-label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as SupplierType | "")}
              className={`${sizedInputCls} w-32`}
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {categoryLabel(t)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-soft">
          {s.suppliers.length === 0
            ? "No supplier costs or payments yet. Costs come from the cost prices on your bookings."
            : "No suppliers match."}
        </p>
      ) : (
        <>
          <table className="hidden w-full text-sm md:table">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-soft">
                <th scope="col" className="px-5 py-2.5 font-medium">
                  Supplier
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">
                  Trip costs
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">
                  Paid this period
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">
                  Still owed
                </th>
                {canPay && (
                  <th scope="col" className="w-20 px-3 py-2.5">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((x) => (
                <tr key={x.key}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{x.name}</p>
                    <p className="text-xs text-ink-soft">
                      {supplierLabel(x.type)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink">
                    {Number(x.cost) ? btn(x.cost) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink">
                    {Number(x.paid) ? btn(x.paid) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    <Owed s={x} />
                  </td>
                  {canPay && (
                    <td className="px-3 py-3 text-right">
                      <PayButton x={x} onPay={onPay} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-line md:hidden">
            {shown.map((x) => (
              <li
                key={x.key}
                className="flex items-start justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{x.name}</p>
                  <p className="text-xs text-ink-soft">
                    {supplierLabel(x.type)} · costs{" "}
                    {Number(x.cost) ? btn(x.cost) : "—"} · paid{" "}
                    {Number(x.paid) ? btn(x.paid) : "—"}
                  </p>
                  <p className="mt-1 text-sm tabular-nums">
                    <span className="text-ink-soft">Owed </span>
                    <Owed s={x} />
                  </p>
                </div>
                {canPay && <PayButton x={x} onPay={onPay} />}
              </li>
            ))}
          </ul>

          {list.length > 8 && (
            <div className="border-t border-line px-5 py-3">
              <button
                type="button"
                onClick={() => setAll((v) => !v)}
                className="text-sm font-semibold text-lagoon-deep hover:underline"
              >
                {all ? "Show fewer" : `Show all ${list.length}`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function PayButton({
  x,
  onPay,
}: {
  x: AccountSupplier;
  onPay: (p: PayPreset) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onPay({
          supplierType: x.type,
          supplierId: x.id,
          name: x.name,
          amount: x.owed && Number(x.owed) > 0 ? x.owed : undefined,
        })
      }
      aria-label={`Record a payment to ${x.name}`}
      className="inline-flex h-8 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
    >
      Pay
    </button>
  );
}

// ---------- transactions ----------

const TX_TABS: { id: "" | "in" | "out"; label: string }[] = [
  { id: "", label: "All" },
  { id: "in", label: "Money in" },
  { id: "out", label: "Money out" },
];

const txCategory = (t: Transaction) =>
  t.category === "customer"
    ? "Customer payment"
    : t.category === "refund"
      ? "Refund"
      : supplierLabel(t.category);

function Transactions({
  period,
  canVoid,
  onVoid,
}: {
  period: Period;
  canVoid: boolean;
  onVoid: (t: Transaction) => void;
}) {
  const [direction, setDirection] = useState<"" | "in" | "out">("");
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState("");
  const key = `${period.from}|${period.to}|${direction}`;
  // Back to page 1 when the period or tab changes.
  if (key !== lastKey) {
    setLastKey(key);
    if (page !== 1) setPage(1);
  }
  const { data, isPending, isPlaceholderData, error } = useTransactions({
    ...period,
    direction: direction || undefined,
    page,
    limit: 20,
  });

  return (
    <section
      aria-labelledby="tx-h"
      className="rounded-2xl border border-line bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 id="tx-h" className="font-semibold text-ink">
          Transactions
        </h2>
        <div
          role="tablist"
          aria-label="Direction"
          className="flex gap-1 rounded-full bg-mist/70 p-1"
        >
          {TX_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={direction === t.id}
              onClick={() => setDirection(t.id)}
              className={`h-7 rounded-full px-3 text-sm font-medium ${direction === t.id ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <div className="space-y-2 p-5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-mist/70" />
          ))}
        </div>
      ) : error ? (
        <p className="px-5 py-8 text-center text-sm text-red-700">
          Couldn&apos;t load transactions: {error.message}
        </p>
      ) : data.data.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-soft">
          Nothing recorded in this period.
        </p>
      ) : (
        <ul
          className={`divide-y divide-line transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          {data.data.map((t) => {
            const isIn = t.direction === "in";
            const foreign = t.currency !== "BTN";
            return (
              <li
                key={`${t.source}:${t.id}`}
                className={`flex items-start gap-3 px-5 py-3 ${t.voided ? "opacity-60" : ""}`}
              >
                <span
                  className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${isIn ? "bg-emerald-50 text-emerald-700" : "bg-mist text-ink"}`}
                  aria-hidden="true"
                >
                  {isIn ? (
                    <ArrowDownLeft size={15} />
                  ) : (
                    <ArrowUpRight size={15} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium text-ink ${t.voided ? "line-through" : ""}`}
                  >
                    {t.description}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {fmtDay(t.date)} · {txCategory(t)} · {methodLabel(t.method)}
                    {t.booking && (
                      <>
                        {" · "}
                        <Link
                          href={`/dashboard/bookings/${t.booking.id}`}
                          className="font-medium text-lagoon-deep hover:underline"
                        >
                          {t.booking.reference}
                        </Link>
                      </>
                    )}
                    {t.reference && ` · Ref ${t.reference}`}
                  </p>
                  {t.voided && (
                    <p className="text-xs text-red-700">
                      Voided{t.voidReason ? `: ${t.voidReason}` : ""}
                    </p>
                  )}
                  {t.notes && !t.voided && (
                    <p className="mt-0.5 text-xs text-ink-soft">{t.notes}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold tabular-nums ${t.voided ? "line-through" : ""} ${isIn ? "text-emerald-700" : "text-ink"}`}
                  >
                    {isIn ? "+" : "−"}
                    {btn(t.btnAmount)}
                  </p>
                  {foreign && (
                    <p className="text-xs tabular-nums text-ink-soft">
                      {formatPrice(t.amount, t.currency)}
                    </p>
                  )}
                  {canVoid && t.source === "supplier" && !t.voided && (
                    <button
                      type="button"
                      onClick={() => onVoid(t)}
                      className="mt-0.5 text-xs font-medium text-ink-soft hover:text-red-700"
                    >
                      Void
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-ink-soft">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} ·{" "}
            {data.pagination.total} transactions
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- page ----------

function Skeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist/70" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-mist/70" />
    </div>
  );
}

/** /dashboard/accounts: money in and out, trip profit and what's owed to suppliers, in BTN. */
export function AccountsPage() {
  const { can, ready } = useCan();
  // Today is read in the browser only (not while prerendering): until then, a placeholder.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(bhutanToday()), []);
  const [preset, setPreset] = useState<Preset>("this_month");
  const [custom, setCustom] = useState<Period | null>(null);
  const period: Period | null = !today
    ? null
    : preset === "custom"
      ? (custom ?? presetPeriod("this_month", today))
      : presetPeriod(preset, today);
  const {
    data: s,
    isPending,
    error,
    isPlaceholderData,
  } = useAccountsSummary(period);

  const [paying, setPaying] = useState<PayPreset | null | undefined>(undefined);
  const [voiding, setVoiding] = useState<Transaction | null>(null);
  const canPay = ready && can({ payable: ["create"] });
  const canVoid = ready && can({ payable: ["update"] });

  function choosePreset(p: Preset) {
    if (p === "custom" && preset !== "custom" && period) setCustom(period);
    setPreset(p);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Accounts
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Money in and out, what your trips earned, and what you still owe
            suppliers. All in BTN, using your exchange rates.
          </p>
        </div>
        {canPay && (
          <button
            type="button"
            onClick={() => setPaying(null)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
          >
            <Plus size={16} aria-hidden="true" /> Record payment out
          </button>
        )}
      </div>

      <div className="mb-6 min-h-9">
        {period && (
          <PeriodPicker
            preset={preset}
            period={period}
            onPreset={choosePreset}
            onCustom={setCustom}
          />
        )}
      </div>

      {s && s.missingRates.length > 0 && (
        <p
          role="status"
          className="mb-6 flex items-start gap-2 rounded-xl bg-marigold-tint px-4 py-3 text-sm text-ink"
        >
          <AlertTriangle
            size={16}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>
            No exchange rate for {s.missingRates.join(", ")}, so those amounts
            are left out.{" "}
            <Link
              href="/dashboard/settings/exchange-rates"
              className="font-semibold underline"
            >
              Add the rate
            </Link>
          </span>
        </p>
      )}

      {isPending || !period ? (
        <Skeleton />
      ) : error ? (
        <p className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-soft">
          {(error as { status?: number }).status === 403
            ? "Accounts are for owners, managers and accountants."
            : `Couldn't load the accounts: ${error.message}`}
        </p>
      ) : (
        <div
          className={`transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          <CashFigures s={s} />
          <TripFigures s={s} />
          <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <Categories s={s} />
            <Suppliers s={s} canPay={canPay} onPay={setPaying} />
          </div>
          <Transactions period={period} canVoid={canVoid} onVoid={setVoiding} />
        </div>
      )}

      <SupplierPaymentDialog
        open={paying !== undefined}
        preset={paying}
        onClose={() => setPaying(undefined)}
      />
      <VoidSupplierPaymentDialog
        tx={voiding}
        onClose={() => setVoiding(null)}
      />
    </div>
  );
}
