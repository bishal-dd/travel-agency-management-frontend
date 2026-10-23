import { AuthAside } from "@/src/features/auth/AuthAside";
import { Logo } from "@/src/features/landing-page/ui/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header>
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">{children}</div>
        </main>
        <footer className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
          <span>© 2026 Help Make Travel</span>
          <a href="#" className="hover:text-ink">
            Privacy
          </a>
          <a href="#" className="hover:text-ink">
            Terms
          </a>
          <a href="#" className="hover:text-ink">
            Help centre
          </a>
        </footer>
      </div>
      <AuthAside />
    </div>
  );
}
