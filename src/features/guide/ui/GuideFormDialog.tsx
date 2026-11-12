"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  ChipPicker,
  Field,
  FormFooter,
  ServerError,
  StatusToggle,
  inputCls,
  type Status,
} from "../../shared/components/FormBits";
import { useCreateGuide } from "../hooks/useCreateGuide";
import { useUpdateGuide } from "../hooks/useUpdateGuide";
import type { CreateGuideInput, Guide } from "../types/guide";
import { Modal } from "../../hotel/ui/Modal";

const COMMON_LANGUAGES = [
  "English",
  "Dzongkha",
  "Hindi",
  "Nepali",
  "Chinese",
  "Japanese",
  "Thai",
  "Korean",
  "German",
  "French",
  "Spanish",
];

const SPECIALIZATIONS = [
  "Cultural",
  "Trekking",
  "Birding",
  "Festivals",
  "Photography",
  "Spiritual",
];

type FormState = {
  name: string;
  cid: string;
  phone: string;
  email: string;
  licenseNumber: string;
  languages: string[];
  experienceYears: string; // kept as text so the field can be empty
  specialization: string;
  bio: string;
  /** Default rate per day; "" = not set. */
  dailyPrice: string;
  dailyCost: string;
  rateCurrency: string;
  status: Status;
};

/** BTN first: guides are usually paid in ngultrum. */
const RATE_CURRENCIES = ["BTN", "USD", "INR", "EUR"];

const isMoney = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, ""));
/** "3500.00" → "3500", null → "" */
const moneyText = (v: string | null | undefined) =>
  v == null ? "" : String(Number(v));

const empty: FormState = {
  name: "",
  cid: "",
  phone: "",
  email: "",
  licenseNumber: "",
  languages: [],
  experienceYears: "",
  specialization: "",
  bio: "",
  dailyPrice: "",
  dailyCost: "",
  rateCurrency: "BTN",
  status: "active",
};

