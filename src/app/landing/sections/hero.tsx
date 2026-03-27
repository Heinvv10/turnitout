import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        {/* Copy */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Stop Stressing About Your Assignment
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            The only pre-submission checker built for South African students.
            Grammar, plagiarism, citations, grading &mdash; all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/editor">
              <Button size="lg" className="h-11 px-6 text-base">
                Start Free
              </Button>
            </Link>
            <a href="#pricing">
              <Button variant="outline" size="lg" className="h-11 px-6 text-base">
                See Pricing
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-accent-foreground">&#10003;</span>
              Used at Cornerstone Institute
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent-foreground">&#10003;</span>
              20+ AI-powered checks
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent-foreground">&#10003;</span>
              Works in Afrikaans
            </span>
          </div>
        </div>

        {/* Hero image with fallback */}
        <div className="relative hidden lg:block">
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-students.png"
              alt="South African students using TurnItOut"
              className="size-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
