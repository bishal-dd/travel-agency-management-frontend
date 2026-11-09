"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../../hotel/ui/Modal";
import {
  ChipPicker,
  Field,
  FormFooter,
  ServerError,
  inputCls,
} from "../../shared/components/FormBits";
import { TagInput } from "../../shared/components/TagInput";
import { useCreateItinerary } from "../hooks/useCreateItinerary";
import { DESTINATIONS, ITINERARY_CATEGORIES } from "../constants/itinerary";

/** Asks only for the basics, then opens the editor to add days. */
export function CreateItineraryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const create = useCreateItinerary();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string>();

  useEffect(() => {
    if (!open) return;
    setName("");
    setCategory("");
    setDestinations([]);
    setNameError(undefined);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setNameError("Give the itinerary a name.");

    create.mutate(
      { name: name.trim(), category: category.trim() || null, destinations },
      {
        onSuccess: (res) => {
          onClose();
          router.push(`/dashboard/itineraries/${res.data.id}`);
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={create.isPending}
      title="New itinerary"
      description="Start with the basics. You'll add the days next."
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <Field label="Name" htmlFor="it-name" required error={nameError}>
            <input
              id="it-name"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
              aria-invalid={!!nameError}
              placeholder="e.g. Classic Bhutan, 7 days"
              className={inputCls}
            />
          </Field>

          <Field label="Category" htmlFor="it-category">
            <ChipPicker
              label="Common categories"
              options={ITINERARY_CATEGORIES}
              value={category}
              onPick={(c) => setCategory(category === c ? "" : c)}
            />
            <input
              id="it-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Or type your own"
              className={`${inputCls} mt-2`}
            />
          </Field>

          <Field label="Destinations" htmlFor="it-destinations">
            <TagInput
              id="it-destinations"
              value={destinations}
              onChange={setDestinations}
              suggestions={DESTINATIONS}
              placeholder="Type a place and press Enter"
              capitalize
            />
          </Field>
        </div>

        <ServerError error={create.error} />
        <FormFooter
          onCancel={onClose}
          isPending={create.isPending}
          submitLabel="Create and add days"
        />
      </form>
    </Modal>
  );
}
