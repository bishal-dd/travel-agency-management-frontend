import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripdesk | Travel agency management platform",
  description:
    "Customers, bookings, tour packages, itineraries, payments and documents in one place. Tripdesk is the operating system for modern travel agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
