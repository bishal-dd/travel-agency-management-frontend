import { Benefits } from "../features/landing-page/ui/Benefits";
import { CallToAction } from "../features/landing-page/ui/CallToAction";
import { Features } from "../features/landing-page/ui/Features";
import { Footer } from "../features/landing-page/ui/Footer";
import { Hero } from "../features/landing-page/ui/Hero";
import { HowItWorks } from "../features/landing-page/ui/HowItWorks";
import { Navbar } from "../features/landing-page/ui/Navbar";
import { ProductPreview } from "../features/landing-page/ui/ProductPreview";
import { Testimonials } from "../features/landing-page/ui/Testimonials";
import { TrustedBy } from "../features/landing-page/ui/TrustedBy";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <ProductPreview />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
