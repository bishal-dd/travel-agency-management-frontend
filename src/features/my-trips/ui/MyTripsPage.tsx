"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCan } from "@/src/lib/useCan";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlaneLanding,
  UserRoundX,
} from "lucide-react";
import { useMyTrips } from "../hooks/useMyTrips";
import type { MyTripListItem, TeamMate, TripPhase } from "../types/myTrip";
import {
  KIND_ICON,
  KIND_LABEL,
  PhaseBadge,
  SkeletonRows,
  formatRange,
  relativeDay,
  useBhutanToday,
} from "../../trips/ui/parts";

export const myTripHref = (bookingId: string) =>
  `/dashboard/my-trips/${bookingId}`;

type Tab = Exclude<TripPhase, "in_country">;
const TABS: { id: Tab; label: string; empty: string }[] = [
  {
    id: "upcoming",
    label: "Upcoming",
    empty:
      "No upcoming trips. When the office assigns you to a confirmed booking, it shows up here.",
  },
  { id: "completed", label: "Completed", empty: "No completed trips yet." },
];

function Mates({ crew }: { crew: TeamMate[] }) {
  if (crew.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {crew.map((c) => {
        const Icon = KIND_ICON[c.kind];
        return (
          <li
            key={`${c.kind}:${c.name}`}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-mist px-1.5 py-0.5 text-xs text-ink"
          >
            <Icon
              size={12}
              aria-hidden="true"
              className="shrink-0 text-ink-soft"
            />
            <span className="sr-only">{KIND_LABEL[c.kind]}:</span>
            <span className="truncate">{c.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** "All 4 days" or "3 of 4 days". */
const myShare = (t: MyTripListItem) =>
  t.myDates.length >= t.totalDays
    ? `All ${t.totalDays} day${t.totalDays === 1 ? "" : "s"}`
    : `You're on ${t.myDates.length} of ${t.totalDays} days`;

function whenLabel(t: MyTripListItem, today: string | null) {
  if (!today) return null;
  if (t.phase === "upcoming")
    return `Starts ${relativeDay(today, t.startDate)}`;
  if (t.phase === "completed") return `Ended ${relativeDay(today, t.endDate)}`;
  return null;
}

function TripCard({
  t,
  today,
  now,
}: {
  t: MyTripListItem;
  today: string | null;
  now?: boolean;
}) {
  const when = whenLabel(t, today);
  const arrival = [t.arrivalFlight, t.arrivalTime && `lands ${t.arrivalTime}`]
    .filter(Boolean)
    .join(", ");
  return (
    <li
      className={`relative rounded-2xl border bg-white p-4 transition-colors sm:p-5 ${
        now ? "border-ink shadow-sm" : "border-line hover:border-ink/30"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <Link
            href={myTripHref(t.bookingId)}
            className="font-semibold text-ink after:absolute after:inset-0 hover:text-lagoon-deep"
          >
            {t.title}
          </Link>
          <p className="truncate text-xs text-ink-soft">
            {t.reference} · {t.pax} guest{t.pax === 1 ? "" : "s"}
            {t.customerName !== t.title ? ` · ${t.customerName}` : ""}
          </p>
        </div>
        {t.phase === "in_country" ? (
          <PhaseBadge
            phase={t.phase}
            day={{ current: t.currentDay, total: t.totalDays }}
          />
        ) : (
          when && (
            <span className="whitespace-nowrap text-xs font-medium text-ink-soft">
              {when}
            </span>
          )
        )}
      </div>

      <p className="mt-3 text-sm text-ink">
        {formatRange(t.startDate, t.endDate)}
        <span className="text-ink-soft"> · {myShare(t)}</span>
      </p>
      {now && !t.workingToday && (
        <p className="mt-1 text-xs font-medium text-ink-soft">
          You&apos;re not guiding today.
        </p>
      )}

      {(t.pickupPoint || arrival) && t.phase === "upcoming" && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          {t.pickupPoint && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} aria-hidden="true" /> Pick up at {t.pickupPoint}
            </span>
          )}
          {arrival && (
            <span className="inline-flex items-center gap-1">
              <PlaneLanding size={12} aria-hidden="true" /> {arrival}
            </span>
          )}
        </p>
      )}

      {t.crew.length > 0 && (
        <div className="mt-3">
          <Mates crew={t.crew} />
        </div>
      )}
    </li>
  );
}

function NotLinked({ email }: { email: string | null }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center">
      <UserRoundX
        size={28}
        aria-hidden="true"
        className="mx-auto text-ink-soft"
      />
      <h2 className="mt-3 font-semibold text-ink">
        Your account isn&apos;t linked to a guide profile
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
        Ask your manager to put{" "}
        {email ? (
          <strong className="font-semibold text-ink">{email}</strong>
        ) : (
          "your email"
        )}{" "}
        as the email on your guide profile. Your trips show up here as soon as
        it matches.
      </p>
    </div>
  );
}

function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
      <span>
        Page {page} of {pages} · {total} trips
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
          className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
          className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

const errorText = (error: Error) =>
  (error as { status?: number }).status === 403
    ? "This page is for guides."
    : `Couldn't load your trips: ${error.message}`;

function TripList({ phase, today }: { phase: Tab; today: string | null }) {
  const [page, setPage] = useState(1);
  const { data, isPending, error, isPlaceholderData } = useMyTrips({
    phase,
    page,
    limit: 10,
  });
  const empty = TABS.find((t) => t.id === phase)!.empty;

  if (isPending) return <SkeletonRows rows={3} />;
  if (error) return <p className="text-sm text-red-700">{errorText(error)}</p>;
  if (!data.linked) return null; // shown once, at the top of the page
  if (data.data.length === 0)
    return (
      <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-ink-soft">
        {empty}
      </p>
    );

  return (
    <div
      className={`transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
    >
      <ul className="grid gap-3 lg:grid-cols-2">
        {data.data.map((t) => (
          <TripCard key={t.bookingId} t={t} today={today} />
        ))}
      </ul>
      <Pager
        page={page}
        pages={data.pagination.totalPages}
        total={data.pagination.total}
        onPage={setPage}
      />
    </div>
  );
}

/** /dashboard/my-trips: the trips the signed-in guide is assigned to. Read-only. */
export function MyTripsPage() {
  const router = useRouter();
  const { can, ready } = useCan();
  // Only guides use this page; anyone else (owner, staff…) goes to the overview.
  const isGuide =
    ready && can({ myTrips: ["read"] }) && !can({ booking: ["read"] });

  useEffect(() => {
    if (ready && !isGuide) router.replace("/dashboard");
  }, [ready, isGuide, router]);

  if (!isGuide) return <SkeletonRows rows={3} />;
  return <GuideTrips />;
}

function GuideTrips() {
  const today = useBhutanToday();
  const [tab, setTab] = useState<Tab>("upcoming");
  const now = useMyTrips({ phase: "in_country", limit: 10 });

  const firstName = now.data?.guide?.name.split(" ")[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {firstName ? `Your trips, ${firstName}` : "Your trips"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          The trips the office has assigned you to, with the day plan, hotels
          and who you&apos;re working with.
        </p>
      </div>

      {now.error ? (
        <p className="text-sm text-red-700">{errorText(now.error)}</p>
      ) : now.data && !now.data.linked ? (
        <NotLinked email={now.data.email} />
      ) : (
        <>
          {now.data && now.data.data.length > 0 && (
            <section aria-labelledby="now-heading" className="mb-8">
              <h2 id="now-heading" className="mb-3 font-semibold text-ink">
                On tour now
              </h2>
              <ul className="grid gap-3 lg:grid-cols-2">
                {now.data.data.map((t) => (
                  <TripCard key={t.bookingId} t={t} today={today} now />
                ))}
              </ul>
            </section>
          )}

          <div
            role="tablist"
            aria-label="Trips"
            className="mb-4 flex gap-1 border-b border-line"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="tabpanel">
            <TripList key={tab} phase={tab} today={today} />
          </div>
        </>
      )}
    </div>
  );
}
