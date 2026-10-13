"use client";

import { useLayoutEffect, useState } from "react";
import { Eye, EyeOff, Mail, Phone, Trash2 } from "lucide-react";
import { Avatar, Spinner } from "@/src/components/ui";
import { formatIsoDate, maskPassportNumber } from "../passport/passport";
import type { Traveller } from "../passport/types";
import { PassportStatusBadge } from "./StatusBadges";

export function TravellerCard({
  traveller,
  tripEndDate,
  onRemove,
}: {
  traveller: Traveller;
  tripEndDate: string;
  onRemove: () => Promise<void>;
}) {
  const [revealed, setRevealed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { passport } = traveller;

  // Hide the passport number again and cancel a pending removal when the page is hidden.
  useLayoutEffect(() => {
    return () => {
      setRevealed(false);
      setConfirming(false);
      setRemoving(false);
    };
  }, []);

  async function handleRemove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
      setConfirming(false);
    }
  }

  const details = [
    { label: "Nationality", value: traveller.nationality },
    {
      label: "Date of birth",
      value: traveller.dateOfBirth
        ? formatIsoDate(traveller.dateOfBirth)
        : "Not provided",
    },
    { label: "Issuing country", value: passport.issuingCountry },
    {
      label: "Issued",
      value: passport.issueDate
        ? formatIsoDate(passport.issueDate)
        : "Not provided",
    },
    { label: "Expires", value: formatIsoDate(passport.expiryDate) },
  ];

  return (
    <li className="px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={traveller.fullName} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{traveller.fullName}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
            {traveller.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} aria-hidden="true" /> {traveller.email}
              </span>
            )}
            {traveller.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone size={13} aria-hidden="true" /> {traveller.phone}
              </span>
            )}
          </div>
        </div>
        <PassportStatusBadge
          expiryDate={passport.expiryDate}
          tripEndDate={tripEndDate}
        />
      </div>

      <div className="mt-4 rounded-xl bg-mist p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink-soft">Passport number</p>
            <p className="font-mono text-[15px] font-semibold tracking-wider">
              {revealed ? passport.number : maskPassportNumber(passport.number)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-pressed={revealed}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-line transition-colors ring-inset hover:ring-ink/40"
          >
            {revealed ? (
              <EyeOff size={15} aria-hidden="true" />
            ) : (
              <Eye size={15} aria-hidden="true" />
            )}
            {revealed ? "Hide" : "Show"}
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
          {details.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-xs text-ink-soft">{item.label}</dt>
              <dd className="truncate text-sm font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {confirming && !removing && (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Keep
          </button>
        )}
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            confirming
              ? "bg-red-600 text-white hover:bg-red-700"
              : "text-ink-soft hover:bg-red-50 hover:text-red-700"
          }`}
        >
          {removing ? (
            <Spinner label="Removing..." className="text-current" />
          ) : (
            <>
              <Trash2 size={15} aria-hidden="true" />{" "}
              {confirming ? "Confirm remove" : "Remove"}
            </>
          )}
        </button>
      </div>
    </li>
  );
}
