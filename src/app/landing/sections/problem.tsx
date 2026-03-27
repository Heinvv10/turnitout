import { Card, CardContent } from "@/components/ui/card"

const painPoints = [
  {
    emoji: "\uD83D\uDE30",
    text: "You finished your essay at 2am but have no idea if it\u2019s good enough",
  },
  {
    emoji: "\uD83D\uDE24",
    text: "Your lecturer keeps marking you down for \u2018poor academic tone\u2019 but won\u2019t explain what that means",
  },
  {
    emoji: "\uD83D\uDE31",
    text: "You got flagged for plagiarism even though you wrote it yourself",
  },
]

export function ProblemSection() {
  return (
    <section id="problem" className="bg-muted/40 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Sound familiar?
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {painPoints.map((point, i) => (
            <Card key={i} className="border-none bg-card shadow-sm">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <span className="text-4xl" role="img" aria-label="emotion">
                  {point.emoji}
                </span>
                <p className="text-base leading-relaxed text-card-foreground">
                  {point.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-lg font-semibold text-primary">
          TurnItOut catches these problems BEFORE you submit &rarr;
        </p>
      </div>
    </section>
  )
}