function fromGuide(g: Guide): FormState {
  return {
    name: g.name,
    cid: g.cid,
    phone: g.phone,
    email: g.email ?? "",
    licenseNumber: g.licenseNumber ?? "",
    languages: g.languages ?? [],
    experienceYears: g.experienceYears == null ? "" : String(g.experienceYears),
    specialization: g.specialization ?? "",
    bio: g.bio ?? "",
    dailyPrice: moneyText(g.dailyPrice),
    dailyCost: moneyText(g.dailyCost),
    rateCurrency: g.rateCurrency ?? "BTN",
    status: g.status,
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Name is required.";
  // Bhutanese CID: 11 digits. Relax this if you also work with non-citizen guides.
  if (!/^\d{11}$/.test(f.cid.trim())) e.cid = "CID must be 11 digits.";
  if (!/^\+?[\d\s-]{8,}$/.test(f.phone.trim()))
    e.phone = "Enter a valid phone number.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email address.";
  if (f.languages.length === 0) e.languages = "Add at least one language.";
  if (f.experienceYears.trim()) {
    const n = Number(f.experienceYears);
    if (!Number.isInteger(n) || n < 0 || n > 60)
      e.experienceYears = "Enter whole years, 0–60.";
  }
  if ((f.dailyPrice ?? "").trim() && !isMoney(f.dailyPrice))
    e.dailyPrice = "Enter an amount like 3500 or 45.50.";
  if ((f.dailyCost ?? "").trim() && !isMoney(f.dailyCost))
    e.dailyCost = "Enter an amount like 2500 or 45.50.";
  return e;
}

function toInput(f: FormState): CreateGuideInput {
  const opt = (v: string) => v.trim() || undefined;
  const price = (f.dailyPrice ?? "").trim().replace(/,/g, "");
  const cost = (f.dailyCost ?? "").trim().replace(/,/g, "");
  return {
    name: f.name.trim(),
    cid: f.cid.trim(),
    phone: f.phone.trim(),
    email: opt(f.email),
    licenseNumber: opt(f.licenseNumber)?.toUpperCase(),
    languages: f.languages,
    experienceYears: f.experienceYears.trim()
      ? Number(f.experienceYears)
      : undefined,
    specialization: opt(f.specialization),
    bio: opt(f.bio),
    // Empty = no rate (null clears an existing one on edit).
    dailyPrice: price || null,
    dailyCost: cost || null,
    rateCurrency: price || cost ? f.rateCurrency || "BTN" : null,
    status: f.status,
  };
}

/** Selected languages as removable tags, plus a box to type any other language. */
function LanguagesInput({
  value,
  onChange,
  invalid,
}: {
  value: string[];
  onChange: (langs: string[]) => void;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const has = (l: string) =>
    value.some((v) => v.toLowerCase() === l.toLowerCase());

  function add(raw: string) {
    const lang = raw.trim().replace(/\s+/g, " ");
    if (!lang || has(lang)) return;
    // Capitalise the first letter so "english" and "English" look the same.
    onChange([...value, lang.charAt(0).toUpperCase() + lang.slice(1)]);
  }
  const remove = (l: string) => onChange(value.filter((v) => v !== l));

  const suggestions = COMMON_LANGUAGES.filter((l) => !has(l));

  return (
    <div className="space-y-2">
      <div
        className={`flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 focus-within:border-lagoon-deep focus-within:ring-2 focus-within:ring-lagoon-deep/20 ${
          invalid ? "border-red-500" : "border-line"
        }`}
      >
        {value.map((l) => (
          <span
            key={l}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-lagoon-tint pl-3 pr-1 text-sm font-semibold text-lagoon-deep"
          >
            {l}
            <button
              type="button"
              onClick={() => remove(l)}
              aria-label={`Remove ${l}`}
              className="grid size-5 place-items-center rounded-full hover:bg-lagoon-deep/10"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id="g-languages"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault(); // don't submit the form
              add(draft);
              setDraft("");
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]!);
            }
          }}
          onBlur={() => {
            add(draft);
            setDraft("");
          }}
          aria-invalid={invalid}
          placeholder={
            value.length ? "Add another…" : "Type a language and press Enter"
          }
          className="h-7 min-w-[10rem] flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-ink-soft/70"
        />
      </div>

      {suggestions.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Common languages"
        >
          {suggestions.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => add(l)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-line px-2.5 text-xs font-medium text-ink-soft transition-colors hover:border-lagoon-deep hover:bg-lagoon-tint hover:text-lagoon-deep"
            >
              <Plus size={11} /> {l}
            </button>
          ))}
        </div>
      )}
    </div>
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
  /** Pass a guide to edit; leave null to add. */
  guide?: Guide | null;
};

