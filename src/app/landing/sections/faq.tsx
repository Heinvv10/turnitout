type FaqItem = {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: "What counts as an AI check?",
    answer:
      "A full \u2018Run All Checks\u2019 = 1 check (grammar, citations, plagiarism, AI risk, grading, tone, advice). A Quick Check = 0.5 checks. Academize and Paraphrase = 0.25 checks each.",
  },
  {
    question: "Can I use it on my phone?",
    answer:
      "Yes! TurnItOut is fully mobile responsive. All features work on any smartphone browser \u2014 no app download needed.",
  },
  {
    question: "Does it work in Afrikaans?",
    answer:
      "Yes. TurnItOut detects Afrikaans text automatically and checks for 18 common grammar patterns, anglicisms, and register issues. It also suggests academic Afrikaans phrases.",
  },
  {
    question: "Will my essay be stored?",
    answer:
      "Your essay is processed in real-time and not permanently stored on our servers. Your work stays yours. The writing provenance log stores only metadata (timestamps and word counts), never your actual text.",
  },
  {
    question: "How is this different from Turnitin?",
    answer:
      "Turnitin is used AFTER submission by your lecturer. TurnItOut is used BEFORE submission by YOU. We help you find and fix problems before they cost you marks. Think of it as a dress rehearsal before the performance.",
  },
  {
    question: "Can my university get a bulk deal?",
    answer:
      "Yes! We offer institutional licensing from R199/student/year. Visit our Institutions page or contact us for a custom quote.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="bg-muted/40 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-border bg-card"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
