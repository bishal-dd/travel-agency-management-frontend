import type { AssignableRole, Role } from "./types/team";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Manager",
  staff: "Staff",
  accountant: "Accountant",
  guide: "Guide",
  member: "Staff", // legacy name for staff
};

export const roleLabel = (role: string) => ROLE_LABEL[role as Role] ?? role;

/** What each role can do, in plain words (mirrors auth/permissions.ts). */
export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner:
    "Everything, including billing, deleting the agency and changing anyone's role.",
  admin:
    "Runs the agency: bookings, rates, payments, settings and inviting people.",
  staff:
    "Customers, quotes, bookings and travellers. Hotels, guides and vehicles are read-only.",
  accountant: "Payments, invoices and reports. Bookings are read-only.",
  guide:
    "Only the trips they're assigned to: day plan, hotels, guests and crew. No prices. Invite them with the email on their guide profile.",
  member:
    "Customers, quotes, bookings and travellers. Hotels, guides and vehicles are read-only.",
};

export const ASSIGNABLE_ROLES: AssignableRole[] = [
  "staff",
  "accountant",
  "guide",
  "admin",
];

/** Owner first, then managers, accountants, staff. */
export const ROLE_ORDER: string[] = [
  "owner",
  "admin",
  "accountant",
  "staff",
  "member",
  "guide",
];

export const ROLE_BADGE: Record<string, string> = {
  owner: "bg-ink text-white",
  admin: "bg-lagoon-tint text-lagoon-deep",
  accountant: "bg-marigold/20 text-ink",
  guide: "bg-white text-ink ring-1 ring-inset ring-line",
  staff: "bg-mist text-ink-soft",
  member: "bg-mist text-ink-soft",
};

/** Who can do what on this page (the server enforces the same). */
export const canInvite = (role?: string) =>
  role === "owner" || role === "admin";
export const canManageMembers = (role?: string) => role === "owner";
