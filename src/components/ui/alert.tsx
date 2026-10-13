import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/src/lib/cn";

const variants = {
  info: { className: "bg-lagoon-tint text-lagoon-deep", icon: Info, role: "status" },
  success: { className: "bg-lagoon-tint text-lagoon-deep", icon: CircleCheck, role: "status" },
  error: { className: "bg-red-50 text-red-800 ring-1 ring-red-200 ring-inset", icon: CircleAlert, role: "alert" },
} as const;

export function Alert({
  variant = "info",
  action,
  className,
  children,
}: {
  variant?: keyof typeof variants;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const { className: tone, icon: Icon, role } = variants[variant];
  return (
    <div role={role} className={cn("flex items-start gap-2.5 rounded-xl p-3.5 text-sm", tone, className)}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
