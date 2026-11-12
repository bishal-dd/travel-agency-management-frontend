import {
  ReceiptPage,
  ReceiptSkeleton,
} from "@/src/features/payments/ui/ReceiptPage";
import type { Metadata } from "next";
import { Suspense } from "react";

// Outside (dashboard) so it prints as a clean page. Signed-in agents only
// (the API checks the session cookie and payment permission).
export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={<ReceiptSkeleton />}>
      <ReceiptPage />
    </Suspense>
  );
}
