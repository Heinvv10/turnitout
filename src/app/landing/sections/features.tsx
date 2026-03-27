import {
  SpellCheck,
  Fingerprint,
  ShieldCheck,
  GraduationCap,
  Quote,
  BookText,
  Languages,
  BookA,
  Volume2,
  RefreshCw,
  History,
  Share2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: SpellCheck,
    title: "Grammar & Tone",
    description: "Academic writing, not just spell-check",
  },
  {
    icon: Fingerprint,
    title: "Plagiarism Detection",
    description: "Catch unintentional matches before Turnitin does",
  },
  {
    icon: ShieldCheck,
    title: "AI Risk Score",
    description: "See how your work looks to AI detectors",
  },
  {
    icon: GraduationCap,
    title: "Grade Prediction",
    description: "Estimate your mark before you submit",
  },
  {
    icon: Quote,
    title: "Citation Generator",
    description: "Harvard & APA, SA conventions included",
  },
  {
    icon: BookText,
    title: "Academic Phrasebank",
    description: "2,000+ phrases for every essay section",
  },
  {
    icon: Languages,
    title: "ESL Support",
    description: "39 language patterns for SA students",
  },
  {
    icon: BookA,
    title: "Vocabulary Coach",
    description: "Upgrade simple words to academic alternatives",
  },
  {
    icon: Volume2,
    title: "Read Aloud",
    description: "Hear your essay to catch awkward phrasing",
  },
  {
    icon: RefreshCw,
    title: "Paraphrasing",
    description: "Rephrase flagged passages in your own voice",
  },
  {
    icon: History,
    title: "Writing Log",
    description: "Prove you wrote it with an authorship trail",
  },
  {
    icon: Share2,
    title: "WhatsApp Share",
    description: "Send your readiness score to study groups",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need. One tool.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Replaces R586+/month of separate tools
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              size="sm"
              className="border-none bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col items-center gap-2 text-center">
                <feature.icon className="size-6 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
