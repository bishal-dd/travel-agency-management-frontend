"use client";

import { useEffect, useState } from "react";
import { Landmark, Loader2, Percent, Stamp, UserCheck } from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import { TagInput } from "../../shared/components/TagInput";
import {
  usePricingSettings,
  useUpdatePricingSettings,
} from "../hooks/usePricingSettings";
import type {
  PricingSettings,
  PricingSettingsInput,
} from "../types/pricingSettings";

/** inputCls without its w-full, for boxes with their own width (w-full would win and squash neighbours). */
const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

/** Bhutan's rules as of 2026 (the SDF concession runs until 31 Aug 2027). */
const BHUTAN_DEFAULTS: Form = {
  gstRegistered: false,
  gstRate: "5",
  gstInclusive: false,
  sdfAmount: "100",
  sdfCurrency: "USD",
  sdfRegionalAmount: "1200",
  sdfRegionalCurrency: "BTN",
  regionalNationalities: ["India"],
  sdfChildPercent: "50",
  sdfChildUnderAge: "12",
  sdfFreeUnderAge: "6",
  visaAmount: "40",
  visaCurrency: "USD",
  visaExemptNationalities: ["India"],
  exemptNationalities: ["Bhutan"],
};

const COUNTRY_SUGGESTIONS = [
  "India",
  "Bhutan",
  "Bangladesh",
  "Maldives",
  "Nepal",
];

type Form = {
  gstRegistered: boolean;
  gstRate: string;
  gstInclusive: boolean;
  sdfAmount: string;
  sdfCurrency: string;
  sdfRegionalAmount: string;
  sdfRegionalCurrency: string;
  regionalNationalities: string[];
  sdfChildPercent: string;
  sdfChildUnderAge: string;
  sdfFreeUnderAge: string;
  visaAmount: string;
  visaCurrency: string;
  visaExemptNationalities: string[];
  exemptNationalities: string[];
};

const num = (v: string) => String(Number(v));

function formFrom(s: PricingSettings): Form {
  return {
    gstRegistered: s.gstRegistered,
    gstRate: num(s.gstRate),
    gstInclusive: s.gstInclusive,
    sdfAmount: num(s.sdfAmount),
    sdfCurrency: s.sdfCurrency,
    sdfRegionalAmount: num(s.sdfRegionalAmount),
    sdfRegionalCurrency: s.sdfRegionalCurrency,
    regionalNationalities: s.regionalNationalities,
    sdfChildPercent: String(s.sdfChildPercent),
    sdfChildUnderAge: String(s.sdfChildUnderAge),
    sdfFreeUnderAge: String(s.sdfFreeUnderAge),
    visaAmount: num(s.visaAmount),
    visaCurrency: s.visaCurrency,
    visaExemptNationalities: s.visaExemptNationalities,
    exemptNationalities: s.exemptNationalities,
  };
}

const isMoney = (v: string) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(v.trim().replace(/,/g, ""));
const isCurrency = (v: string) => /^[A-Z]{3}$/.test(v.trim().toUpperCase());
const isInt = (v: string, max: number) =>
  /^\d+$/.test(v.trim()) && Number(v) <= max;

/** First problem with the form, or null. */
function problem(f: Form): string | null {
  if (
    !(Number(f.gstRate) >= 0 && Number(f.gstRate) <= 100) ||
    f.gstRate.trim() === ""
  )
    return "GST rate must be between 0 and 100.";
  if (!isMoney(f.sdfAmount) || !isMoney(f.sdfRegionalAmount))
    return "Enter the SDF amounts like 100 or 1200.";
  if (!isMoney(f.visaAmount)) return "Enter the visa fee like 40.";
  if (![f.sdfCurrency, f.sdfRegionalCurrency, f.visaCurrency].every(isCurrency))
    return "Use 3-letter currency codes like USD or BTN.";
  if (!isInt(f.sdfChildPercent, 100))
    return "The child SDF percent must be 0 to 100.";
  if (!isInt(f.sdfChildUnderAge, 25) || !isInt(f.sdfFreeUnderAge, 25))
    return "Enter the child ages as whole numbers.";
  if (Number(f.sdfFreeUnderAge) > Number(f.sdfChildUnderAge))
    return "The free age can't be above the child-rate age.";
  return null;
}

function toInput(f: Form): PricingSettingsInput {
  return {
    gstRegistered: f.gstRegistered,
    gstRate: f.gstRate.trim(),
    gstInclusive: f.gstInclusive,
    sdfAmount: f.sdfAmount.trim(),
    sdfCurrency: f.sdfCurrency.trim().toUpperCase(),
    sdfRegionalAmount: f.sdfRegionalAmount.trim(),
    sdfRegionalCurrency: f.sdfRegionalCurrency.trim().toUpperCase(),
    regionalNationalities: f.regionalNationalities,
    sdfChildPercent: Number(f.sdfChildPercent),
    sdfChildUnderAge: Number(f.sdfChildUnderAge),
    sdfFreeUnderAge: Number(f.sdfFreeUnderAge),
    visaAmount: f.visaAmount.trim(),
    visaCurrency: f.visaCurrency.trim().toUpperCase(),
    visaExemptNationalities: f.visaExemptNationalities,
    exemptNationalities: f.exemptNationalities,
  };
}

