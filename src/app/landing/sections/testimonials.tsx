import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Testimonial = {
  initials: string
  quote: string
  name: string
  title: string
  bgColor: string
}

const testimonials: Testimonial[] = [
  {
    initials: "SV",
    quote:
      "The ESL tips helped me understand why my lecturer kept saying my writing was 'too informal'. Now I know what academic tone actually means.",
    name: "Shasti V.",
    title: "BA Psychology Year 1, Cornerstone Institute",
    bgColor: "bg-primary/20 text-primary",
  },
  {
    initials: "TM",
    quote:
      "I used to get 55% on essays. After using TurnItOut for one semester, my last essay got 72%. The grade prediction is scarily accurate.",
    name: "Thabo M.",
    title: "BTh Year 2, Cornerstone Institute",
    bgColor: "bg-accent/20 text-accent-foreground",
  },
  {
    initials: "AK",
    quote:
      "I got flagged for plagiarism in first year even though I wrote everything myself \u2014 I just didn't know how to cite properly. TurnItOut's citation checker would have caught that.",
    name: "Anele K.",
    title: "BA Psychology Year 1, Cornerstone Institute",
    bgColor: "bg-secondary text-secondary-foreground",
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-accent-foreground text-accent-foreground" />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          What students are saying
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-none bg-card shadow-sm">
              <CardContent className="flex flex-col gap-4">
                <Stars />
                <blockquote className="text-sm leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.bgColor}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
