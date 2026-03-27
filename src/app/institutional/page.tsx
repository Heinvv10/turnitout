import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { InquiryForm } from "./inquiry-form";

const VALUE_PROPS = [
  {
    icon: Shield,
    title: "Reduce Plagiarism",
    description:
      "Students check their work before they submit. Catch AI-generated content, missing citations, and originality issues early.",
  },
  {
    icon: Users,
    title: "Build Writing Skills",
    description:
      "ESL support, academic phrasebank, vocabulary coaching, and tone analysis help students become better writers.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description:
      "Draft tracking, provenance logs, and rubric alignment give lecturers visibility into the writing process.",
  },
  {
    icon: Building,
    title: "Affordable",
    description:
      "From R99/student/year with volume discounts. No hidden fees, no per-check charges for licensed institutions.",
  },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    students: "Up to 500 students",
    price: "R99",
    unit: "/student/year",
    features: [
      "All pre-submission checks",
      "AI detection + originality scoring",
      "Academic tone & grammar coaching",
      "Student dashboard & history",
      "Email support",
    ],
  },
  {
    name: "Growth",
    students: "500 - 2,000 students",
    price: "R79",
    unit: "/student/year",
    highlight: true,
    features: [
      "Everything in Starter",
      "Institutional analytics dashboard",
      "Module outline integration",
      "Priority support",
      "Onboarding workshop",
    ],
  },
  {
    name: "Enterprise",
    students: "2,000+ students",
    price: "Custom",
    unit: "",
    features: [
      "Everything in Growth",
      "LMS integration (Moodle, Blackboard)",
      "Custom rubric templates",
      "Dedicated account manager",
      "SLA & data residency options",
    ],
  },
];

const FEATURES_LIST = [
  "AI writing detection (GPT, Claude, Gemini)",
  "Plagiarism & originality scoring",
  "Citation format checking (APA 7, Harvard, IEEE)",
  "Academic tone & formality analysis",
  "Grammar & language coaching",
  "ESL-friendly paraphrasing tools",
  "Draft history & provenance logs",
  "Module-specific rubric alignment",
  "Student progress dashboard",
  "Unlimited pre-submission checks",
];

export default function InstitutionalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar */}
      <header className="sticky top-0 z-30 border-b bg-card px-4 py-3 header-frosted">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">TurnItOut</h1>
              <p className="text-xs text-muted-foreground">For Institutions</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to App
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-8">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            <Building className="mr-1.5 h-3.5 w-3.5 inline" />
            Institutional Licensing
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            TurnItOut for Institutions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Empower your students to check their work before submission. Bulk
            licensing gives every student access to AI detection, originality
            scoring, and academic writing coaching at a fraction of the cost.
          </p>
        </section>

        {/* Value Propositions */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <Card key={prop.title} className="border-primary/10">
              <CardHeader className="pb-3">
                <prop.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{prop.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Pricing Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">Simple, Transparent Pricing</h3>
            <p className="text-muted-foreground">
              All prices in South African Rand (ZAR). Billed annually.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.highlight
                    ? "border-primary shadow-lg shadow-primary/10 relative"
                    : "border-border"
                }
              >
                {tier.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.students}</p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.unit}</span>
                  </div>
                  <ul className="space-y-2 text-left text-sm">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Included */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-center">
            Everything Included in Every Plan
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 max-w-3xl mx-auto">
            {FEATURES_LIST.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Get Started</h3>
            <p className="text-muted-foreground">
              Tell us about your institution and we&apos;ll prepare a tailored proposal.
            </p>
          </div>
          <InquiryForm />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20 py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Powered by TurnItOut
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Student App
            </Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
