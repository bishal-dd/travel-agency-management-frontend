import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";

export const controlClass =
  "h-11 w-full rounded-xl bg-white px-3.5 text-[15px] text-ink ring-1 ring-inset ring-line transition-shadow placeholder:text-ink-soft/60 hover:ring-ink/30 focus:ring-2 focus:ring-lagoon focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 ring-1 ring-line sm:p-7">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-1.5 text-sm text-red-700">
      <CircleAlert size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function SuccessText({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-1.5 text-sm text-lagoon-deep">
      <CircleCheck size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function Loading({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-ink-soft">
      <LoaderCircle size={15} className="animate-spin" />
      {children}
    </p>
  );
}

/** Full-screen state used while the session loads or when signed out. */
export function CenteredState({ children }: { children: ReactNode }) {
  return (
    <main className="contours grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-line">
        {children}
      </div>
    </main>
  );
}
