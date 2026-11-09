"use client";

import { useEffect, useState } from "react";
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
  status: Status;
};

const empty: FormState = {
  name: "",
  cid: "",
  phone: "",
  email: "",
  licenseNumber: "",
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
  return e;
}

function toInput(f: FormState): CreateDriverInput {
  return {
    name: f.name.trim(),
    cid: f.cid.trim(),
    phone: f.phone.trim(),
    email: f.email.trim() || undefined,
    licenseNumber: f.licenseNumber.trim().toUpperCase(),
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
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
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
              onChange={(s) => setForm((f) => ({ ...f, status: s }))}
            />
          </Field>
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
