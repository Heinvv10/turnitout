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
  {
    question: "Isn\u2019t this just helping students cheat?",
    answer:
      "No \u2014 the opposite. TurnItOut is like a spell-checker for academic integrity. We don\u2019t write your essay, generate content, or help you pass off someone else\u2019s work as your own. We help you check your OWN writing for problems \u2014 grammar mistakes, missing citations, accidental similarity \u2014 so you can fix them BEFORE you submit. Your lecturer would rather you submit a well-cited, properly formatted essay than deal with a plagiarism hearing. We\u2019re on the same side.",
  },
  {
    question: "Will I get in trouble for using TurnItOut?",
    answer:
      "No. Using a pre-submission checker is no different from asking a friend to proofread your essay, or using a spell-checker in Word. TurnItOut doesn\u2019t write or change your work \u2014 it highlights issues for YOU to fix. Many universities actively encourage students to check their work before submitting. Turnitin themselves offer a similar tool (Draft Coach) for this exact purpose.",
  },
  {
    question: "Does TurnItOut write essays or generate content for me?",
    answer:
      "Absolutely not. TurnItOut is a checking tool, not a writing tool. It analyses text YOU have written and gives you feedback \u2014 like a knowledgeable study buddy looking over your shoulder. The Academizer and Paraphraser suggest alternatives for specific sentences, but you decide whether to use them. The thinking, arguing, and writing is always yours.",
  },
  {
    question: "My essay is very personal. Is my data safe?",
    answer:
      "Yes. Your essay is sent to our AI for analysis and then discarded \u2014 it is not stored in any database, not used to train AI models, and not shared with anyone. Your writing provenance log only stores timestamps and word counts, never actual text. We don\u2019t sell data. We don\u2019t show ads. Your work is yours.",
  },
  {
    question: "I\u2019m struggling with academic writing. Can TurnItOut actually help me improve?",
    answer:
      "That\u2019s exactly what we\u2019re built for. TurnItOut doesn\u2019t just flag problems \u2014 it explains WHY something is wrong and HOW to fix it. The ESL tips explain common patterns for speakers of isiZulu, isiXhosa, and Afrikaans. The Vocabulary Coach suggests academic alternatives for simple words. The Academic Phrasebank gives you ready-to-use phrases for each section of your essay. Over time, you\u2019ll internalise these patterns and your writing will improve naturally.",
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
