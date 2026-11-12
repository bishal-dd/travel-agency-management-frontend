import type { Metadata } from "next";
import { Suspense } from "react";
// Adjust to wherever you put the quote-public feature folder.
import {
  PublicQuotePage,
  PublicQuoteSkeleton,
} from "@/src/features/quote-public/PublicQuotePage";

// The customer's quote page: no sign-in, never indexed by search engines.
export const metadata: Metadata = {
  title: "Your trip quote",
  robots: { index: false, follow: false },
};

export default function Page() {
  // useParams() inside needs a <Suspense> boundary on dynamic routes.
  return (
    <Suspense fallback={<PublicQuoteSkeleton />}>
      <PublicQuotePage />
    </Suspense>
  );
}
