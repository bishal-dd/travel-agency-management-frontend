"use client";

import { useEffect, useState } from "react";
import { Building2, User } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import {
  Field,
  FormFooter,
  ServerError,
  StatusToggle,
  inputCls,
  type Status,
} from "../../shared/components/FormBits";
import { useCreateCustomer } from "../hooks/useCreateCustomer";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import type {
  CreateCustomerInput,
  Customer,
  CustomerType,
} from "../types/customer";

/** Suggestions for the country box; any country can be typed. */
const COUNTRIES = [
  "Bhutan",
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Australia",
  "Japan",
  "Thailand",
  "Singapore",
  "China",
  "France",
  "Netherlands",
];

type FormState = {
  type: CustomerType;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
  status: Status;
};

const empty: FormState = {
  type: "individual",
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  country: "",
  notes: "",
  status: "active",
};

function fromCustomer(c: Customer): FormState {
  return {
    type: c.type,
    name: c.name,
    contactPerson: c.contactPerson ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    country: c.country ?? "",
    notes: c.notes ?? "",
    status: c.status,
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim())
    e.name =
      f.type === "company" ? "Company name is required." : "Name is required.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email address.";
  if (f.phone.trim() && !/^\+?[\d\s()-]{6,}$/.test(f.phone.trim()))
    e.phone = "Enter a valid phone number.";
  return e;
}

/** Empty optional fields go as null, which the backend uses to clear them on edit. */
function toInput(f: FormState): CreateCustomerInput {
  const opt = (v: string) => v.trim() || null;
  return {
    type: f.type,
    name: f.name.trim(),
    contactPerson: f.type === "company" ? opt(f.contactPerson) : null,
    email: opt(f.email),
    phone: opt(f.phone),
    country: opt(f.country),
    notes: opt(f.notes),
    status: f.status,
  };
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pass a customer to edit; leave null to add. */
  customer?: Customer | null;
};

export function CustomerFormDialog({ open, onClose, customer }: Props) {
  const isEdit = !!customer;
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setForm(customer ? fromCustomer(customer) : empty);
    setErrors({});
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  }

  const text =
    (key: "name" | "contactPerson" | "email" | "phone" | "country" | "notes") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(key, e.target.value);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (customer) {
      update.mutate(
        { customerId: customer.id, data: toInput(form) },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(toInput(form), { onSuccess: onClose });
    }
  }

  const isCompany = form.type === "company";

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={isEdit ? "Edit customer" : "Add customer"}
      description={
        isEdit
          ? `Update ${customer!.name}.`
          : "The person or company who books and pays. Travellers are added per booking."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field label="Customer type" className="sm:col-span-2">
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Customer type"
            >
              {(
                [
                  {
                    value: "individual",
                    label: "Individual",
                    hint: "A guest booking for themselves or family",
                    icon: User,
                  },
                  {
                    value: "company",
                    label: "Company",
                    hint: "A tour operator, agent or business",
                    icon: Building2,
                  },
                ] as const
              ).map((o) => {
                const on = form.type === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setField("type", o.value)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      on
                        ? "border-lagoon-deep bg-lagoon-tint"
                        : "border-line bg-white hover:border-ink/30"
                    }`}
                  >
                    <o.icon
                      size={18}
                      className={`mt-0.5 shrink-0 ${on ? "text-lagoon-deep" : "text-ink-soft"}`}
                      aria-hidden="true"
                    />
                    <span>
                      <span
                        className={`block text-sm font-semibold ${on ? "text-lagoon-deep" : "text-ink"}`}
                      >
                        {o.label}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {o.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label={isCompany ? "Company name" : "Full name"}
            htmlFor="c-name"
            required
            error={errors.name}
            className={isCompany ? "" : "sm:col-span-2"}
          >
            <input
              id="c-name"
              autoFocus
              value={form.name}
              onChange={text("name")}
              aria-invalid={!!errors.name}
              placeholder={
                isCompany ? "e.g. Himalaya Tours GmbH" : "e.g. John Smith"
              }
              className={inputCls}
            />
          </Field>

          {isCompany && (
            <Field label="Contact person" htmlFor="c-contact">
              <input
                id="c-contact"
                value={form.contactPerson}
                onChange={text("contactPerson")}
                placeholder="Who you deal with there"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Email" htmlFor="c-email" error={errors.email}>
            <input
              id="c-email"
              type="email"
              value={form.email}
              onChange={text("email")}
              aria-invalid={!!errors.email}
              className={inputCls}
            />
          </Field>

          <Field label="Phone" htmlFor="c-phone" error={errors.phone}>
            <input
              id="c-phone"
              type="tel"
              value={form.phone}
              onChange={text("phone")}
              aria-invalid={!!errors.phone}
              placeholder="Include the country code, e.g. +49"
              className={inputCls}
            />
          </Field>

          <Field label="Country" htmlFor="c-country">
            <input
              id="c-country"
              list="c-countries"
              value={form.country}
              onChange={text("country")}
              className={inputCls}
            />
            <datalist id="c-countries">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Status">
            <StatusToggle
              value={form.status}
              onChange={(s) => setField("status", s)}
            />
          </Field>

          <Field label="Notes" htmlFor="c-notes" className="sm:col-span-2">
            <textarea
              id="c-notes"
              value={form.notes}
              onChange={text("notes")}
              rows={3}
              placeholder="Preferences, how they found you, commission terms for agents…"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>
        </div>

        <ServerError error={error} />
        <FormFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={isEdit ? "Save changes" : "Add customer"}
        />
      </form>
    </Modal>
  );
}
