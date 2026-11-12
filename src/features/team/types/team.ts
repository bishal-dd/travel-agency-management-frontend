/** Every role registered in auth/permissions.ts → organizationRoles. */
export type Role = "owner" | "admin" | "staff" | "accountant" | "member";

/** Roles you can invite into or switch someone to. ("admin" is shown as Manager.) */
export type AssignableRole = "staff" | "accountant" | "admin";

export interface TeamMember {
  id: string;
  userId: string;
  role: Role | string;
  createdAt: string | Date;
  user: { id: string; name: string; email: string; image?: string | null };
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: Role | string;
  status: "pending" | "accepted" | "rejected" | "canceled" | string;
  expiresAt: string | Date;
  inviterId?: string;
}
