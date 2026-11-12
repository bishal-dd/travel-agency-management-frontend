"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { inputCls } from "../../shared/components/FormBits";
import {
  usePaymentSettings,
  useUpdatePaymentSettings,
} from "../../payments/hooks/usePayments";

const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

type Form = {
  depositPercent: string;
  depositDueDays: string;
  balanceDueDaysBeforeArrival: string;
};

function Num({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className={`${sizedInputCls} inline-block w-16 text-center font-semibold tabular-nums`}
    />
  );
}

/** The default deposit and balance dates new confirmed bookings get. */
export function PaymentSettingsPage() {
  const { data: settings, isPending, error } = usePaymentSettings();
  const save = useUpdatePaymentSettings();
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const key = settings ? JSON.stringify(settings) : null;
  useEffect(() => {
    if (settings)
      setForm({
        depositPercent: String(settings.depositPercent),
        depositDueDays: String(settings.depositDueDays),
        balanceDueDaysBeforeArrival: String(
          settings.balanceDueDaysBeforeArrival,
        ),
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (isPending || (!form && !error))
    return <div className="h-48 max-w-3xl animate-pulse rounded-2xl bg-mist" />;
  if (error || !form)
    return (
      <p className="text-sm text-red-700">
        Couldn&apos;t load payment settings: {error?.message}
      </p>
    );

  const set = (k: keyof Form) => (v: string) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setSaved(false);
    setFormError(null);
  };
  const dirty =
    !!settings &&
    (Number(form.depositPercent) !== settings.depositPercent ||
      Number(form.depositDueDays) !== settings.depositDueDays ||
      Number(form.balanceDueDaysBeforeArrival) !==
        settings.balanceDueDaysBeforeArrival);
  const pct = Number(form.depositPercent);

  function onSave() {
    if (!form) return;
    const values = {
      depositPercent: Number(form.depositPercent),
      depositDueDays: Number(form.depositDueDays),
      balanceDueDaysBeforeArrival: Number(form.balanceDueDaysBeforeArrival),
    };
    if (Object.values(form).some((v) => v === ""))
      return setFormError("Fill in every number.");
    if (values.depositPercent > 100)
      return setFormError("The deposit can't be more than 100%.");
    if (values.depositDueDays > 365 || values.balanceDueDaysBeforeArrival > 365)
      return setFormError("Use 365 days or fewer.");
    save.mutate(values, { onSuccess: () => setSaved(true) });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Payments</h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          The schedule each booking gets when it&apos;s confirmed. You can still
          change it on any booking.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <p className="text-sm leading-10 text-ink">
          Ask for a deposit of{" "}
          <Num
            id="deposit"
            label="Deposit percent"
            value={form.depositPercent}
            onChange={set("depositPercent")}
          />
          % of the total, due{" "}
          <Num
            id="deposit-days"
            label="Days after confirming"
            value={form.depositDueDays}
            onChange={set("depositDueDays")}
          />{" "}
          days after confirming. The balance is due{" "}
          <Num
            id="balance-days"
            label="Days before arrival"
            value={form.balanceDueDaysBeforeArrival}
            onChange={set("balanceDueDaysBeforeArrival")}
          />{" "}
          days before arrival.
        </p>
        <p className="rounded-xl bg-lagoon-tint px-4 py-3 text-sm text-lagoon-deep">
          {pct <= 0
            ? `No deposit: one full payment, due ${form.balanceDueDaysBeforeArrival || "?"} days before arrival.`
            : pct >= 100
              ? `Full payment, due ${form.depositDueDays || "?"} days after confirming.`
              : `On a 1,000 trip: 1. Deposit ${(pct * 10).toFixed(0)}, 2. Balance ${(1000 - pct * 10).toFixed(0)}. Trips starting soon get the balance on the deposit date or today, never in the past.`}
        </p>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
          <p className="flex-1 text-sm">
            {formError || save.error ? (
              <span className="text-red-700">
                {formError ?? save.error?.message}
              </span>
            ) : saved && !dirty ? (
              <span className="text-lagoon-deep">
                Saved. Bookings confirmed from now on use this.
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={save.isPending || !dirty}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep disabled:opacity-50"
          >
            {save.isPending && <Loader2 size={15} className="animate-spin" />}
            Save
          </button>
        </div>
      </section>
    </div>
  );
}
