"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { useGuideLogins, useInviteGuide } from "../hooks/useGuideLogins";

/**
 * Under a guide's email: do they have an HMT login?
 * "Has a login" / "Invited · Resend" / "Invite to HMT".
 */
export function GuideLoginStatus({ email }: { email: string | null }) {
  const logins = useGuideLogins();
  const invite = useInviteGuide(logins.organizationId);
  const [sent, setSent] = useState(false);
  const login = logins.lookup(email);

  if (!email || !login) return null;

  if (login.state === "joined") {
    return (
      <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <Check size={12} aria-hidden="true" />
        {login.role === "guide" ? "Has a login" : `Team member (${login.roleLabel})`}
      </p>
    );
  }

  if (!logins.canInvite) {
    return login.state === "invited" ? <p className="mt-1 text-xs text-ink-soft">Invited</p> : null;
  }

  const resend = login.state === "invited";
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
      {resend && <span className="text-ink-soft">{sent ? "Invitation sent" : "Invited"}</span>}
      <button
        type="button"
        disabled={invite.isPending}
        onClick={() =>
          invite
            .send(email, resend)
            .then(() => setSent(true))
            .catch(() => {})
        }
        className="inline-flex items-center gap-1 font-semibold text-lagoon-deep hover:underline disabled:opacity-50"
      >
        {invite.isPending ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : !resend && <Send size={12} aria-hidden="true" />}
        {resend ? "Resend" : "Invite to HMT"}
      </button>
      {invite.error && <span className="w-full text-red-700">{invite.error.message}</span>}
    </div>
  );
}
