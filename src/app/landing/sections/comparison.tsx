import { Check, X } from "lucide-react"

type Feature = {
  name: string
  turnitout: boolean
  grammarly: boolean
  quillbot: boolean
  turnitin: boolean
  scribbr: boolean | "partial"
}

const features: Feature[] = [
  { name: "Grammar checking", turnitout: true, grammarly: true, quillbot: true, turnitin: false, scribbr: true },
  { name: "Plagiarism detection", turnitout: true, grammarly: true, quillbot: true, turnitin: true, scribbr: true },
  { name: "AI detection", turnitout: true, grammarly: true, quillbot: false, turnitin: true, scribbr: true },
  { name: "Citation generator", turnitout: true, grammarly: false, quillbot: true, turnitin: false, scribbr: true },
  { name: "Grade prediction", turnitout: true, grammarly: false, quillbot: false, turnitin: false, scribbr: false },
  { name: "ESL support", turnitout: true, grammarly: false, quillbot: false, turnitin: false, scribbr: false },
  { name: "Afrikaans", turnitout: true, grammarly: false, quillbot: false, turnitin: false, scribbr: false },
  { name: "Harvard SA style", turnitout: true, grammarly: false, quillbot: false, turnitin: false, scribbr: "partial" },
  { name: "Paraphrasing", turnitout: true, grammarly: false, quillbot: true, turnitin: false, scribbr: false },
  { name: "Academic phrasebank", turnitout: true, grammarly: false, quillbot: false, turnitin: false, scribbr: false },
]

const competitors = ["TurnItOut", "Grammarly", "QuillBot", "Turnitin", "Scribbr"] as const
const competitorKeys = ["turnitout", "grammarly", "quillbot", "turnitin", "scribbr"] as const
const prices = ["From R199/mo", "R204/mo", "R142/mo", "Institutional only", "R340/doc"]

function StatusIcon({ value }: { value: boolean | "partial" }) {
  if (value === "partial") {
    return <span className="text-xs font-medium text-muted-foreground">Partial</span>
  }
  return value ? (
    <Check className="mx-auto size-5 text-accent-foreground" />
  ) : (
    <X className="mx-auto size-5 text-destructive" />
  )
}

/** Mobile card for a single competitor comparison */
function ComparisonCard({
  competitor,
  competitorKey,
  price,
}: {
  competitor: string
  competitorKey: keyof Feature
  price: string
}) {
  const isTurnItOut = competitor === "TurnItOut"
  return (
    <div
      className={`rounded-xl border p-4 ${
        isTurnItOut
          ? "border-primary/40 bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-base font-semibold ${isTurnItOut ? "text-primary" : "text-foreground"}`}>
          {competitor}
        </h3>
        <span className="text-sm font-medium text-muted-foreground">{price}</span>
      </div>
      <ul className="space-y-2">
        {features.map((f) => {
          const val = f[competitorKey] as boolean | "partial"
          return (
            <li key={f.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{f.name}</span>
              <StatusIcon value={val} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Why TurnItOut?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted-foreground">
          The only tool that combines everything you need in one place — built for SA students.
        </p>

        {/* Desktop table */}
        <div className="mt-10 hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Feature</th>
                {competitors.map((c, i) => (
                  <th
                    key={c}
                    className={`px-3 py-3 text-center font-semibold ${
                      i === 0 ? "rounded-t-lg bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">{f.name}</td>
                  {competitorKeys.map((key, i) => (
                    <td
                      key={key}
                      className={`px-3 py-3 text-center ${i === 0 ? "bg-primary/5" : ""}`}
                    >
                      <StatusIcon value={f[key] as boolean | "partial"} />
                    </td>
                  ))}
                </tr>
              ))}
              {/* Price row */}
              <tr>
                <td className="py-3 pr-4 font-semibold text-foreground">Price</td>
                {prices.map((p, i) => (
                  <td
                    key={p}
                    className={`px-3 py-3 text-center text-sm font-semibold ${
                      i === 0 ? "rounded-b-lg bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {p}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-10 grid gap-4 md:hidden">
          {competitors.map((c, i) => (
            <ComparisonCard
              key={c}
              competitor={c}
              competitorKey={competitorKeys[i] as keyof Feature}
              price={prices[i]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
