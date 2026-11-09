"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateHotel } from "../hooks/useCreateHotel";
import { useUpdateHotel } from "../hooks/useUpdateHotel";
import type {
  CreateHotelPayload,
  Hotel,
  UpdateHotelPayload,
} from "../types/hotel";
import { Modal } from "./Modal";
import { StarPicker } from "./StarRating";

type FormState = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  contactNumber: string;
  email: string;
  website: string;
  starRating?: number;
  status: "active" | "inactive";
};

const empty: FormState = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "",
  contactNumber: "",
  email: "",
  website: "",
  starRating: undefined,
  status: "active",
};

function fromHotel(h: Hotel): FormState {
  return {
    name: h.name,
    description: h.description ?? "",
    address: h.address,
    city: h.city,
    country: h.country,
    contactNumber: h.contactNumber ?? "",
    email: h.email ?? "",
    website: h.website ?? "",
    starRating: h.starRating ?? undefined,
    status: h.status,
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Hotel name is required.";
  if (!f.address.trim()) e.address = "Address is required.";
  if (!f.city.trim()) e.city = "City is required.";
  if (!f.country.trim()) e.country = "Country is required.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email address.";
  if (f.website.trim()) {
    try {
      new URL(f.website.trim());
    } catch {
      e.website = "Enter a full URL, e.g. https://hotel.com";
    }
  }
  return e;
}

/** Create: empty optional fields are left out. */
function toCreatePayload(f: FormState): CreateHotelPayload {
  const opt = (v: string) => v.trim() || undefined;
  return {
    name: f.name.trim(),
    address: f.address.trim(),
    city: f.city.trim(),
    country: f.country.trim(),
    description: opt(f.description),
    contactNumber: opt(f.contactNumber),
    email: opt(f.email),
    website: opt(f.website),
    starRating: f.starRating,
    status: f.status,
  };
}

/** Update: empty optional fields are sent as null so clearing a field actually clears it. */
function toUpdatePayload(f: FormState): UpdateHotelPayload {
  const opt = (v: string) => v.trim() || null;
  return {
    name: f.name.trim(),
    address: f.address.trim(),
    city: f.city.trim(),
    country: f.country.trim(),
    description: opt(f.description),
    contactNumber: opt(f.contactNumber),
    email: opt(f.email),
    website: opt(f.website),
    starRating: f.starRating ?? null,
    status: f.status,
  };
}

const inputCls =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/70 focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/20 aria-[invalid=true]:border-red-500";

function Field({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

function SectionLabel({
  children,
  first,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wide text-ink-soft sm:col-span-2 ${
        first ? "" : "mt-2"
      }`}
    >
      {children}
    </p>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pass a hotel to edit it; leave undefined to add a new one. */
  hotel?: Hotel | null;
};

export function HotelFormDialog({ open, onClose, hotel }: Props) {
  const isEdit = !!hotel;
  const create = useCreateHotel();
  const update = useUpdateHotel();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  // Only show a server error from a submit made since this dialog opened.
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(hotel ? fromHotel(hotel) : empty);
    setErrors({});
    setSubmitted(false);
  }, [open, hotel]);

  const set =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
    };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitted(true);
    if (hotel) {
      update.updateHotel(
        { hotelId: hotel.id, data: toUpdatePayload(form) },
        { onSuccess: onClose },
      );
    } else {
      create.createHotel(toCreatePayload(form), { onSuccess: onClose });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={isEdit ? "Edit hotel" : "Add hotel"}
      description={
        isEdit
          ? `Changes apply everywhere ${hotel!.name} is used.`
          : "Hotels you add can be used in packages and itineraries."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <SectionLabel first>Details</SectionLabel>

          <Field
            label="Hotel name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              autoFocus
              value={form.name}
              onChange={set("name")}
              aria-invalid={!!errors.name}
              placeholder="e.g. Hotel Druk"
              className={inputCls}
            />
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Rooms, amenities, anything your team should know"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>

          <Field label="Star rating">
            <StarPicker
              value={form.starRating}
              onChange={(v) => setForm((f) => ({ ...f, starRating: v }))}
            />
          </Field>

          <Field label="Status">
            <div className="flex gap-1 rounded-full bg-mist p-1">
              {(["active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={form.status === s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`h-8 flex-1 rounded-full text-sm font-semibold capitalize transition-colors ${
                    form.status === s
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <SectionLabel>Location</SectionLabel>

          <Field
            label="Address"
            required
            error={errors.address}
            className="sm:col-span-2"
          >
            <input
              value={form.address}
              onChange={set("address")}
              aria-invalid={!!errors.address}
              placeholder="Street and number"
              className={inputCls}
            />
          </Field>

          <Field label="City" required error={errors.city}>
            <input
              value={form.city}
              onChange={set("city")}
              aria-invalid={!!errors.city}
              className={inputCls}
            />
          </Field>

          <Field label="Country" required error={errors.country}>
            <input
              value={form.country}
              onChange={set("country")}
              aria-invalid={!!errors.country}
              className={inputCls}
            />
          </Field>

          <SectionLabel>Contact</SectionLabel>

          <Field label="Phone">
            <input
              type="tel"
              value={form.contactNumber}
              onChange={set("contactNumber")}
              className={inputCls}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              aria-invalid={!!errors.email}
              className={inputCls}
            />
          </Field>

          <Field
            label="Website"
            error={errors.website}
            className="sm:col-span-2"
          >
            <input
              type="url"
              value={form.website}
              onChange={set("website")}
              aria-invalid={!!errors.website}
              placeholder="https://"
              className={inputCls}
            />
          </Field>
        </div>

        {submitted && error && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error.message}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Add hotel"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
