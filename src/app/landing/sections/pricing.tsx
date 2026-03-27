import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Plan = {
  name: string
  price: string
  period?: string
  subtitle: string
  features: string[]
  cta: string
  badge?: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "R0",
    subtitle: "2 AI checks to try",
    features: [
      "All local features",
      "Readability & vocabulary",
      "ESL & Afrikaans",
      "Citation cross-check",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro Monthly",
    price: "R199",
    period: "/mo",
    subtitle: "15 AI checks/month",
    features: [
      "Everything in Free plus:",
      "Full AI analysis",
      "Academizer",
      "Writing coach",
      "Citation generator",
    ],
    cta: "Get Pro",
  },
  {
    name: "Term Pass",
    price: "R499",
    subtitle: "40 AI checks",
    features: [
      "~10 weeks coverage",
      "All Pro features",
      "Predictable cost",
    ],
    cta: "Buy Term Pass",
  },
  {
    name: "Semester Pass",
    price: "R899",
    subtitle: "80 AI checks",
    features: [
      "~5 months coverage",
      "All Pro features",
      "Best for most students",
    ],
    badge: "MOST POPULAR",
    highlighted: true,
    cta: "Buy Semester Pass",
  },
  {
    name: "Annual Pass",
    price: "R1,699",
    subtitle: "150 AI checks",
    features: [
      "Full year coverage",
      "All Pro features",
      "Save 29% vs monthly",
    ],
    badge: "BEST VALUE",
    cta: "Buy Annual Pass",
  },
  {
    name: "Pay-as-you-go",
    price: "R25",
    period: "/check",
    subtitle: "No commitment",
    features: [
      "Buy when you need it",
      "Like airtime — top up anytime",
      "All Pro features per check",
    ],
    cta: "Buy a Check",
  },
]

function PricingCard({ plan }: { plan: Plan }) {
  const isHighlighted = plan.highlighted
  return (
    <Card
      className={`relative flex flex-col ${
        isHighlighted
          ? "border-primary/40 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
          : ""
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-2.5 right-4">
          <Badge variant={isHighlighted ? "default" : "secondary"}>
            {plan.badge}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardDescription>{plan.name}</CardDescription>
        <CardTitle className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-sm font-normal text-muted-foreground">
              {plan.period}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ul className="flex-1 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link href="/editor" className="mt-auto">
          <Button
            className="w-full"
            variant={isHighlighted ? "default" : "outline"}
            size="lg"
          >
            {plan.cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/40 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Simple pricing. No surprises.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-muted-foreground">
          All prices in South African Rand. All plans include unlimited local features.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Institutional link */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need institutional pricing?{" "}
          <Link href="/institutional" className="font-medium text-primary underline-offset-4 hover:underline">
            Contact us for a custom quote
          </Link>
        </p>

        {/* Explainer */}
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">What counts as 1 AI check?</p>
          <p className="mt-1">
            A full &ldquo;Run All Checks&rdquo; (grammar, citations, plagiarism, AI risk,
            grading, tone, advice) = 1 check. A Quick Check = 0.5 checks. Academize and
            Paraphrase = 0.25 checks each. Local features (readability, vocabulary, ESL,
            citation cross-check) are always free and unlimited.
          </p>
        </div>
      </div>
    </section>
  )
}
