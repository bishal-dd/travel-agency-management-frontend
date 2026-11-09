"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Globe, Mail, MapPin, Pencil, Phone } from "lucide-react";

import { useHotelById } from "../hooks/useHotelById";
import { HotelFormDialog } from "./HotelFormDialog";
import { StarRatingDisplay, StatusBadge } from "./StatusBadge";
import { AmenitiesSection } from "../../hotel-amenity/ui/AmenitiesSection";
import { RoomsSection } from "../../room/ui/RoomsSection";

/** Prerendered placeholder shown until the hotel ID (and data) is available. */
export function HotelDetailSkeleton() {
  return (
    <div aria-label="Loading hotel">
      <div className="mb-5 h-5 w-20 animate-pulse rounded bg-mist" />
      <div className="mb-6 h-40 animate-pulse rounded-2xl bg-mist" />
      <div className="mb-6 h-32 animate-pulse rounded-2xl bg-mist" />
      <div className="h-72 animate-pulse rounded-2xl bg-mist" />
    </div>
  );
}

export function HotelDetailPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { hotel, isPending, error } = useHotelById(hotelId);
  const [editOpen, setEditOpen] = useState(false);

  const back = (
    <Link
      href="/dashboard/hotels"
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
    >
      <ArrowLeft size={15} /> Hotels
    </Link>
  );

  if (isPending) {
    return (
      <>
        {back}
        <div className="h-40 animate-pulse rounded-2xl bg-mist" />
      </>
    );
  }

  if (error || !hotel) {
    return (
      <>
        {back}
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <p className="font-semibold text-ink">
            {error ? "Couldn't load this hotel" : "Hotel not found"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {error?.message ??
              "It may have been deleted, or belongs to another agency."}
          </p>
        </div>
      </>
    );
  }

  const contact = [
    hotel.contactNumber && {
      icon: Phone,
      text: hotel.contactNumber,
      href: `tel:${hotel.contactNumber}`,
    },
    hotel.email && {
      icon: Mail,
      text: hotel.email,
      href: `mailto:${hotel.email}`,
    },
    hotel.website && {
      icon: Globe,
      text: hotel.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      href: hotel.website,
    },
  ].filter(Boolean) as { icon: typeof Phone; text: string; href: string }[];

  return (
    <>
      {back}

      <div className="mb-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-lagoon-tint text-xl font-bold text-lagoon-deep">
              {hotel.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  {hotel.name}
                </h1>
                <StatusBadge status={hotel.status} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <MapPin size={14} aria-hidden="true" />
                {hotel.address}, {hotel.city}, {hotel.country}
              </p>
              <div className="mt-2">
                <StarRatingDisplay value={hotel.starRating} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line transition-colors hover:ring-ink/40"
          >
            <Pencil size={14} /> Edit hotel
          </button>
        </div>

        {(hotel.description || contact.length > 0) && (
          <div className="mt-5 grid gap-4 border-t border-line pt-5 md:grid-cols-[1fr_auto]">
            {hotel.description && (
              <p className="max-w-prose text-sm text-ink-soft">
                {hotel.description}
              </p>
            )}
            {contact.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 md:flex-col">
                {contact.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      target={c.icon === Globe ? "_blank" : undefined}
                      rel={c.icon === Globe ? "noreferrer" : undefined}
                      className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-lagoon-deep"
                    >
                      <c.icon size={14} aria-hidden="true" /> {c.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <AmenitiesSection hotelId={hotel.id} />

      <RoomsSection hotelId={hotel.id} />

      <HotelFormDialog
        open={editOpen}
        hotel={hotel}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
