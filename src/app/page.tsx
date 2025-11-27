import { SiteHeader } from "@/components/shared/site-header";
import { Hero } from "@/components/landing/hero";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeatureShowcase />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
