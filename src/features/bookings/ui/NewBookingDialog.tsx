"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Loader2, Search, User, X } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { useCustomers } from "../../customers/hooks/useCustomers";
import type { Customer } from "../../customers/types/customer";
import { useItineraries } from "../../itineraries/hooks/useItineraries";
import {
  Field,
  FormFooter,
  ServerError,
  inputCls,
} from "../../shared/components/FormBits";
import { useDebounced } from "../../shared/hooks/useListParams";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { addDays, formatDate, todayIso } from "./bookingUi";

/** Active itineraries are loaded once for the picker. Keep ≤ your backend's max `limit`. */
const ITINERARY_LIMIT = 100;
const CURRENCIES = ["USD", "BTN", "INR", "EUR"];

function CustomerPicker({
  value,
  onChange,
  error,
}: {
  value: Customer | null;
  onChange: (c: Customer | null) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const search = useDebounced(query.trim());
  const { customers, isFetching } = useCustomers({
    search: search || undefined,
    status: "active",
    limit: 6,
  });

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-lagoon-deep bg-lagoon-tint px-3 py-2.5">
        {value.type === "company" ? (
          <Building2
            size={18}
            className="shrink-0 text-lagoon-deep"
            aria-hidden="true"
          />
        ) : (
          <User
            size={18}
            className="shrink-0 text-lagoon-deep"
            aria-hidden="true"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {value.name}
          </p>
          <p className="truncate text-xs text-ink-soft">
            {[
              value.type === "company" ? "Company" : "Individual",
              value.email,
              value.country,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Choose a different customer"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-white hover:text-ink"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        className={`flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm text-ink-soft focus-within:border-lagoon-deep focus-within:ring-2 focus-within:ring-lagoon-deep/20 ${
          error ? "border-red-500" : "border-line"
        }`}
      >
        {isFetching ? (
          <Loader2
            size={14}
            className="shrink-0 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Search size={14} className="shrink-0" aria-hidden="true" />
        )}
        <span className="sr-only">Find a customer</span>
        <input
          id="nb-customer"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers by name, email or phone"
          className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft/70"
        />
      </label>
      {customers.length > 0 ? (
        <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line">
          {customers.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChange(c)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-lagoon-tint"
              >
                {c.type === "company" ? (
                  <Building2
                    size={15}
                    className="shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                ) : (
                  <User
                    size={15}
                    className="shrink-0 text-ink-soft"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {c.name}
                </span>
                <span className="shrink-0 truncate text-xs text-ink-soft">
                  {c.email ?? c.country ?? ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-ink-soft">
          {search
            ? "No active customers match."
            : "No customers yet. Add one on the Customers page first."}
        </p>
      )}
    </div>
  );
}

export function NewBookingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const create = useCreateBooking();
  const { itineraries } = useItineraries({
    status: "active",
    limit: ITINERARY_LIMIT,
  });

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [itineraryId, setItineraryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [title, setTitle] = useState("");
  const [customerIsTraveller, setCustomerIsTraveller] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Read "today" after mount, not during render (Next.js prerendering).
  const [today, setToday] = useState("");

  useEffect(() => {
    if (!open) return;
    startTransition(() => setToday(todayIso()));
    setCustomer(null);
    setItineraryId("");
    setStartDate("");
    setEndDate("");
    setAdults("2");
    setChildren("0");
    setCurrency("USD");
    setTitle("");
    setCustomerIsTraveller(true);
    setErrors({});
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const itinerary = itineraries.find((i) => i.id === itineraryId);
  // With an itinerary, the end date follows its length unless the agent sets one.
  const autoEnd = useMemo(
    () =>
      startDate && itinerary?.dayCount
        ? addDays(startDate, itinerary.dayCount - 1)
        : "",
    [startDate, itinerary],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!customer) found.customer = "Choose who is booking.";
    if (!startDate) found.startDate = "Choose a start date.";
    const end = endDate || autoEnd;
    if (startDate && end && end < startDate)
      found.endDate = "End date is before the start date.";
    if (startDate && autoEnd && endDate && endDate < autoEnd)
      found.endDate = `The itinerary needs at least until ${formatDate(autoEnd)}.`;
    const a = Number(adults);
    const c = Number(children);
    if (!Number.isInteger(a) || a < 1) found.adults = "At least 1 adult.";
    if (!Number.isInteger(c) || c < 0) found.children = "Can't be negative.";
    setErrors(found);
    if (Object.keys(found).length) return;

    create.mutate(
      {
        customerId: customer!.id,
        itineraryId: itineraryId || undefined,
        title: title.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
        adults: a,
        children: c,
        currency,
        customerIsTraveller:
          customer!.type === "individual" && customerIsTraveller,
      },
      {
        onSuccess: (res) => {
          onClose();
          router.push(`/dashboard/bookings/${res.data.id}`);
        },
      },
    );
  }

  const clearError = (k: string) =>
    errors[k] && setErrors((x) => ({ ...x, [k]: "" }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={create.isPending}
      title="New booking"
      description="Starts as an inquiry. You can add travellers and adjust days next."
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Customer"
            htmlFor="nb-customer"
            required
            error={errors.customer}
            className="sm:col-span-2"
          >
            <CustomerPicker
              value={customer}
              onChange={(c) => {
                setCustomer(c);
                clearError("customer");
              }}
            />
            {customer?.type === "individual" && (
              <label className="mt-2 flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={customerIsTraveller}
                  onChange={(e) => setCustomerIsTraveller(e.target.checked)}
                  className="size-4 accent-lagoon-deep"
                />
                {customer.name} is travelling too
              </label>
            )}
          </Field>

          <Field
            label="Start from itinerary"
            htmlFor="nb-itinerary"
            className="sm:col-span-2"
            hint={
              itinerary
                ? `Copies its ${itinerary.dayCount} day${itinerary.dayCount === 1 ? "" : "s"} with real dates.`
                : "Optional. Leave empty for a custom trip."
            }
          >
            <div className="relative">
              <select
                id="nb-itinerary"
                value={itineraryId}
                onChange={(e) => setItineraryId(e.target.value)}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">No itinerary (custom trip)</option>
                {itineraries.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} · {i.dayCount} day{i.dayCount === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
              />
            </div>
          </Field>

          <Field
            label="Start date"
            htmlFor="nb-start"
            required
            error={errors.startDate}
          >
            <input
              id="nb-start"
              type="date"
              min={today || undefined}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                clearError("startDate");
              }}
              aria-invalid={!!errors.startDate}
              className={inputCls}
            />
          </Field>

          <Field
            label="End date"
            htmlFor="nb-end"
            error={errors.endDate}
            hint={
              autoEnd && !endDate
                ? `Will be ${formatDate(autoEnd)}`
                : "Leave empty to use the start date."
            }
          >
            <input
              id="nb-end"
              type="date"
              min={autoEnd || startDate || undefined}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                clearError("endDate");
              }}
              aria-invalid={!!errors.endDate}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3 sm:col-span-2">
            <Field label="Adults" htmlFor="nb-adults" error={errors.adults}>
              <input
                id="nb-adults"
                type="number"
                inputMode="numeric"
                min={1}
                value={adults}
                onChange={(e) => {
                  setAdults(e.target.value);
                  clearError("adults");
                }}
                className={inputCls}
              />
            </Field>
            <Field
              label="Children"
              htmlFor="nb-children"
              error={errors.children}
            >
              <input
                id="nb-children"
                type="number"
                inputMode="numeric"
                min={0}
                value={children}
                onChange={(e) => {
                  setChildren(e.target.value);
                  clearError("children");
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Currency" htmlFor="nb-currency">
              <div className="relative">
                <select
                  id="nb-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
                />
              </div>
            </Field>
          </div>

          <Field
            label="Title"
            htmlFor="nb-title"
            className="sm:col-span-2"
            hint={
              customer
                ? `Leave empty for "${customer.name}${itinerary ? ` · ${itinerary.name}` : ""}"`
                : "Optional"
            }
          >
            <input
              id="nb-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smith family, spring 2027"
              className={inputCls}
            />
          </Field>
        </div>

        <ServerError error={create.error} />
        <FormFooter
          onCancel={onClose}
          isPending={create.isPending}
          submitLabel="Create booking"
        />
      </form>
    </Modal>
  );
}
