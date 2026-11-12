import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
  memberAc,
} from "better-auth/plugins/organization/access";

/**
 * All permissions available within a travel agency.
 */
export const statement = {
  ...defaultStatements,

  agency: ["read", "update", "delete"],
  teamManagement: ["read", "invite", "update", "remove"],
  customer: ["read", "create", "update", "delete"],
  quote: ["read", "create", "update", "delete"],
  booking: ["read", "create", "update", "cancel"],
  itinerary: ["read", "create", "update", "delete"],
  guest: ["read", "create", "update", "delete"],
  visa: ["read", "update"],

  hotel: ["read", "create", "update", "delete"],
  guide: ["read", "create", "update", "delete"],
  driver: ["read", "create", "update", "delete"],
  vehicle: ["read", "create", "update", "delete"],
  service: ["read", "create", "update", "delete"],

  rate: ["read", "create", "update", "delete"],
  operation: ["read", "assign", "update"],

  payment: ["read", "create", "update"],
  invoice: ["read", "create", "update", "delete"],
  payable: ["read", "create", "update", "delete"],
  report: ["read"],

  subscription: ["read", "manage"],
} as const;

/**
 * Type-safe permission requirements for authorization middleware.
 */
export type PermissionInput = Partial<{
  [Resource in keyof typeof statement]: Array<
    (typeof statement)[Resource][number]
  >;
}>;

/**
 * Creates the access control instance.
 */
export const ac = createAccessControl(statement);

/**
 * Shared application permissions.
 */
const agencyRead = {
  agency: ["read"],
} as const;

const teamManagement = {
  teamManagement: ["read", "invite", "update", "remove"],
} as const;

const salesPermissions = {
  customer: ["read", "create", "update", "delete"],
  itinerary: ["read", "create", "update", "delete"],
  quote: ["read", "create", "update", "delete"],
  booking: ["read", "create", "update", "cancel"],
  guest: ["read", "create", "update", "delete"],
  visa: ["read", "update"],
} as const;

const resourceManagement = {
  hotel: ["read", "create", "update", "delete"],
  guide: ["read", "create", "update", "delete"],
  driver: ["read", "create", "update", "delete"],
  vehicle: ["read", "create", "update", "delete"],
  service: ["read", "create", "update", "delete"],
} as const;

const financialPermissions = {
  payment: ["read", "create", "update"],
  invoice: ["read", "create", "update", "delete"],
  payable: ["read", "create", "update", "delete"],
  report: ["read"],
} as const;

/**
 * Owner:
 * Full agency access, including agency deletion and subscription management.
 */
export const owner = ac.newRole({
  ...ownerAc.statements,

  agency: ["read", "update", "delete"],
  ...teamManagement,
  ...salesPermissions,
  ...resourceManagement,

  rate: ["read", "create", "update", "delete"],
  operation: ["read", "assign", "update"],

  ...financialPermissions,

  subscription: ["read", "manage"],
});

/**
 * Manager:
 * Manages agency operations and staff but cannot delete the agency,
 * manage subscriptions, or directly change member roles through
 * Better Auth's built-in member-management endpoints.
 */
export const manager = ac.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],

  ...agencyRead,
  agency: ["read", "update"],

  ...teamManagement,
  ...salesPermissions,
  ...resourceManagement,

  rate: ["read", "create", "update", "delete"],
  operation: ["read", "assign", "update"],

  ...financialPermissions,

  subscription: ["read"],
});

/**
 * Staff:
 * Handles sales, reservations, guest information and visa tracking.
 * Resource information is read-only.
 */
export const staff = ac.newRole({
  ...memberAc.statements,

  ...agencyRead,
  customer: ["read", "create", "update"],
  itinerary: ["read"],
  quote: ["read", "create", "update"],
  booking: ["read", "create", "update"],
  guest: ["read", "create", "update"],
  visa: ["read", "update"],

  hotel: ["read"],
  guide: ["read"],
  driver: ["read"],
  vehicle: ["read"],
  service: ["read"],
});

/**
 * Accountant:
 * Handles financial records and reports.
 * Booking access is read-only.
 */
export const accountant = ac.newRole({
  ...memberAc.statements,

  ...agencyRead,

  itinerary: ["read"],
  booking: ["read"],

  payment: ["read", "create", "update"],
  invoice: ["read", "create", "update"],
  payable: ["read", "create", "update"],
  report: ["read"],
});

/**
 * Organization roles registered with Better Auth.
 *
 * owner: Owner
 * admin: Manager
 * member: Staff (legacy compatibility)
 */
export const organizationRoles = {
  owner,
  admin: manager,
  staff,
  accountant,
  member: staff,
} as const;
