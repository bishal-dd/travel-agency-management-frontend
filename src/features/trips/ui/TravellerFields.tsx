"use client";

import { Trash2 } from "lucide-react";
import { TextField } from "@/src/components/ui";
import type {
  TravellerDraft,
  TravellerErrors,
  TravellerField,
} from "../passport/validation";

/** Passport numbers and country codes are printed in capitals. */
const UPPERCASE_FIELDS = new Set<TravellerField>([
  "passportNumber",
  "issuingCountry",
]);

/** Personal and passport fields for one traveller. Controlled by the parent form. */
export function TravellerFields({
  title,
  value,
  errors,
  disabled,
  onChange,
  onRemove,
}: {
  title: string;
  value: TravellerDraft;
  errors: TravellerErrors;
  disabled?: boolean;
  onChange: (field: TravellerField, value: string) => void;
  onRemove?: () => void;
}) {
  const field = (name: TravellerField) => ({
    value: value[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange(
        name,
        UPPERCASE_FIELDS.has(name)
          ? event.target.value.toUpperCase()
          : event.target.value,
      ),
    error: errors[name],
    disabled,
  });

  return (
    <fieldset className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <legend className="text-[15px] font-bold">{title}</legend>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 size={15} aria-hidden="true" /> Remove
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          autoComplete="off"
          hint="As shown on the passport."
          className="sm:col-span-2"
          {...field("fullName")}
        />
        <TextField
          label="Nationality"
          placeholder="e.g. Bhutanese"
          {...field("nationality")}
        />
        <TextField
          label="Date of birth"
          type="date"
          {...field("dateOfBirth")}
        />
        <TextField
          label="Email (optional)"
          type="email"
          autoComplete="off"
          {...field("email")}
        />
        <TextField
          label="Phone (optional)"
          type="tel"
          autoComplete="off"
          {...field("phone")}
        />
      </div>

      <p className="mt-6 text-sm font-bold">Passport</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Passport number"
          autoComplete="off"
          spellCheck={false}
          {...field("passportNumber")}
        />
        <TextField
          label="Issuing country"
          placeholder="e.g. BTN"
          {...field("issuingCountry")}
        />
        <TextField
          label="Issue date (optional)"
          type="date"
          {...field("passportIssueDate")}
        />
        <TextField
          label="Expiry date"
          type="date"
          {...field("passportExpiry")}
        />
      </div>
    </fieldset>
  );
}
