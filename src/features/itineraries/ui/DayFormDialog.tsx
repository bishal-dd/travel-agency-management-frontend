"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, Search, X } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { useHotels } from "../../hotel/hooks/useHotels";
import { useServices } from "../../service/hooks/useServices";
import { formatPrice } from "@/src/lib/format";
import { Field, inputCls } from "../../shared/components/FormBits";
import { TagInput } from "../../shared/components/TagInput";
import { DESTINATIONS, MEALS } from "../constants/itinerary";
import { Meal } from "../types/itinerary";
import { DraftDay } from "../utils/editorState";

/** Hotels and services are loaded once each for the pickers. Keep ≤ your backend's max `limit`. */
const PICKER_LIMIT = 100;

type Props = {
  open: boolean;
  dayNumber: number;
  /** The day being edited (a fresh empty day when adding). */
  initial: DraftDay | null;
  onClose: () => void;
  onSave: (day: DraftDay) => void;
  /** Hide the services picker (booking days get priced items in a later stage). */
  withServices?: boolean;
  /** Shown under the title, e.g. the booking day's date. */
  subtitle?: string;
};

/** Edits one day in memory. Nothing is sent to the server until the editor's Save. */
export function DayFormDialog({
  open,
  dayNumber,
  initial,
  onClose,
  onSave,
  withServices = true,
  subtitle = "Changes are kept until you save the itinerary.",
}: Props) {
  const [day, setDay] = useState<DraftDay | null>(initial);
  const [titleError, setTitleError] = useState<string>();
  const [serviceQuery, setServiceQuery] = useState("");

  const { hotels } = useHotels({ status: "active", limit: PICKER_LIMIT });
  const { services } = useServices({ status: "active", limit: PICKER_LIMIT });

  useEffect(() => {
    if (!open) return;
    setDay(initial);
    setTitleError(undefined);
    setServiceQuery("");
  }, [open, initial]);

  const pickedIds = useMemo(
    () => new Set(day?.services.map((s) => s.service.id)),
    [day],
  );

  const serviceOptions = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    return services
      .filter((s) => !pickedIds.has(s.id))
      .filter(
        (s) =>
          !q || [s.name, s.category].some((v) => v.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [services, pickedIds, serviceQuery]);

  if (!day) return null;

  const set = <K extends keyof DraftDay>(key: K, value: DraftDay[K]) =>
    setDay((d) => (d ? { ...d, [key]: value } : d));

  function toggleMeal(m: Meal) {
    set(
      "meals",
      day!.meals.includes(m)
        ? day!.meals.filter((x) => x !== m)
        : [...day!.meals, m],
    );
  }

  function setQuantity(serviceId: string, quantity: number) {
    set(
      "services",
      day!.services.map((s) =>
        s.service.id === serviceId
          ? { ...s, quantity: Math.max(1, Math.min(100, quantity)) }
          : s,
      ),
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!day!.title.trim()) return setTitleError("Give the day a title.");
    onSave(day!);
  }

  // If the day's hotel is no longer active it won't be in the list; keep it selectable.
  const hotelOptions =
    day.suggestedHotel && !hotels.some((h) => h.id === day.suggestedHotel!.id)
      ? [day.suggestedHotel, ...hotels]
      : hotels;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initial?.title
          ? `Day ${dayNumber} · ${initial.title}`
          : `Day ${dayNumber}`
      }
      description={subtitle}
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Title"
            htmlFor="day-title"
            required
            error={titleError}
            className="sm:col-span-2"
          >
            <input
              id="day-title"
              autoFocus
              value={day.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (titleError) setTitleError(undefined);
              }}
              aria-invalid={!!titleError}
              placeholder="e.g. Arrive Paro → drive to Thimphu"
              className={inputCls}
            />
          </Field>

          <Field label="Destination" htmlFor="day-destination">
            <input
              id="day-destination"
              list="day-destinations"
              value={day.destination}
              onChange={(e) => set("destination", e.target.value)}
              placeholder="e.g. Thimphu"
              className={inputCls}
            />
          </Field>

          <Field label="Overnight in" htmlFor="day-overnight">
            <input
              id="day-overnight"
              list="day-destinations"
              value={day.overnightLocation}
              onChange={(e) => set("overnightLocation", e.target.value)}
              placeholder="Leave empty on departure day"
              className={inputCls}
            />
          </Field>
          <datalist id="day-destinations">
            {DESTINATIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>

          <Field
            label="Description"
            htmlFor="day-description"
            className="sm:col-span-2"
          >
            <textarea
              id="day-description"
              value={day.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="What happens today, in a few sentences for the guest"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>

          <Field label="Meals included" className="sm:col-span-2">
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Meals included"
            >
              {MEALS.map((m) => {
                const on = day.meals.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleMeal(m.value)}
                    className={`h-8 rounded-full px-4 text-sm font-semibold transition-colors ${
                      on
                        ? "bg-ink text-white"
                        : "bg-mist text-ink-soft hover:text-ink"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="Activities"
            htmlFor="day-activities"
            className="sm:col-span-2"
          >
            <TagInput
              id="day-activities"
              value={day.activities}
              onChange={(a) => set("activities", a)}
              placeholder="e.g. Tachog Lhakhang, then press Enter"
              maxTags={30}
            />
          </Field>

          <Field
            label="Suggested hotel"
            htmlFor="day-hotel"
            className="sm:col-span-2"
          >
            <div className="relative">
              <select
                id="day-hotel"
                value={day.suggestedHotel?.id ?? ""}
                onChange={(e) => {
                  const h = hotelOptions.find((x) => x.id === e.target.value);
                  set(
                    "suggestedHotel",
                    h ? { id: h.id, name: h.name, city: h.city } : null,
                  );
                }}
                className={`${inputCls} appearance-none pr-9`}
              >
                <option value="">No hotel (e.g. departure day)</option>
                {hotelOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} · {h.city}
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

          {withServices && (
            <Field
              label="Services"
              htmlFor="day-service-search"
              className="sm:col-span-2"
            >
              {day.services.length > 0 && (
                <ul className="mb-2 divide-y divide-line rounded-lg border border-line">
                  {day.services.map(({ service, quantity }) => (
                    <li
                      key={service.id}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {service.name}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {service.category} ·{" "}
                          {formatPrice(service.price, service.currency)}
                          {service.status === "inactive" && " · inactive"}
                        </p>
                      </div>
                      <div className="flex h-8 items-center rounded-lg border border-line">
                        <button
                          type="button"
                          aria-label={`Fewer ${service.name}`}
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(service.id, quantity - 1)}
                          className="grid size-8 place-items-center text-ink-soft hover:text-ink disabled:opacity-40"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`More ${service.name}`}
                          onClick={() => setQuantity(service.id, quantity + 1)}
                          className="grid size-8 place-items-center text-ink-soft hover:text-ink"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${service.name}`}
                        onClick={() =>
                          set(
                            "services",
                            day.services.filter(
                              (s) => s.service.id !== service.id,
                            ),
                          )
                        }
                        className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30">
                <Search size={14} aria-hidden="true" />
                <span className="sr-only">Find a service</span>
                <input
                  id="day-service-search"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="Find a service to add"
                  className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft"
                />
              </label>
              {serviceOptions.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {serviceOptions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() =>
                          set("services", [
                            ...day.services,
                            {
                              quantity: 1,
                              service: {
                                id: s.id,
                                name: s.name,
                                category: s.category,
                                durationMinutes: s.durationMinutes,
                                price: s.price,
                                currency: s.currency,
                                status: s.status,
                              },
                            },
                          ])
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-lagoon-tint"
                      >
                        <Plus size={13} className="shrink-0 text-lagoon-deep" />
                        <span className="min-w-0 flex-1 truncate text-ink">
                          {s.name}
                        </span>
                        <span className="shrink-0 text-xs text-ink-soft">
                          {formatPrice(s.price, s.currency)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-ink-soft">
                  {services.length === 0
                    ? "No active services yet. Add them on the Services page."
                    : "No more matching services."}
                </p>
              )}
            </Field>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep"
          >
            Done
          </button>
        </div>
      </form>
    </Modal>
  );
}
