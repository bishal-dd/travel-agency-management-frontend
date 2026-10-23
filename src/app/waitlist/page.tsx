import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  FileText,
  Route,
  Users,
} from "lucide-react";
import { WaitlistForm } from "@/src/features/landing-page/ui/WaitlistForm";
import { BackToHome } from "@/src/features/landing-page/ui/BackToHome";
import { Logo } from "@/src/features/landing-page/ui/ui";

const features = [
  {
    icon: Users,
    title: "Customers in one place",
    body: "Traveller details, preferences and trip history on a single profile.",
  },
  {
    icon: Route,
    title: "Trips and itineraries",
    body: "Plan day by day and keep every traveller's passport details with the trip.",
  },
  {
    icon: CreditCard,
    title: "Payments you can follow",
    body: "Deposits, balances and what's overdue, without opening a spreadsheet.",
  },
  {
    icon: FileText,
    title: "Documents filed by booking",
    body: "Tickets, visas and vouchers stored against the right trip.",
  },
];

export default function WaitlistPage() {
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Form side */}
      <div className="contours flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <BackToHome />
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[28rem]">
            <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white shadow-lift">
              <CalendarCheck size={22} aria-hidden="true" />
            </span>

            <h1 className="font-display mt-6 text-[2.6rem] leading-[1.05] font-medium text-ink sm:text-5xl">
              Be first to run your agency from one desk.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Help Make Travel is opening to travel agencies in small groups.
              Join the waitlist and we&apos;ll email you when your spot is
              ready.
            </p>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-lift ring-1 ring-line sm:p-7">
              <h2 className="text-lg font-bold text-ink">Get early access</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                One email when we launch, plus early-access invitations. No
                spam.
              </p>
              <div className="mt-5">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </main>

        <footer className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
          <span>© 2026 Help Make Travel</span>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
        </footer>
      </div>

      {/* Feature panel */}
      <aside className="relative hidden overflow-hidden bg-lagoon-deep text-white lg:flex lg:flex-col lg:justify-center lg:p-14 xl:p-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_100%_0%,transparent_0_44px,rgb(255_255_255/0.05)_44px_45px)]"
        />

        <div className="relative max-w-md">
          <h2 className="font-display text-3xl leading-tight font-medium">
            What early access includes
          </h2>
          <p className="mt-3 text-white/70">
            Everything an agency touches in a day, from first enquiry to the
            airport.
          </p>

          <ol className="relative mt-10 space-y-7">
            <span
              aria-hidden="true"
              className="absolute top-5 bottom-5 left-5 border-l-2 border-dashed border-white/25"
            />
            {features.map((feature, index) => (
              <li key={feature.title} className="relative flex gap-4">
                <span
                  className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ring-4 ring-lagoon-deep ${
                    index === features.length - 1
                      ? "bg-marigold text-ink"
                      : "bg-white/10 text-marigold"
                  }`}
                >
                  <feature.icon size={18} aria-hidden="true" />
                </span>
                <div className="pt-1">
                  <p className="font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                    {feature.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
