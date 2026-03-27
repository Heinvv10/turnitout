import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Ready to submit with confidence?
        </h2>
        <p className="mt-3 text-lg text-primary-foreground/80">
          Start free &mdash; no credit card required
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Button
            size="lg"
            className="h-12 bg-white px-8 text-base font-semibold text-primary hover:bg-white/90"
          >
            Start Free &rarr;
          </Button>
        </Link>
        <p className="mt-4 text-sm text-primary-foreground/70">
          2 free AI checks included
        </p>
      </div>
    </section>
  )
}
