"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useOverview } from "./hooks/useOverview";
import {
  ActivityFeed,
  ComingUp,
  MonthTiles,
  NeedsAttention,
  TrendChart,
} from "./ui/OverviewSections";

function OverviewSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-mist" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-mist" />
        <div className="h-72 animate-pulse rounded-2xl bg-mist" />
      </div>
    </div>
  );
}

/**
 * The agency's day at a glance: this month's numbers, what needs attention,
 * trips coming up, the six-month trend and recent activity. Money is in BTN
 * and only shown to roles that can see payments.
 */
export function OverviewSections() {
  const { data: o, isPending, error, refetch, isRefetching } = useOverview();

  if (isPending) return <OverviewSkeleton />;
  if (error || !o) {
    return (
      <div className="rounded-2xl border border-line bg-white px-6 py-12 text-center">
        <p className="font-semibold text-ink">
          Couldn&apos;t load the overview
        </p>
        <p className="mt-1 text-sm text-ink-soft">{error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
        >
          <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />{" "}
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {o.missingExchangeRates.length > 0 && (
        <p className="flex items-start gap-2 rounded-xl bg-marigold/15 px-4 py-3 text-sm text-ink">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-marigold"
            aria-hidden="true"
          />
          <span>
            Amounts in {o.missingExchangeRates.join(", ")} aren&apos;t in the{" "}
            {o.currency} totals: there&apos;s no exchange rate.{" "}
            <Link
              href="/dashboard/settings/exchange-rates"
              className="font-semibold text-lagoon-deep hover:underline"
            >
              Add {o.missingExchangeRates.length === 1 ? "it" : "them"}
            </Link>
          </span>
        </p>
      )}

      <MonthTiles o={o} />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <NeedsAttention o={o} />
        <ComingUp o={o} />
      </div>

      <div
        className={`grid items-start gap-5 ${o.trend ? "lg:grid-cols-2" : ""}`}
      >
        {o.trend && <TrendChart o={o} />}
        <ActivityFeed o={o} />
      </div>

      {o.canSeeMoney && (
        <p className="text-xs text-ink-soft">
          All amounts in {o.currency}, converted with your exchange rates.
        </p>
      )}
    </div>
  );
}
