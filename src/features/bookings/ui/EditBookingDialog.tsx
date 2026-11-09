"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import {
  Field,
  FormFooter,
  ServerError,
  inputCls,
} from "../../shared/components/FormBits";
import { useUpdateBooking } from "../hooks/useUpdateBooking";
import type { BookingDetail, UpdateBookingInput } from "../types/booking";
import { addDays, formatDate, tripLength } from "./bookingUi";

const CURRENCIES = ["USD", "BTN", "INR", "EUR"];

/** Title, dates, guest numbers, currency and notes. */
export function EditBookingDialog({
  open,
  onClose,
  booking,
}: {
  open: boolean;
  onClose: () => void;
  booking: BookingDetail;
}) {
  const update = useUpdateBooking();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setTitle(booking.title);
    setStartDate(booking.startDate);
    setEndDate(booking.endDate);
    setAdults(String(booking.adults));
    setChildren(String(booking.children));
    setCurrency(booking.currency);
    setNotes(booking.notes ?? "");
    setErrors({});
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking]);

  const length = tripLength(booking.startDate, booking.endDate);
  const dayCount = booking.days.length;

  // Moving the start date keeps the trip length, like the backend does.
  function changeStart(v: string) {
    setStartDate(v);
    if (v && endDate === addDays(startDate, length - 1))
      setEndDate(addDays(v, length - 1));
  }

  const minEnd =
    startDate && dayCount ? addDays(startDate, dayCount - 1) : startDate;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!title.trim()) found.title = "Title is required.";
    if (!startDate) found.startDate = "Choose a start date.";
    if (!endDate) found.endDate = "Choose an end date.";
    else if (endDate < minEnd)
      found.endDate = dayCount
        ? `This booking has ${dayCount} days, so it ends ${formatDate(minEnd)} or later.`
        : "End date is before the start date.";
    const a = Number(adults);
    const c = Number(children);
    if (!Number.isInteger(a) || a < 1) found.adults = "At least 1 adult.";
    if (!Number.isInteger(c) || c < 0) found.children = "Can't be negative.";
    setErrors(found);
    if (Object.keys(found).length) return;

    // Send only what changed.
    const data: UpdateBookingInput = {};
    if (title.trim() !== booking.title) data.title = title.trim();
    if (startDate !== booking.startDate) data.startDate = startDate;
    if (endDate !== booking.endDate) data.endDate = endDate;
    if (a !== booking.adults) data.adults = a;
    if (c !== booking.children) data.children = c;
    if (currency !== booking.currency) data.currency = currency;
    if ((notes.trim() || null) !== booking.notes)
      data.notes = notes.trim() || null;

    if (!Object.keys(data).length) return onClose();
    update.mutate({ bookingId: booking.id, data }, { onSuccess: onClose });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={update.isPending}
      title="Edit booking details"
      description={`${booking.reference} · ${booking.customer.name}`}
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          <Field
            label="Title"
            htmlFor="eb-title"
            required
            error={errors.title}
            className="sm:col-span-2"
          >
            <input
              id="eb-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={!!errors.title}
              className={inputCls}
            />
          </Field>

          <Field
            label="Start date"
            htmlFor="eb-start"
            required
            error={errors.startDate}
            hint={dayCount ? "Every day's date moves with it." : undefined}
          >
            <input
              id="eb-start"
              type="date"
              value={startDate}
              onChange={(e) => changeStart(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field
            label="End date"
            htmlFor="eb-end"
            required
            error={errors.endDate}
          >
            <input
              id="eb-end"
              type="date"
              min={minEnd || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-invalid={!!errors.endDate}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3 sm:col-span-2">
            <Field label="Adults" htmlFor="eb-adults" error={errors.adults}>
              <input
                id="eb-adults"
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label="Children"
              htmlFor="eb-children"
              error={errors.children}
            >
              <input
                id="eb-children"
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Currency" htmlFor="eb-currency">
              <div className="relative">
                <select
                  id="eb-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  {[...new Set([currency, ...CURRENCIES])].map((c) => (
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

          <Field label="Notes" htmlFor="eb-notes" className="sm:col-span-2">
            <textarea
              id="eb-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Special requests, dietary needs, flight numbers…"
              className={`${inputCls} h-auto resize-y py-2`}
            />
          </Field>
        </div>

        <ServerError error={update.error} />
        <FormFooter
          onCancel={onClose}
          isPending={update.isPending}
          submitLabel="Save details"
        />
      </form>
    </Modal>
  );
}
