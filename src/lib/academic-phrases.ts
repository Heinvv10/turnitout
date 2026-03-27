export interface AcademicPhrase {
  text: string;
  tip: string;
}

export interface PhraseSection {
  key: string;
  label: string;
  phrases: AcademicPhrase[];
}

export const PHRASE_SECTIONS: PhraseSection[] = [
  {
    key: "introduction",
    label: "Introduction",
    phrases: [
      { text: "This essay aims to...", tip: "Use at the start to state your essay's purpose clearly." },
      { text: "The purpose of this paper is to...", tip: "A formal way to introduce your research question or goal." },
      { text: "This study examines...", tip: "Good for essays that analyse a specific topic or phenomenon." },
      { text: "The central argument of this essay is that...", tip: "Use when you want to state your thesis directly." },
      { text: "In order to explore this topic, it is necessary to...", tip: "Introduces the approach or scope of your essay." },
      { text: "This paper considers the extent to which...", tip: "Useful for evaluative essays that weigh evidence." },
      { text: "A growing body of literature suggests that...", tip: "Opens with a research-backed claim to set context." },
      { text: "Understanding [topic] is important because...", tip: "Establishes relevance and significance of your topic." },
      { text: "The question of [topic] has received considerable attention in recent years.", tip: "Shows the topic is current and actively debated." },
      { text: "This essay begins by examining... before turning to...", tip: "Provides a roadmap of your essay structure." },
      { text: "It is widely acknowledged that...", tip: "Introduces a commonly accepted point as background." },
      { text: "One of the key issues in [field] is...", tip: "Narrows the focus to a specific debate or problem." },
      { text: "The aim of this discussion is to critically evaluate...", tip: "Signals a critical, analytical approach." },
      { text: "To address this question, this essay draws on...", tip: "Names the theories or sources you will use." },
      { text: "This topic is particularly relevant to psychology because...", tip: "Connects the topic to your discipline explicitly." },
    ],
  },
  {
    key: "literature-review",
    label: "Literature Review",
    phrases: [
      { text: "According to [Author] (Year)...", tip: "The standard way to cite a source with attribution." },
      { text: "Previous research suggests that...", tip: "Summarises existing findings without naming one author." },
      { text: "Several studies have found that...", tip: "Use when multiple sources support the same point." },
      { text: "[Author] (Year) argues that...", tip: "Presents a specific author's position or claim." },
      { text: "Research conducted by [Author] (Year) demonstrated that...", tip: "Highlights a particular study's findings." },
      { text: "There is growing evidence to suggest that...", tip: "Signals an emerging consensus in the literature." },
      { text: "A number of researchers have proposed that...", tip: "Use when several scholars share a similar view." },
      { text: "While [Author] (Year) contends that..., [Author] (Year) argues...", tip: "Contrasts two different scholarly perspectives." },
      { text: "The literature on [topic] is divided on the question of...", tip: "Introduces a debate or disagreement in the field." },
      { text: "Early research in this area focused on...", tip: "Provides historical context for a line of enquiry." },
      { text: "More recent studies have shifted attention to...", tip: "Shows how the field has developed over time." },
      { text: "As [Author] (Year) points out...", tip: "Draws attention to a notable observation by a scholar." },
      { text: "[Author]'s (Year) theory of [X] provides a useful framework for...", tip: "Introduces a theoretical lens you will apply." },
      { text: "This view is supported by findings from...", tip: "Use to add corroborating evidence to a claim." },
      { text: "However, this perspective has been challenged by...", tip: "Introduces a counter-argument from the literature." },
      { text: "A key contribution to this debate was made by...", tip: "Highlights a seminal or influential source." },
    ],
  },
  {
    key: "discussion",
    label: "Discussion",
    phrases: [
      { text: "These findings suggest that...", tip: "Links your evidence back to the argument." },
      { text: "This is consistent with the view that...", tip: "Shows agreement between your findings and existing theory." },
      { text: "A possible explanation for this is...", tip: "Offers an interpretation of the evidence." },
      { text: "This supports the argument that...", tip: "Reinforces your thesis with evidence." },
      { text: "One implication of this is that...", tip: "Draws out the significance of a finding." },
      { text: "It is important to note that...", tip: "Highlights a key point or caveat." },
      { text: "This finding is significant because...", tip: "Explains why a piece of evidence matters." },
      { text: "However, it should be noted that...", tip: "Introduces a qualification or limitation." },
      { text: "This raises important questions about...", tip: "Opens up further lines of enquiry." },
      { text: "When considered together, these findings indicate...", tip: "Synthesises multiple pieces of evidence." },
      { text: "An alternative interpretation might be that...", tip: "Presents a different way of reading the evidence." },
      { text: "This aligns with [Author]'s (Year) argument that...", tip: "Connects your discussion to a specific theorist." },
      { text: "The significance of this cannot be understated...", tip: "Emphasises the importance of a finding." },
      { text: "There are several possible reasons for this...", tip: "Introduces multiple explanations for a phenomenon." },
      { text: "This has practical implications for...", tip: "Connects theory to real-world application." },
    ],
  },
  {
    key: "conclusion",
    label: "Conclusion",
    phrases: [
      { text: "In conclusion...", tip: "The simplest way to signal you are wrapping up." },
      { text: "This essay has demonstrated that...", tip: "Summarises your main argument and findings." },
      { text: "The evidence presented suggests that...", tip: "Restates the overall direction of your evidence." },
      { text: "On balance, it can be argued that...", tip: "Use when weighing up competing perspectives." },
      { text: "To summarise the key points...", tip: "Introduces a brief recap of your main arguments." },
      { text: "In light of the evidence discussed...", tip: "Connects your conclusion to the body of the essay." },
      { text: "While there are limitations to this analysis...", tip: "Acknowledges weaknesses honestly." },
      { text: "Further research is needed to...", tip: "Suggests directions for future study." },
      { text: "This discussion has highlighted the importance of...", tip: "Emphasises the significance of your topic." },
      { text: "Taken together, these arguments support the view that...", tip: "Synthesises your overall position." },
      { text: "It is clear from this analysis that...", tip: "States a confident conclusion based on evidence." },
      { text: "The findings of this essay have implications for...", tip: "Points to broader relevance." },
      { text: "Ultimately, this essay argues that...", tip: "A strong final restatement of your thesis." },
      { text: "These considerations lead to the conclusion that...", tip: "Logically connects analysis to your final point." },
      { text: "This essay has shown that the relationship between [X] and [Y] is...", tip: "Wraps up a comparative or relational argument." },
    ],
  },
  {
    key: "transitions",
    label: "Transitions",
    phrases: [
      { text: "Furthermore...", tip: "Adds a point that strengthens the same argument." },
      { text: "However...", tip: "Introduces a contrasting point or counter-argument." },
      { text: "In contrast...", tip: "Highlights a clear difference between two things." },
      { text: "Moreover...", tip: "Adds emphasis to an additional supporting point." },
      { text: "On the other hand...", tip: "Presents the opposing side of a debate." },
      { text: "Similarly...", tip: "Shows a parallel between two ideas or findings." },
      { text: "Nevertheless...", tip: "Concedes a point while maintaining your argument." },
      { text: "Consequently...", tip: "Shows a cause-and-effect relationship." },
      { text: "In addition to this...", tip: "Introduces supplementary information." },
      { text: "By contrast...", tip: "Emphasises a difference more strongly than 'however'." },
      { text: "As a result...", tip: "Shows the outcome or consequence of something." },
      { text: "With this in mind...", tip: "Connects a preceding point to what follows." },
      { text: "Having established that..., it is now possible to...", tip: "Transitions from one section of argument to the next." },
      { text: "Turning now to...", tip: "Signals a shift in topic or focus." },
      { text: "It is also worth noting that...", tip: "Adds a secondary but relevant point." },
      { text: "This notwithstanding...", tip: "Acknowledges a point but continues your argument." },
    ],
  },
  {
    key: "argumentation",
    label: "Argumentation",
    phrases: [
      { text: "It could be argued that...", tip: "Introduces a claim without committing to it fully." },
      { text: "This raises the question of...", tip: "Introduces a point that needs further exploration." },
      { text: "One limitation of this view is...", tip: "Critically evaluates a perspective." },
      { text: "A strength of this approach is...", tip: "Highlights a positive aspect of a theory or method." },
      { text: "This perspective fails to account for...", tip: "Points out a gap in someone's argument." },
      { text: "While this argument has merit, it overlooks...", tip: "Balanced critique that concedes before criticising." },
      { text: "There is compelling evidence to suggest that...", tip: "Introduces strong support for a claim." },
      { text: "Critics of this view have pointed out that...", tip: "Brings in opposing scholarly voices." },
      { text: "This interpretation is problematic because...", tip: "Directly challenges a reading or conclusion." },
      { text: "A more nuanced understanding would consider...", tip: "Suggests deeper analysis is needed." },
      { text: "It is difficult to reconcile [X] with [Y]...", tip: "Highlights a tension or contradiction." },
      { text: "The weight of evidence supports the claim that...", tip: "Use when the balance of sources favours one side." },
      { text: "This can be explained by reference to...", tip: "Links an observation to a theory or framework." },
      { text: "One must be cautious in concluding that...", tip: "Advises against over-generalising." },
      { text: "This suggests a need to reconsider...", tip: "Calls for re-evaluation of an assumption." },
      { text: "The extent to which [X] is true depends on...", tip: "Introduces conditional or contextual reasoning." },
    ],
  },
];

/** Flat list of all phrases with their section key attached */
export function getAllPhrases(): (AcademicPhrase & { sectionKey: string })[] {
  return PHRASE_SECTIONS.flatMap((section) =>
    section.phrases.map((phrase) => ({ ...phrase, sectionKey: section.key })),
  );
}