// ---------- layout bits ----------

function Card({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Percent;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lagoon-tint text-lagoon-deep">
          <Icon size={17} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {children}
      </label>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

/** "100" + "USD" side by side. */
function AmountInput({
  id,
  label,
  amount,
  currency,
  onAmount,
  onCurrency,
  suffix,
}: {
  id: string;
  label: string;
  amount: string;
  currency: string;
  onAmount: (v: string) => void;
  onCurrency: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          className={`${sizedInputCls} w-32 shrink-0 text-right font-semibold tabular-nums`}
        />
        <input
          aria-label={`${label} currency`}
          value={currency}
          maxLength={3}
          onChange={(e) => onCurrency(e.target.value.toUpperCase())}
          className={`${sizedInputCls} w-20 shrink-0 font-mono font-semibold uppercase`}
        />
        {suffix && <span className="text-sm text-ink-soft">{suffix}</span>}
      </div>
    </div>
  );
}

function SmallNumber({
  id,
  value,
  onChange,
  label,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${sizedInputCls} inline-block w-16 text-center font-semibold tabular-nums`}
    />
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl bg-mist/60 px-4 py-3 text-left"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-lagoon-deep" : "bg-ink/20"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

// ---------- page ----------

export function PricingSettingsPage() {
  const { data: settings, isPending, error } = usePricingSettings();
  const save = useUpdatePricingSettings();
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm(formFrom(settings));
  }, [settings]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
    setFormError(null);
  };

  const dirty =
    !!form &&
    !!settings &&
    JSON.stringify(form) !== JSON.stringify(formFrom(settings));

  function onSave() {
    if (!form) return;
    const p = problem(form);
    if (p) {
      setFormError(p);
      return;
    }
    save.mutate(toInput(form), { onSuccess: () => setSaved(true) });
  }

  if (isPending || (!form && !error)) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-mist" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-mist" />
        ))}
      </div>
    );
  }
  if (error || !form) {
    return (
      <p className="text-sm text-red-700">
        Couldn&apos;t load pricing settings: {error?.message}
      </p>
    );
  }

  const exampleTrip = 1000;
  const rate = Number(form.gstRate) || 0;
  const exampleGst = form.gstInclusive
    ? (exampleTrip * rate) / (100 + rate)
    : (exampleTrip * rate) / 100;

  return (
    <div className="max-w-3xl pb-24">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Taxes &amp; government fees
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Used to work out GST, SDF and visa fees on every booking. Confirmed
            bookings keep the fees they were confirmed with, so changes here
            only affect inquiries and quotes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm((f) =>
              f
                ? {
                    ...BHUTAN_DEFAULTS,
                    gstRegistered: f.gstRegistered,
                    gstInclusive: f.gstInclusive,
                  }
                : f,
            );
            setSaved(false);
          }}
          className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-ink-soft ring-1 ring-inset ring-line hover:text-ink hover:ring-ink/40"
        >
          Use Bhutan defaults
        </button>
      </div>

      <div className="space-y-5">
        {/* GST */}
        <Card
          icon={Percent}
          title="GST"
          description="Charged on hotels, transport, guides and services. Never on SDF or visa fees."
        >
          <Switch
            checked={form.gstRegistered}
            onChange={(v) => set("gstRegistered", v)}
            label="We're registered for GST"
          />

          {form.gstRegistered && (
            <>
              <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
                <div>
                  <Label htmlFor="gst-rate">Rate</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="gst-rate"
                      inputMode="decimal"
                      value={form.gstRate}
                      onChange={(e) => set("gstRate", e.target.value)}
                      className={`${sizedInputCls} w-24 shrink-0 text-right font-semibold tabular-nums`}
                    />
                    <span className="text-sm font-semibold text-ink-soft">
                      %
                    </span>
                  </div>
                </div>
                <fieldset>
                  <legend className="mb-1.5 text-sm font-medium text-ink">
                    Your rates
                  </legend>
                  <div
                    className="flex gap-1 rounded-full bg-mist p-1"
                    role="radiogroup"
                  >
                    {[
                      { value: false, label: "Don't include GST" },
                      { value: true, label: "Already include GST" },
                    ].map((o) => (
                      <button
                        key={String(o.value)}
                        type="button"
                        role="radio"
                        aria-checked={form.gstInclusive === o.value}
                        onClick={() => set("gstInclusive", o.value)}
                        className={`h-8 flex-1 rounded-full px-3 text-sm font-semibold transition-colors ${
                          form.gstInclusive === o.value
                            ? "bg-white text-ink shadow-sm"
                            : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <p className="rounded-xl bg-lagoon-tint px-4 py-3 text-sm text-lagoon-deep">
                {form.gstInclusive
                  ? `A trip priced at 1,000 includes ${exampleGst.toFixed(2)} GST; the customer pays 1,000.`
                  : `A trip priced at 1,000 gets ${exampleGst.toFixed(2)} GST added; the customer pays ${(exampleTrip + exampleGst).toFixed(2)}.`}
              </p>
            </>
          )}
        </Card>

        {/* SDF */}
        <Card
          icon={Landmark}
          title="Sustainable Development Fee (SDF)"
          description="Per traveller, per night. Age is taken on the trip's start date."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <AmountInput
              id="sdf"
              label="International rate"
              amount={form.sdfAmount}
              currency={form.sdfCurrency}
              onAmount={(v) => set("sdfAmount", v)}
              onCurrency={(v) => set("sdfCurrency", v)}
              suffix="/ night"
            />
            <AmountInput
              id="sdf-regional"
              label="Regional rate"
              amount={form.sdfRegionalAmount}
              currency={form.sdfRegionalCurrency}
              onAmount={(v) => set("sdfRegionalAmount", v)}
              onCurrency={(v) => set("sdfRegionalCurrency", v)}
              suffix="/ night"
            />
          </div>
          <div>
            <Label
              htmlFor="regional"
              hint="Travellers with these nationalities pay the regional rate."
            >
              Regional rate applies to
            </Label>
            <TagInput
              id="regional"
              value={form.regionalNationalities}
              onChange={(v) => set("regionalNationalities", v)}
              suggestions={COUNTRY_SUGGESTIONS}
              placeholder="Add a country"
            />
          </div>
          <div className="rounded-xl bg-mist/60 px-4 py-3 text-sm leading-9 text-ink">
            Children under{" "}
            <SmallNumber
              id="child-age"
              label="Child rate below age"
              value={form.sdfChildUnderAge}
              onChange={(v) => set("sdfChildUnderAge", v)}
            />{" "}
            pay{" "}
            <SmallNumber
              id="child-pct"
              label="Child rate percent"
              value={form.sdfChildPercent}
              onChange={(v) => set("sdfChildPercent", v)}
            />
            % of the SDF. Under{" "}
            <SmallNumber
              id="free-age"
              label="Free below age"
              value={form.sdfFreeUnderAge}
              onChange={(v) => set("sdfFreeUnderAge", v)}
            />{" "}
            pay nothing.
          </div>
        </Card>

        {/* Visa */}
        <Card
          icon={Stamp}
          title="Visa fee"
          description="Once per traveller, whatever their age."
        >
          <AmountInput
            id="visa"
            label="Fee"
            amount={form.visaAmount}
            currency={form.visaCurrency}
            onAmount={(v) => set("visaAmount", v)}
            onCurrency={(v) => set("visaCurrency", v)}
            suffix="per traveller"
          />
          <div>
            <Label
              htmlFor="visa-exempt"
              hint="Indian nationals enter with a permit instead of a visa."
            >
              No visa fee for
            </Label>
            <TagInput
              id="visa-exempt"
              value={form.visaExemptNationalities}
              onChange={(v) => set("visaExemptNationalities", v)}
              suggestions={COUNTRY_SUGGESTIONS}
              placeholder="Add a country"
            />
          </div>
        </Card>

        {/* Exempt */}
        <Card
          icon={UserCheck}
          title="No government fees"
          description="Travellers with these nationalities pay neither SDF nor visa."
        >
          <TagInput
            id="exempt"
            value={form.exemptNationalities}
            onChange={(v) => set("exemptNationalities", v)}
            suggestions={COUNTRY_SUGGESTIONS}
            placeholder="Add a country"
          />
        </Card>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="flex-1 text-sm">
            {formError || save.error ? (
              <span className="text-red-700">
                {formError ?? save.error?.message}
              </span>
            ) : saved && !dirty ? (
              <span className="text-lagoon-deep">
                Saved. Open quotes now use these rules.
              </span>
            ) : dirty ? (
              <span className="text-ink-soft">Unsaved changes</span>
            ) : (
              <span className="text-ink-soft">
                {settings?.updatedAt
                  ? "Your agency's rules"
                  : "Using Bhutan's default rules"}
              </span>
            )}
          </p>
          {dirty && (
            <button
              type="button"
              onClick={() => settings && setForm(formFrom(settings))}
              disabled={save.isPending}
              className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={save.isPending || (!dirty && !!settings?.updatedAt)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-50"
          >
            {save.isPending && <Loader2 size={15} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
