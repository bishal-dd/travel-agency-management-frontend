"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, Spinner } from "@/src/components/ui";
import { errorMessage } from "../passport/repository";
import type { Traveller, TravellerInput } from "../passport/types";
import {
  draftToTraveller,
  emptyTravellerDraft,
  hasErrors,
  todayIsoDate,
  validateTraveller,
  type TravellerErrors,
  type TravellerField,
} from "../passport/validation";
import { TravellerFields } from "./TravellerFields";

export function AddTravellerForm({
  existing,
  onAdd,
}: {
  existing: Traveller[];
  onAdd: (input: TravellerInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyTravellerDraft);
  const [errors, setErrors] = useState<TravellerErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setOpen(false);
    setDraft(emptyTravellerDraft);
    setErrors({});
    setFormError("");
    setSaving(false);
  }

  // Close and clear the form (and the passport details in it) when the page is hidden.
  useLayoutEffect(() => reset, []);

  function update(field: TravellerField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validateTraveller(draft, todayIsoDate());
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      setFormError("Check the highlighted fields.");
      return;
    }

    const input = draftToTraveller(draft);
    if (existing.some((t) => t.passport.number === input.passport.number)) {
      setFormError(
        "A traveller with this passport number is already on the trip.",
      );
      return;
    }

    setFormError("");
    setSaving(true);
    try {
      await onAdd(input);
      reset();
    } catch (error) {
      setFormError(
        errorMessage(error, "Unable to add the traveller. Please try again."),
      );
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" /> Add traveller
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <TravellerFields
        title="New traveller"
        value={draft}
        errors={errors}
        disabled={saving}
        onChange={update}
        onRemove={reset}
      />
      {formError && <Alert variant="error">{formError}</Alert>}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={reset} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Spinner label="Adding..." className="text-current" />
          ) : (
            "Add traveller"
          )}
        </Button>
      </div>
    </form>
  );
}