export function GuideFormDialog({ open, onClose, guide }: Props) {
  const isEdit = !!guide;
  const create = useCreateGuide();
  const update = useUpdateGuide();
  const isPending = isEdit ? update.isPending : create.isPending;
  const error = isEdit ? update.error : create.error;

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setForm(guide ? fromGuide(guide) : empty);
    setErrors({});
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guide]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    // Merge over `empty` so every field always exists (e.g. after a hot reload).
    setForm((f) => ({ ...empty, ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  }

  const text =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(key, e.target.value as never);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (guide) {
      update.mutate(
        { guideId: guide.id, data: toInput(form) },
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
      title={isEdit ? "Edit guide" : "Add guide"}
      description={
        isEdit
          ? `Update ${guide!.name}'s details.`
          : "Guides can be assigned to your tours."
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <SectionLabel first>Personal</SectionLabel>

          <Field
            label="Full name"
            htmlFor="g-name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              id="g-name"
              autoFocus
              value={form.name}
              onChange={text("name")}
              aria-invalid={!!errors.name}
              className={inputCls}
            />
          </Field>

          <Field label="CID number" htmlFor="g-cid" required error={errors.cid}>
            <input
              id="g-cid"
              inputMode="numeric"
              maxLength={11}
              value={form.cid}
              onChange={text("cid")}
              aria-invalid={!!errors.cid}
              placeholder="11 digits"
              className={`${inputCls} font-mono tracking-wide`}
            />
          </Field>

          <Field label="Phone" htmlFor="g-phone" required error={errors.phone}>
            <input
              id="g-phone"
              type="tel"
              value={form.phone}
              onChange={text("phone")}
              aria-invalid={!!errors.phone}
              placeholder="+975 17 123 456"
              className={inputCls}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="g-email"
            error={errors.email}
            className="sm:col-span-2"
          >
            <input
              id="g-email"
              type="email"
              value={form.email}
              onChange={text("email")}
              aria-invalid={!!errors.email}
              className={inputCls}
            />
          </Field>

          <SectionLabel>Guiding</SectionLabel>

          <Field
            label="Languages"
            htmlFor="g-languages"
            required
            error={errors.languages}
            className="sm:col-span-2"
          >
            <LanguagesInput
              value={form.languages}
              onChange={(langs) => setField("languages", langs)}
              invalid={!!errors.languages}
            />
          </Field>

          <Field label="Guide licence number" htmlFor="g-license">
            <input
              id="g-license"
              value={form.licenseNumber}
              onChange={text("licenseNumber")}
              className={`${inputCls} font-mono uppercase tracking-wide`}
            />
          </Field>

          <Field
            label="Years of experience"
            htmlFor="g-exp"
            error={errors.experienceYears}
          >
            <input
              id="g-exp"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={form.experienceYears}
              onChange={text("experienceYears")}
              aria-invalid={!!errors.experienceYears}
              className={`${inputCls} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </Field>

          <Field
            label="Specialization"
            htmlFor="g-spec"
            className="sm:col-span-2"
          >
            <ChipPicker
              label="Common specializations"
              options={SPECIALIZATIONS}
              value={form.specialization}
              onPick={(s) =>
                // Click the selected one again to clear it.
                setField("specialization", form.specialization === s ? "" : s)
              }
            />
            <input
              id="g-spec"
              value={form.specialization}
              onChange={text("specialization")}
              placeholder="Or type your own"
              className={`${inputCls} mt-2`}
            />
          </Field>

          <SectionLabel>Rate per day</SectionLabel>

          <div className="space-y-3 sm:col-span-2">
            <p className="text-xs text-ink-soft">
              Used to price this guide automatically on bookings, converted into
              each booking&apos;s currency. Optional, and agents can still set a
              special price.
            </p>
            <div className="grid grid-cols-[6.5rem_1fr_1fr] gap-3">
              <Field label="Currency" htmlFor="g-rate-currency">
                <div className="relative">
                  <select
                    id="g-rate-currency"
                    value={form.rateCurrency || "BTN"}
                    onChange={(e) => setField("rateCurrency", e.target.value)}
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
                label="Price"
                htmlFor="g-rate-price"
                error={errors.dailyPrice}
                hint="Customer pays"
              >
                <input
                  id="g-rate-price"
                  inputMode="decimal"
                  value={form.dailyPrice ?? ""}
                  onChange={text("dailyPrice")}
                  aria-invalid={!!errors.dailyPrice}
                  placeholder="Not set"
                  className={`${inputCls} text-right font-semibold tabular-nums`}
                />
              </Field>
              <Field
                label="Cost"
                htmlFor="g-rate-cost"
                error={errors.dailyCost}
                hint="You pay the guide"
              >
                <input
                  id="g-rate-cost"
                  inputMode="decimal"
                  value={form.dailyCost ?? ""}
                  onChange={text("dailyCost")}
                  aria-invalid={!!errors.dailyCost}
                  placeholder="Not set"
                  className={`${inputCls} text-right tabular-nums`}
                />
              </Field>
            </div>
          </div>

          <Field label="Status" className="sm:col-span-2">
            <StatusToggle
              value={form.status}
              onChange={(s) => setField("status", s)}
            />
          </Field>
        </div>

        <ServerError error={error} />
        <FormFooter
          onCancel={onClose}
          isPending={isPending}
          submitLabel={isEdit ? "Save changes" : "Add guide"}
        />
      </form>
    </Modal>
  );
}
