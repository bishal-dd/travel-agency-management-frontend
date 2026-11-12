"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Modal } from "../../hotel/ui/Modal";
import { ConfirmDeleteDialog } from "../../shared/components/ConfirmDeleteDialog";
import { Field, ServerError, inputCls } from "../../shared/components/FormBits";
import {
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
} from "../hooks/useTeam";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTION, ROLE_LABEL } from "../roles";
import type { AssignableRole, TeamMember } from "../types/team";

/** Staff / Accountant / Manager as selectable cards with what each can do. */
function RolePicker({
  value,
  onChange,
  name,
}: {
  value: AssignableRole;
  onChange: (r: AssignableRole) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">Role</legend>
      <div className="space-y-2">
        {ASSIGNABLE_ROLES.map((r) => {
          const on = value === r;
          return (
            <label
              key={r}
              className={`flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 ring-1 ring-inset transition-colors ${
                on
                  ? "bg-lagoon-tint ring-lagoon-deep"
                  : "ring-line hover:ring-ink/30"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={r}
                checked={on}
                onChange={() => onChange(r)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ring-1 ring-inset ${
                  on ? "bg-lagoon-deep ring-lagoon-deep" : "ring-ink/30"
                }`}
              >
                {on && <Check size={11} className="text-white" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {ROLE_LABEL[r]}
                </span>
                <span className="block text-xs text-ink-soft">
                  {ROLE_DESCRIPTION[r]}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function DialogFooter({
  onCancel,
  pending,
  label,
  disabled,
}: {
  onCancel: () => void;
  pending: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending || disabled}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-lagoon-deep disabled:opacity-60"
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}

// ---------- invite ----------

export function InviteMemberDialog({
  open,
  onClose,
  organizationId,
  agencyName,
  existingEmails,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  organizationId?: string;
  agencyName: string;
  /** Members' and pending invitees' emails, to catch duplicates early. */
  existingEmails: string[];
  onInvited: (email: string) => void;
}) {
  const invite = useInviteMember(organizationId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("staff");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setRole("staff");
    setFormError(null);
    invite.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return setFormError("Enter a valid email address.");
    if (existingEmails.includes(value))
      return setFormError(
        "This person is already a member or has a pending invitation.",
      );
    setFormError(null);
    invite.mutate(
      { email: value, role },
      { onSuccess: () => onInvited(value) },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={invite.isPending}
      size="sm"
      title="Invite a member"
      description={`They'll get an invitation to join ${agencyName}.`}
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="space-y-5 overflow-y-auto px-6 py-6">
          <Field label="Email" htmlFor="invite-email">
            <input
              id="invite-email"
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={inputCls}
            />
          </Field>
          <RolePicker value={role} onChange={setRole} name="invite-role" />
        </div>
        {formError && (
          <p
            role="alert"
            className="mx-6 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}
        <ServerError error={invite.error} />
        <DialogFooter
          onCancel={onClose}
          pending={invite.isPending}
          label="Send invitation"
          disabled={!email.trim()}
        />
      </form>
    </Modal>
  );
}

// ---------- change role ----------

export function ChangeRoleDialog({
  member,
  organizationId,
  onClose,
}: {
  member: TeamMember | null;
  organizationId?: string;
  onClose: () => void;
}) {
  const update = useUpdateMemberRole(organizationId);
  const [role, setRole] = useState<AssignableRole>("staff");

  useEffect(() => {
    if (!member) return;
    const current = member.role === "member" ? "staff" : member.role;
    setRole(
      (ASSIGNABLE_ROLES as string[]).includes(current)
        ? (current as AssignableRole)
        : "staff",
    );
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  const unchanged =
    !!member &&
    (member.role === role || (member.role === "member" && role === "staff"));

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      locked={update.isPending}
      size="sm"
      title="Change role"
      description={
        member ? `${member.user.name} · ${member.user.email}` : undefined
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (member)
            update.mutate(
              { memberId: member.id, role },
              { onSuccess: onClose },
            );
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="overflow-y-auto px-6 py-6">
          <RolePicker value={role} onChange={setRole} name="member-role" />
          <p className="mt-3 text-xs text-ink-soft">
            The change applies straight away, including to pages they have open.
          </p>
        </div>
        <ServerError error={update.error} />
        <DialogFooter
          onCancel={onClose}
          pending={update.isPending}
          label="Save role"
          disabled={unchanged}
        />
      </form>
    </Modal>
  );
}

// ---------- remove ----------

export function RemoveMemberDialog({
  member,
  organizationId,
  agencyName,
  onClose,
}: {
  member: TeamMember | null;
  organizationId?: string;
  agencyName: string;
  onClose: () => void;
}) {
  const remove = useRemoveMember(organizationId);

  useEffect(() => {
    if (member) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  return (
    <ConfirmDeleteDialog
      open={!!member}
      title="Remove from team?"
      confirmLabel="Remove"
      isPending={remove.isPending}
      error={remove.error}
      onClose={onClose}
      onConfirm={() =>
        member && remove.mutate(member.id, { onSuccess: onClose })
      }
    >
      <p>
        <span className="font-semibold text-ink">{member?.user.name}</span> will
        lose access to {agencyName} straight away. Bookings and payments they
        worked on stay as they are. You can invite them again later.
      </p>
    </ConfirmDeleteDialog>
  );
}
