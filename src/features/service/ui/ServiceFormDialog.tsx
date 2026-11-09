"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ChipPicker,
  Field,
  FormFooter,
  ServerError,
  StatusToggle,
  inputCls,
  type Status,
} from "../../shared/components/FormBits";
import { Modal } from "../../hotel/ui/Modal";
import { useCreateService } from "../hooks/useCreateService";
import { useUpdateService } from "../hooks/useUpdateService";
import type { CreateServiceInput, Service } from "../types/service";
import { formatDuration } from "@/src/lib/format";

const CATEGORIES = [
  "Transfer",
  "Sightseeing",
  "Activity",
  "Permit & fees",
  "Meal",
  "Cultural show",
  "Wellness",
  "Other",
];

/** BTN first; add any ISO 4217 code your agency prices in. */
const CURRENCIES = ["BTN", "USD", "INR", "EUR"];

const DURATION_PRESETS: { label: string; minutes: number }[] = [
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
  { label: "2 h", minutes: 120 },
  { label: "Half day", minutes: 240 },
  { label: "Full day", minutes: 480 },
];

type FormState = {
  name: string;
  description: string;
  category: string;
  durationMinutes: string; // text so it can be empty
  price: string;
  currency: string;
  status: Status;
};

const empty: FormState = {
  name: "",
  description: "",
  category: "",
  durationMinutes: "",
  price: "",
  currency: "BTN",
  status: "active",
};

function fromService(s: Service): FormState {
  return {
    name: s.name,
    description: s.description ?? "",
    category: s.category,
    durationMinutes: s.durationMinutes == null ? "" : String(s.durationMinutes),
    // "1500.00" → "1500" so the field doesn't look over-precise
    price: String(Number(s.price)),
    currency: s.currency,
    status: s.status,
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Service name is required.";
  if (!f.category.trim()) e.category = "Category is required.";
  if (!/^\d+(\.\d{1,2})?$/.test(f.price.trim()))
    e.price = "Enter a price like 1500 or 45.50.";
  if (!/^[A-Za-z]{3}$/.test(f.currency.trim()))
    e.currency = "Use a 3-letter code, e.g. BTN.";
  if (f.durationMinutes.trim()) {
    const n = Number(f.durationMinutes);
    if (!Number.isInteger(n) || n < 1)
      e.durationMinutes = "Enter whole minutes, 1 or more.";
  }
  return e;
}

function toInput(f: FormState): CreateServiceInput {
  return {
    name: f.name.trim(),
    description: f.description.trim() || undefined,
    category: f.category.trim(),
    durationMinutes: f.durationMinutes.trim()
      ? Number(f.durationMinutes)
      : undefined,
    price: f.price.trim(), // your API takes price as a string (decimal)
    currency: f.currency.trim().toUpperCase(),
    status: f.status,
  };
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pass a service to edit; leave null to add. */
  service?: Service | null;
};

export function ServiceFormDialog({ open, onClose, service }: Props) {
  const isEdit = !!service;
  const create = useCreateService();
  const update = useUpdateService();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setForm(service ? fromService(service) : empty);
    setErrors({});
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, service]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  }

  const text =
    (key: "name" | "description" | "category" | "durationMinutes" | "price") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(key, e.target.value);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (service) {
      update.mutate(
        { serviceId: service.id, data: toInput(form) },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(toInput(form), { onSuccess: onClose });
    }
  }

  const minutes = Number(form.durationMinutes);
  const durationHint =
    form.durationMinutes.trim() && Number.isInteger(minutes) && minutes > 0
      ? `= ${formatDuration(minutes)}`
      : "Leave empty if it doesn't have a set length.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={isEdit ? "Edit service" : "Add service"}
      description={
        isEdit
          ? `Update ${service!.name}.`
          : "Something you can add to a package or itinerary, like a transfer or permit."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Service name"
            htmlFor="s-name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              id="s-name"
              autoFocus
              value={form.name}
              onChange={text("name")}
              aria-invalid={!!errors.name}
              placeholder="e.g. Paro airport transfer"
              className={inputCls}
            />
          </Field>

          <Field
            label="Category"
            htmlFor="s-category"
            required
            error={errors.category}
            className="sm:col-span-2"
          >
            <ChipPicker
              label="Common categories"
              options={CATEGORIES}
              value={form.category}
              onPick={(c) => setField("category", c)}
            />
            <input
              id="s-category"
              value={form.category}
              onChange={text("category")}
              aria-invalid={!!errors.category}
              placeholder="Or type your own"
              className={`${inputCls} mt-2`}
            />
          </Field>

          <Field
            label="Price"
            htmlFor="s-price"
            required
            error={errors.price ?? errors.currency}
          >
            <div className="flex">
              <div className="relative shrink-0">
                <select
                  aria-label="Currency"
                  value={
                    CURRENCIES.includes(form.currency)
                      ? form.currency
                      : "__other"
                  }
                  onChange={(e) =>
                    setField(
                      "currency",
                      e.target.value === "__other" ? "" : e.target.value,
                    )
                  }
                  className="h-10 appearance-none rounded-l-lg border border-r-0 border-line bg-mist pl-3 pr-7 text-sm font-semibold text-ink outline-none focus:border-lagoon-deep"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__other">Other</option>
                </select>
                <ChevronDown
                  size={13}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft"
                />
              </div>
              <input
                id="s-price"
                inputMode="decimal"
                value={form.price}
                onChange={text("price")}
                aria-invalid={!!errors.price}
                placeholder="0"
                className={`${inputCls} rounded-l-none text-right font-semibold tabular-nums`}
              />
            </div>
            {!CURRENCIES.includes(form.currency) && (
              <input
                aria-label="Currency code"
                value={form.currency}
                onChange={(e) =>
                  setField("currency", e.target.value.toUpperCase())
                }
                aria-invalid={!!errors.currency}
                maxLength={3}
                placeholder="3-letter code, e.g. THB"
                className={`${inputCls} mt-2 font-mono uppercase`}
              />
            )}
          </Field>

          <Field label="Status">
            <StatusToggle
              value={form.status}
              onChange={(s) => setField("status", s)}
            />
          </Field>

          <Field
            label="Duration (minutes)"
            htmlFor="s-duration"
            error={errors.durationMinutes}
            hint={durationHint}
            className="sm:col-span-2"
          >
            <div
              className="mb-2 flex flex-wrap gap-1.5"
              role="group"
              aria-label="Common durations"
            >
              {DURATION_PRESETS.map((p) => {
                const on = form.durationMinutes === String(p.minutes);
                return (
                  <button
                    key={p.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setField("durationMinutes", on ? "" : String(p.minutes))
                    }
                    className={`h-8 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                      on
                        ? "bg-ink text-white"
                        : "bg-mist text-ink-soft hover:text-ink"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <input
              id="s-duration"
              type="number"
              inputMode="numeric"
              min={1}
              value={form.durationMinutes}
              onChange={text("durationMinutes")}
              aria-invalid={!!errors.durationMinutes}
              placeholder="e.g. 90"
              className={`${inputCls} [appearance:textfield] sm:max-w-[12rem] [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </Field>

          <Field label="Description" htmlFor="s-desc" className="sm:col-span-2">
            <textarea
              id="s-desc"
              value={form.description}
              onChange={text("description")}
              rows={3}
              placeholder="What's included, pickup points, anything the guest should know"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>
        </div>

        <ServerError error={error} />
        <FormFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={isEdit ? "Save changes" : "Add service"}
        />
      </form>
    </Modal>
  );
}
