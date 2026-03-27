import type { Metadata } from "next"
import { LandingNav } from "./sections/nav"
import { HeroSection } from "./sections/hero"
import { ProblemSection } from "./sections/problem"
import { FeaturesSection } from "./sections/features"
import { HowItWorks } from "./sections/how-it-works"
import { ComparisonSection } from "./sections/comparison"
import { PricingSection } from "./sections/pricing"
import { TestimonialsSection } from "./sections/testimonials"
import { FaqSection } from "./sections/faq"
import { CtaSection } from "./sections/cta"
import { Footer as LandingFooter } from "./sections/footer"

export const metadata: Metadata = {
  title: "TurnItOut - The Pre-Submission Checker for SA Students",
  description:
    "Grammar, plagiarism, citations, grading - all in one place. Built for South African students. Replaces R586+/month of separate tools.",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col scroll-smooth">
      <LandingNav />

      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <ComparisonSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
