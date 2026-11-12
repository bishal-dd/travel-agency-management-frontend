"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import {
  useQuoteSettings,
  useUpdateQuoteSettings,
} from "../../quotes/hooks/useQuotes";
import type {
  QuoteSettings,
  QuoteSettingsInput,
} from "../../quotes/types/quote";

/** inputCls without its w-full, for boxes with their own width. */
const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

type Form = {
  validityDays: string;
  showDayPrices: boolean;
  showFeeBreakdown: boolean;
  paymentTerms: string;
  cancellationPolicy: string;
  footerNote: string;
};

const formFrom = (s: QuoteSettings): Form => ({
  validityDays: String(s.validityDays),
  showDayPrices: s.showDayPrices,
  showFeeBreakdown: s.showFeeBreakdown,
  paymentTerms: s.paymentTerms ?? "",
  cancellationPolicy: s.cancellationPolicy ?? "",
  footerNote: s.footerNote ?? "",
});

const toInput = (f: Form): QuoteSettingsInput => ({
  validityDays: Number(f.validityDays),
  showDayPrices: f.showDayPrices,
  showFeeBreakdown: f.showFeeBreakdown,
  paymentTerms: f.paymentTerms.trim() || null,
  cancellationPolicy: f.cancellationPolicy.trim() || null,
  footerNote: f.footerNote.trim() || null,
});

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl bg-mist/60 px-4 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-ink-soft">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-lagoon-deep" : "bg-ink/20"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

function TextBlock({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <p className="mb-1.5 text-xs text-ink-soft">{hint}</p>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} h-auto py-2.5 leading-relaxed`}
      />
    </div>
  );
}

/** How quotes look to customers: validity, what prices show, and your terms. */
export function QuoteSettingsPage() {
  const { data: settings, isPending, error } = useQuoteSettings();
  const save = useUpdateQuoteSettings();
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fill the form only when the saved settings change (not on every render).
  const settingsKey = settings ? JSON.stringify(settings) : null;
  useEffect(() => {
    if (settings) setForm(formFrom(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsKey]);

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
    const days = Number(form.validityDays);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      setFormError("Validity must be a whole number of days, from 1 to 365.");
      return;
    }
    save.mutate(toInput(form), { onSuccess: () => setSaved(true) });
  }

  if (isPending || (!form && !error)) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-mist" />
        <div className="h-64 animate-pulse rounded-2xl bg-mist" />
      </div>
    );
  }
  if (error || !form)
    return (
      <p className="text-sm text-red-700">
        Couldn&apos;t load quote settings: {error?.message}
      </p>
    );

  return (
    <div className="max-w-3xl pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Quotes</h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          What customers see when you share a quote. Changes apply to new
          quotes; ones already sent stay as they were.
        </p>
      </div>

      <div className="space-y-5">
        <section className="space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Defaults</h2>
          <div>
            <label
              htmlFor="validity"
              className="block text-sm font-medium text-ink"
            >
              Quotes are valid for
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="validity"
                inputMode="numeric"
                value={form.validityDays}
                onChange={(e) =>
                  set("validityDays", e.target.value.replace(/\D/g, ""))
                }
                className={`${sizedInputCls} w-20 shrink-0 text-center font-semibold tabular-nums`}
              />
              <span className="text-sm text-ink-soft">
                days after sending (you can change it per quote)
              </span>
            </div>
          </div>
          <Toggle
            checked={form.showDayPrices}
            onChange={(v) => set("showDayPrices", v)}
            label="Show day-by-day prices"
            hint="Off: customers see the package total only. You can still choose per quote."
          />
          <Toggle
            checked={form.showFeeBreakdown}
            onChange={(v) => set("showFeeBreakdown", v)}
            label="Show government fees per traveller"
            hint="Lists each traveller's SDF and visa under the total."
          />
        </section>

        <section className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Terms shown on every quote</h2>
          <TextBlock
            id="payment-terms"
            label="Payment terms"
            hint="How and when the customer pays."
            value={form.paymentTerms}
            onChange={(v) => set("paymentTerms", v)}
            placeholder={
              "30% deposit to confirm the booking.\nBalance due 30 days before arrival, by bank transfer."
            }
          />
          <TextBlock
            id="cancellation"
            label="Cancellation policy"
            hint="What happens if the customer cancels."
            value={form.cancellationPolicy}
            onChange={(v) => set("cancellationPolicy", v)}
            placeholder={
              "More than 30 days before arrival: deposit refunded less bank charges.\n…"
            }
          />
          <TextBlock
            id="footer"
            label="Footer"
            hint="Small print at the bottom, e.g. your licence number and contact details."
            value={form.footerNote}
            onChange={(v) => set("footerNote", v)}
            rows={2}
          />
        </section>
      </div>

      {/* Save bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
        <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="flex-1 text-sm">
            {formError || save.error ? (
              <span className="text-red-700">
                {formError ?? save.error?.message}
              </span>
            ) : saved && !dirty ? (
              <span className="text-lagoon-deep">
                Saved. New quotes will use these settings.
              </span>
            ) : (
              <span className="text-ink-soft">
                {dirty ? "Unsaved changes" : "Quote settings"}
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
            disabled={save.isPending || !dirty}
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
