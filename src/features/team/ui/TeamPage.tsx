"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  RotateCw,
  Search,
  ShieldCheck,
  UserCog,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import {
  ListHeader,
  ListMessage,
  SkeletonRows,
} from "../../shared/components/ListPage";
import {
  useCancelInvitation,
  useInviteMember,
  useTeam,
} from "../hooks/useTeam";
import {
  ASSIGNABLE_ROLES,
  ROLE_BADGE,
  ROLE_DESCRIPTION,
  canInvite,
  canManageMembers,
  roleLabel,
} from "../roles";
import type { AssignableRole, TeamInvitation, TeamMember } from "../types/team";
import {
  ChangeRoleDialog,
  InviteMemberDialog,
  RemoveMemberDialog,
} from "./TeamDialogs";

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[role] ?? ROLE_BADGE.staff}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function Avatar({ name, image }: { name: string; image?: string | null }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      className="size-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-marigold text-sm font-bold text-ink"
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

const iconBtn =
  "grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-40";

// ---------- members ----------

function MembersTable({
  members,
  meId,
  canManage,
  onChangeRole,
  onRemove,
}: {
  members: TeamMember[];
  meId?: string;
  canManage: boolean;
  onChangeRole: (m: TeamMember) => void;
  onRemove: (m: TeamMember) => void;
}) {
  return (
    <ul className="divide-y divide-line">
      {members.map((m) => {
        const isMe = m.id === meId;
        const editable = canManage && !isMe && m.role !== "owner";
        return (
          <li key={m.id} className="flex items-center gap-4 px-5 py-4">
            <Avatar name={m.user.name} image={m.user.image} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">
                {m.user.name}
                {isMe && (
                  <span className="ml-1.5 text-sm font-normal text-ink-soft">
                    (you)
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-ink-soft">{m.user.email}</p>
            </div>
            <div className="hidden w-32 text-sm text-ink-soft md:block">
              Joined {formatDate(m.createdAt)}
            </div>
            <div className="w-28 shrink-0 text-right sm:text-left">
              <RoleBadge role={m.role} />
            </div>
            <div className="flex w-[4.75rem] shrink-0 justify-end gap-0.5">
              {editable && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeRole(m)}
                    aria-label={`Change role for ${m.user.name}`}
                    title="Change role"
                    className={iconBtn}
                  >
                    <UserCog size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(m)}
                    aria-label={`Remove ${m.user.name}`}
                    title="Remove from team"
                    className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
                  >
                    <UserMinus size={16} />
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---------- invitations ----------

function InvitationRow({
  invitation,
  organizationId,
  canAct,
  now,
}: {
  invitation: TeamInvitation;
  organizationId?: string;
  canAct: boolean;
  now: number;
}) {
  const cancel = useCancelInvitation(organizationId);
  const resend = useInviteMember(organizationId);
  const expired = now > 0 && new Date(invitation.expiresAt).getTime() < now;
  const role = (ASSIGNABLE_ROLES as string[]).includes(invitation.role)
    ? (invitation.role as AssignableRole)
    : "staff";
  const error = cancel.error ?? resend.error;

  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lagoon-tint text-lagoon-deep">
          <Mail size={17} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{invitation.email}</p>
          <p
            className={`text-sm ${expired ? "text-red-600" : "text-ink-soft"}`}
          >
            {expired ? "Expired" : "Expires"} {formatDate(invitation.expiresAt)}
            {resend.isSuccess && (
              <span className="text-lagoon-deep"> · sent again</span>
            )}
          </p>
        </div>
        <div className="w-28 shrink-0 text-right sm:text-left">
          <RoleBadge role={invitation.role} />
        </div>
        <div className="flex w-[4.75rem] shrink-0 justify-end gap-0.5">
          {canAct && (
            <>
              <button
                type="button"
                onClick={() =>
                  resend.mutate({ email: invitation.email, role, resend: true })
                }
                disabled={resend.isPending || cancel.isPending}
                aria-label={`Send the invitation to ${invitation.email} again`}
                title="Send again"
                className={iconBtn}
              >
                {resend.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RotateCw size={16} />
                )}
              </button>
              <button
                type="button"
                onClick={() => cancel.mutate(invitation.id)}
                disabled={cancel.isPending || resend.isPending}
                aria-label={`Cancel the invitation to ${invitation.email}`}
                title="Cancel invitation"
                className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
              >
                {cancel.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 pl-14 text-sm text-red-700">{error.message}</p>
      )}
    </li>
  );
}

// ---------- roles guide ----------

function RolesGuide() {
  const roles = ["owner", "admin", "staff", "accountant"] as const;
  return (
    <section
      aria-labelledby="roles-heading"
      className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6"
    >
      <h2
        id="roles-heading"
        className="flex items-center gap-2 font-semibold text-ink"
      >
        <ShieldCheck
          size={17}
          className="text-lagoon-deep"
          aria-hidden="true"
        />{" "}
        What each role can do
      </h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {roles.map((r) => (
          <div key={r} className="flex gap-3">
            <dt className="w-24 shrink-0">
              <RoleBadge role={r} />
            </dt>
            <dd className="text-sm text-ink-soft">{ROLE_DESCRIPTION[r]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ---------- page ----------

type Tab = "members" | "invitations";

/** Who's in the agency, what they can do, and pending invitations. */
export function TeamPage() {
  const team = useTeam();
  const [tab, setTab] = useState<Tab>("members");
  const [query, setQuery] = useState("");
  const [inviting, setInviting] = useState(false);
  const [changing, setChanging] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // "Now" for expiry badges, read on the client (not during prerender).
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), [team.invitations.length]);

  const allowInvite = canInvite(team.myRole);
  const allowManage = canManageMembers(team.myRole);

  const q = query.trim().toLowerCase();
  const members = useMemo(
    () =>
      q
        ? team.members.filter((m) =>
            `${m.user.name} ${m.user.email} ${roleLabel(m.role)}`
              .toLowerCase()
              .includes(q),
          )
        : team.members,
    [team.members, q],
  );
  const invitations = useMemo(
    () =>
      q
        ? team.invitations.filter((i) =>
            `${i.email} ${roleLabel(i.role)}`.toLowerCase().includes(q),
          )
        : team.invitations,
    [team.invitations, q],
  );
  const existingEmails = useMemo(
    () => [
      ...team.members.map((m) => m.user.email.toLowerCase()),
      ...team.invitations.map((i) => i.email.toLowerCase()),
    ],
    [team.members, team.invitations],
  );

  const header = allowInvite ? (
    <ListHeader
      title="Team"
      description={`People at ${team.agencyName || "your agency"} and what they can do.`}
      addLabel="Invite member"
      onAdd={() => {
        setNotice(null);
        setInviting(true);
      }}
    />
  ) : (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Team</h1>
      <p className="mt-1 text-sm text-ink-soft">
        People at {team.agencyName || "your agency"} and what they can do.
      </p>
    </div>
  );

  return (
    <div>
      {header}

      {notice && (
        <p
          role="status"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-lagoon-tint px-4 py-3 text-sm text-lagoon-deep"
        >
          {notice}
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <X size={15} />
          </button>
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {/* Toolbar: search + Members / Invitations */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 items-center gap-2 rounded-lg bg-mist px-3 text-sm text-ink-soft focus-within:ring-2 focus-within:ring-lagoon-deep/30 sm:w-80">
            <Search size={14} aria-hidden="true" className="shrink-0" />
            <span className="sr-only">Search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "members"
                  ? "Search by name, email or role"
                  : "Search by email or role"
              }
              className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-soft"
            />
          </label>
          <div
            role="tablist"
            aria-label="Team"
            className="flex gap-1 self-start rounded-full bg-mist p-1 sm:self-auto"
          >
            {(
              [
                ["members", "Members", team.members.length],
                ["invitations", "Invitations", team.invitations.length],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                  tab === value
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                <span className="text-xs text-ink-soft">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {team.isPending ? (
          <SkeletonRows />
        ) : team.error ? (
          <ListMessage
            title="Couldn't load the team"
            body={team.error.message}
            action={
              <button
                type="button"
                onClick={() => team.refetch()}
                className="text-sm font-semibold text-lagoon-deep hover:underline"
              >
                Try again
              </button>
            }
          />
        ) : tab === "members" ? (
          members.length === 0 ? (
            <ListMessage
              icon={<Users size={20} />}
              title="No one matches"
              body="Try a different name, email or role."
            />
          ) : (
            <MembersTable
              members={members}
              meId={team.me?.id}
              canManage={allowManage}
              onChangeRole={setChanging}
              onRemove={setRemoving}
            />
          )
        ) : invitations.length === 0 ? (
          <ListMessage
            icon={<Mail size={20} />}
            title={q ? "No invitations match" : "No pending invitations"}
            body={
              q
                ? "Try a different email or role."
                : "Invite colleagues and they'll show here until they join."
            }
            action={
              allowInvite && !q ? (
                <button
                  type="button"
                  onClick={() => setInviting(true)}
                  className="inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line hover:ring-ink/40"
                >
                  Invite member
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {invitations.map((i) => (
              <InvitationRow
                key={i.id}
                invitation={i}
                organizationId={team.organizationId}
                canAct={allowInvite}
                now={now}
              />
            ))}
          </ul>
        )}

        {!allowManage &&
          !team.isPending &&
          !team.error &&
          tab === "members" && (
            <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">
              Only the owner can change roles or remove people.
            </p>
          )}
      </div>

      <RolesGuide />

      <InviteMemberDialog
        open={inviting}
        onClose={() => setInviting(false)}
        organizationId={team.organizationId}
        agencyName={team.agencyName}
        existingEmails={existingEmails}
        onInvited={(email) => {
          setInviting(false);
          setTab("invitations");
          setQuery("");
          setNotice(`Invitation sent to ${email}.`);
        }}
      />
      <ChangeRoleDialog
        member={changing}
        organizationId={team.organizationId}
        onClose={() => setChanging(null)}
      />
      <RemoveMemberDialog
        member={removing}
        organizationId={team.organizationId}
        agencyName={team.agencyName}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
