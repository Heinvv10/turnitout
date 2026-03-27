import { Upload, Zap, CheckCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Step {
  number: number
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    icon: Upload,
    title: "Paste your essay",
    description: "Copy from Word, Google Docs, or type directly",
  },
  {
    number: 2,
    icon: Zap,
    title: "Run checks",
    description:
      "One click runs grammar, plagiarism, citations, and grading",
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Fix and submit",
    description:
      "Follow suggestions, improve your score, submit with confidence",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How it works
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              {/* Big number */}
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {step.number}
              </span>

              {/* Icon */}
              <step.icon className="mt-4 size-8 text-primary/70" />

              {/* Copy */}
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
