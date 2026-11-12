"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Field,
  FormFooter,
  ServerError,
  StatusToggle,
  inputCls,
  type Status,
} from "../../shared/components/FormBits";
import { useCreateDriver } from "../hooks/useCreateDriver";
import { useUpdateDriver } from "../hooks/useUpdateDriver";
import type { CreateDriverInput, Driver } from "../types/driver";
import { Modal } from "../../hotel/ui/Modal";

type FormState = {
  name: string;
  cid: string;
  phone: string;
  email: string;
  licenseNumber: string;
  /** What the agency pays the driver per day; "" = not set. */
  dailyCost: string;
  rateCurrency: string;
  status: Status;
};

/** BTN first: drivers are usually paid in ngultrum. */
const RATE_CURRENCIES = ["BTN", "USD", "INR", "EUR"];

const isMoney = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, ""));
/** "1500.00" → "1500", null → "" */
const moneyText = (v: string | null | undefined) =>
  v == null ? "" : String(Number(v));

const empty: FormState = {
  name: "",
  cid: "",
  phone: "",
  email: "",
  licenseNumber: "",
  dailyCost: "",
  rateCurrency: "BTN",
  status: "active",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Name is required.";
  // Bhutanese CID: 11 digits. Relax this if you also hire non-citizen drivers.
  if (!/^\d{11}$/.test(f.cid.trim())) e.cid = "CID must be 11 digits.";
  if (!/^\+?[\d\s-]{8,}$/.test(f.phone.trim()))
    e.phone = "Enter a valid phone number.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email address.";
  if (!f.licenseNumber.trim()) e.licenseNumber = "License number is required.";
  if ((f.dailyCost ?? "").trim() && !isMoney(f.dailyCost))
    e.dailyCost = "Enter an amount like 1500 or 45.50.";
  return e;
}

function toInput(f: FormState): CreateDriverInput {
  const cost = (f.dailyCost ?? "").trim().replace(/,/g, "");
  return {
    name: f.name.trim(),
    cid: f.cid.trim(),
    phone: f.phone.trim(),
    email: f.email.trim() || undefined,
    licenseNumber: f.licenseNumber.trim().toUpperCase(),
    // Empty = no cost (null clears an existing one on edit).
    dailyCost: cost || null,
    rateCurrency: cost ? f.rateCurrency || "BTN" : null,
    status: f.status,
  };
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Pass a driver to edit; leave null to add. */
  driver?: Driver | null;
};

export function DriverFormDialog({ open, onClose, driver }: Props) {
  const isEdit = !!driver;
  const create = useCreateDriver();
  const update = useUpdateDriver();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      driver
        ? {
            name: driver.name,
            cid: driver.cid,
            phone: driver.phone,
            email: driver.email ?? "",
            licenseNumber: driver.licenseNumber,
            dailyCost: moneyText(driver.dailyCost),
            rateCurrency: driver.rateCurrency ?? "BTN",
            status: driver.status,
          }
        : empty,
    );
    setErrors({});
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driver]);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      // Merge over `empty` so every field always exists (e.g. after a hot reload).
      setForm((f) => ({ ...empty, ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
    };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (driver) {
      update.mutate(
        { driverId: driver.id, input: toInput(form) },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(toInput(form), { onSuccess: onClose });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={isPending}
      title={isEdit ? "Edit driver" : "Add driver"}
      description={
        isEdit
          ? `Update ${driver!.name}'s details.`
          : "Drivers can be assigned to your vehicles."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Full name"
            htmlFor="d-name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              id="d-name"
              autoFocus
              value={form.name}
              onChange={set("name")}
              aria-invalid={!!errors.name}
              className={inputCls}
            />
          </Field>

          <Field label="CID number" htmlFor="d-cid" required error={errors.cid}>
            <input
              id="d-cid"
              inputMode="numeric"
              maxLength={11}
              value={form.cid}
              onChange={set("cid")}
              aria-invalid={!!errors.cid}
              placeholder="11 digits"
              className={`${inputCls} font-mono tracking-wide`}
            />
          </Field>

          <Field
            label="License number"
            htmlFor="d-license"
            required
            error={errors.licenseNumber}
          >
            <input
              id="d-license"
              value={form.licenseNumber}
              onChange={set("licenseNumber")}
              aria-invalid={!!errors.licenseNumber}
              className={`${inputCls} font-mono uppercase tracking-wide`}
            />
          </Field>

          <Field label="Phone" htmlFor="d-phone" required error={errors.phone}>
            <input
              id="d-phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              aria-invalid={!!errors.phone}
              placeholder="+975 17 123 456"
              className={inputCls}
            />
          </Field>

          <Field label="Email" htmlFor="d-email" error={errors.email}>
            <input
              id="d-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              aria-invalid={!!errors.email}
              className={inputCls}
            />
          </Field>

          <Field label="Status" className="sm:col-span-2">
            <StatusToggle
              value={form.status}
              onChange={(s) => setForm((f) => ({ ...empty, ...f, status: s }))}
            />
          </Field>

          <div className="space-y-3 border-t border-line pt-5 sm:col-span-2">
            <div>
              <p className="text-sm font-semibold text-ink">Daily cost</p>
              <p className="text-xs text-ink-soft">
                What you pay this driver per day (wage or allowance). It&apos;s
                added to the vehicle&apos;s cost on bookings, so profit is
                accurate. There&apos;s no price here: customers pay the
                vehicle&apos;s rate, which already includes the driver. Leave it
                empty if the vehicle&apos;s cost already covers the driver.
              </p>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-3 sm:max-w-sm">
              <Field label="Currency" htmlFor="d-rate-currency">
                <div className="relative">
                  <select
                    id="d-rate-currency"
                    value={form.rateCurrency || "BTN"}
                    onChange={set("rateCurrency")}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {[
                      ...new Set([
                        form.rateCurrency || "BTN",
                        ...RATE_CURRENCIES,
                      ]),
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                </div>
              </Field>
              <Field
                label="Cost per day"
                htmlFor="d-daily-cost"
                error={errors.dailyCost}
              >
                <input
                  id="d-daily-cost"
                  inputMode="decimal"
                  value={form.dailyCost ?? ""}
                  onChange={set("dailyCost")}
                  aria-invalid={!!errors.dailyCost}
                  placeholder="Not set"
                  className={`${inputCls} text-right tabular-nums`}
                />
              </Field>
            </div>
          </div>
        </div>

        <ServerError error={error} />
        <FormFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={isEdit ? "Save changes" : "Add driver"}
        />
      </form>
    </Modal>
  );
}
