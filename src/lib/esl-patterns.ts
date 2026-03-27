// WORKING: Pure pattern-matching ESL error detection for SA students

export type ESLCategory =
  | "Articles"
  | "Prepositions"
  | "Tense"
  | "Agreement"
  | "Sentence Structure"
  | "Vocabulary";

export interface ESLPattern {
  name: string;
  category: ESLCategory;
  regex: RegExp;
  explanation: string;
  fix: string;
  tip: string;
}

export interface ESLFinding {
  pattern: ESLPattern;
  matchedText: string;
  index: number;
}

export interface ESLAnalysisResult {
  findings: ESLFinding[];
  categoryCounts: Record<ESLCategory, number>;
  totalCount: number;
  categoryCount: number;
}

const PATTERNS: ESLPattern[] = [
  // --- Articles ---
  {
    name: "Missing article before singular noun",
    category: "Articles",
    regex: /\b(went to|go to|at|in|from)\s+(school|university|hospital|church|office|library)\b/gi,
    explanation:
      "This is a common pattern for speakers of isiZulu or isiXhosa, where articles (the, a, an) do not exist. In English, specific places often need 'the' before them.",
    fix: "Add 'the' before the noun, e.g. 'went to the school'",
    tip: "Ask yourself: am I talking about a specific place? If yes, use 'the'.",
  },
  {
    name: "Missing article before adjective-noun",
    category: "Articles",
    regex: /\b(is|was|seems?|became?)\s+(very\s+)?(important|good|big|small|new|old)\s+(factor|reason|issue|problem|point|aspect)\b/gi,
    explanation:
      "In many SA languages, articles are not used. In English, singular countable nouns need an article ('a' or 'the') before them.",
    fix: "Add 'a' or 'the' before the adjective, e.g. 'is an important factor'",
    tip: "Before a singular noun you can count, try adding 'a/an' or 'the'.",
  },

  // --- Prepositions ---
  {
    name: "Discuss + about (redundant preposition)",
    category: "Prepositions",
    regex: /\bdiscuss(es|ed|ing)?\s+about\b/gi,
    explanation:
      "This is a common transfer from Afrikaans ('bespreek oor') and several Bantu languages. In English, 'discuss' is transitive and takes a direct object without 'about'.",
    fix: "Remove 'about' — write 'discuss the topic' not 'discuss about the topic'",
    tip: "'Discuss' already means 'talk about', so 'about' is built in.",
  },
  {
    name: "Arrive + to (wrong preposition)",
    category: "Prepositions",
    regex: /\barrive[ds]?\s+to\b/gi,
    explanation:
      "This is a common pattern for speakers of isiZulu, Sesotho, and Afrikaans where the equivalent word uses a directional preposition. In English, we 'arrive at' a place or 'arrive in' a city/country.",
    fix: "Use 'arrive at' (specific place) or 'arrive in' (city/country)",
    tip: "Small places = 'at'; large areas = 'in'. Never 'arrive to'.",
  },
  {
    name: "Comprise + of (redundant preposition)",
    category: "Prepositions",
    regex: /\bcomprises?\s+of\b/gi,
    explanation:
      "A frequent academic writing error. 'Comprise' already means 'consist of', so adding 'of' is redundant.",
    fix: "Either 'comprises X' or 'is composed of X' — not 'comprises of X'",
    tip: "The whole 'comprises' the parts. The parts 'compose' the whole.",
  },
  {
    name: "Emphasise/Emphasize + on",
    category: "Prepositions",
    regex: /\bemphasiz?e[ds]?\s+on\b/gi,
    explanation:
      "This transfer comes from Afrikaans ('klem lê op') and several Bantu languages. In English, 'emphasise' takes a direct object.",
    fix: "Remove 'on' — write 'emphasise the point' not 'emphasise on the point'",
    tip: "'Emphasise' works like 'discuss' — no preposition needed.",
  },

  // --- Tense ---
  {
    name: "Tense shift in same sentence",
    category: "Tense",
    regex: /\b(was|were|had|did)\b[^.]{5,40}\b(is|are|has|does|do)\b/gi,
    explanation:
      "Mixing past and present tense within the same sentence can confuse readers. This is common when translating thoughts from languages with different tense systems.",
    fix: "Keep tense consistent within each sentence and paragraph",
    tip: "Read each sentence aloud. If it starts in the past, stay in the past.",
  },
  {
    name: "Missing past tense marker",
    category: "Tense",
    regex: /\b(yesterday|last\s+(?:week|month|year)|in\s+\d{4})\b[^.]{0,30}\b(show|indicate|suggest|reveal|find|conclude)\b(?!s|ed|ing)/gi,
    explanation:
      "When a time marker indicates the past, the verb should be in past tense. Many SA languages mark tense differently, so this transfer is very common.",
    fix: "Add '-ed' or use the correct past form after past-time markers",
    tip: "If 'yesterday' or 'last year' appears, verbs need past tense.",
  },

  // --- Agreement ---
  {
    name: "The results shows (plural noun + singular verb)",
    category: "Agreement",
    regex: /\b(the\s+)?(results|data|findings|studies|participants|researchers|people|children|women|men)\s+(shows?|indicates?|suggests?|reveals?|demonstrates?|was)\b/gi,
    explanation:
      "This is a common concord error for speakers of Bantu languages where noun class prefixes govern agreement differently. In English, plural subjects need plural verbs (without 's').",
    fix: "Use the plural verb form: 'the results show', 'the findings indicate'",
    tip: "Plural nouns (ending in -s) take verbs WITHOUT -s: 'results show'.",
  },
  {
    name: "The people is (collective noun + wrong verb)",
    category: "Agreement",
    regex: /\b(the\s+)?(people|children|police|staff)\s+(is|was|has)\b/gi,
    explanation:
      "This is a common pattern for speakers of isiZulu, isiXhosa, and Setswana where these nouns may be treated as singular. In English, 'people', 'children', and 'police' are always plural.",
    fix: "Use 'are/were/have' with collective plural nouns: 'the people are'",
    tip: "'People' is already plural (one person, many people).",
  },
  {
    name: "This/that + plural noun",
    category: "Agreement",
    regex: /\b(this|that)\s+(reasons?s|factors?s|results|issues|problems|aspects|findings|studies)\b/gi,
    explanation:
      "Demonstratives must agree in number with their noun. 'This' and 'that' are singular; 'these' and 'those' are plural.",
    fix: "Use 'these/those' with plural nouns: 'these results' not 'this results'",
    tip: "If the noun has an -s ending, switch 'this' to 'these'.",
  },

  // --- Sentence Structure ---
  {
    name: "Missing copula (She happy / They ready)",
    category: "Sentence Structure",
    regex: /\b(he|she|it|they|we|I)\s+(happy|sad|ready|able|unable|important|necessary|aware|sure|certain|different|similar)\b/gi,
    explanation:
      "In isiZulu, isiXhosa, and other Bantu languages, the copula ('is/are/am') is often not needed. In English, you must include 'is', 'are', or 'am' between the subject and adjective.",
    fix: "Add the correct form of 'be': 'She is happy', 'They are ready'",
    tip: "Subject + adjective always needs 'is/are/am' in between.",
  },
  {
    name: "Double negation",
    category: "Sentence Structure",
    regex: /\b(don't|doesn't|didn't|won't|can't|cannot|couldn't|shouldn't|wouldn't)\s+\w+\s+(nothing|nobody|nowhere|no\s+one|never|none)\b/gi,
    explanation:
      "Double negatives are grammatically correct in Afrikaans ('ek weet nie ... nie') and many Bantu languages. In standard English, two negatives cancel out.",
    fix: "Use one negative: 'I don't know anything' or 'I know nothing'",
    tip: "Pick one negative word per clause. 'Don't' + 'anything', or just 'nothing'.",
  },
  {
    name: "Run-on sentence (comma splice)",
    category: "Sentence Structure",
    regex: /[a-z]{3,}\s*,\s*(however|therefore|furthermore|moreover|consequently|thus|hence)\s+[a-z]/gi,
    explanation:
      "Joining two complete sentences with just a comma before a conjunctive adverb creates a run-on sentence. This is common in academic ESL writing.",
    fix: "Use a semicolon, full stop, or add a conjunction: '; however,' or '. However,'",
    tip: "Words like 'however' and 'therefore' need a semicolon or full stop before them.",
  },
  {
    name: "Fragment (Because... without main clause)",
    category: "Sentence Structure",
    regex: /\.\s+Because\s+[^.]{10,80}\.\s+[A-Z]/gi,
    explanation:
      "Starting a sentence with 'Because' and ending it without a main clause creates a fragment. This is a common pattern in spoken English that transfers to writing.",
    fix: "Either attach the 'because' clause to the previous sentence or add a main clause",
    tip: "'Because X' needs a result: 'Because X, Y happened.'",
  },

  // --- Vocabulary ---
  {
    name: "Explain + to someone + that (L1 word order)",
    category: "Vocabulary",
    regex: /\bexplain\s+(me|us|them|him|her)\b/gi,
    explanation:
      "This is a transfer from Afrikaans ('verduidelik vir my') and Bantu languages. In English, 'explain' needs 'to' before the person: 'explain to me'.",
    fix: "Add 'to': 'explain to me' not 'explain me'",
    tip: "'Explain' always needs 'to' before the person.",
  },
  {
    name: "By the way/By so (Afrikaans transfer)",
    category: "Vocabulary",
    regex: /\bby\s+so\b/gi,
    explanation:
      "This phrase is a direct translation from Afrikaans ('by so'). It does not exist in English.",
    fix: "Use 'approximately', 'about', or 'around' instead",
    tip: "Avoid direct translations from Afrikaans — rephrase the idea in English.",
  },
  {
    name: "Borrow/Lend confusion",
    category: "Vocabulary",
    regex: /\bborrow\s+(me|him|her|them|us)\s+(?:a|the|some|your|my)\b/gi,
    explanation:
      "In many SA languages, the same word covers both 'borrow' and 'lend'. In English, you 'borrow FROM' someone and 'lend TO' someone.",
    fix: "'Borrow' = you receive; 'Lend' = you give. 'Lend me your pen' or 'I borrowed your pen'",
    tip: "You borrow FROM, you lend TO. The receiver borrows, the giver lends.",
  },
  {
    name: "Learn/Teach confusion",
    category: "Vocabulary",
    regex: /\blearn\s+(me|him|her|them|us)\s+(how\s+)?to\b/gi,
    explanation:
      "In Afrikaans ('leer') and several Bantu languages, one word means both 'learn' and 'teach'. In English, they are different: you 'teach' others and 'learn' yourself.",
    fix: "Use 'teach' when someone is giving knowledge: 'teach me how to'",
    tip: "If YOU gain knowledge = learn. If you GIVE knowledge = teach.",
  },
  {
    name: "Redundant 'that' after 'the reason is'",
    category: "Vocabulary",
    regex: /\bthe\s+reason\s+is\s+because\b/gi,
    explanation:
      "Using 'the reason is because' is redundant — 'reason' and 'because' both express causation. This is common in SA English writing.",
    fix: "Use either 'the reason is that...' or 'this is because...'",
    tip: "Choose one: 'The reason is that X' or 'This is because X'. Not both.",
  },
  {
    name: "Would of / Could of / Should of",
    category: "Vocabulary",
    regex: /\b(would|could|should|must)\s+of\b/gi,
    explanation:
      "This error comes from mishearing the contraction 'would've' (would have) as 'would of'. It is very common in SA spoken English.",
    fix: "Replace 'of' with 'have': 'would have', 'could have', 'should have'",
    tip: "It sounds like 'of' but it is always 'have': would have, could have.",
  },
];

/**
 * Run all ESL pattern checks against the provided text.
 * Returns grouped findings with category counts.
 */
export function analyzeESLPatterns(text: string): ESLAnalysisResult {
  const findings: ESLFinding[] = [];

  for (const pattern of PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.regex.exec(text)) !== null) {
      findings.push({
        pattern,
        matchedText: match[0],
        index: match.index,
      });
    }
  }

  // Sort by position in text
  findings.sort((a, b) => a.index - b.index);

  const categoryCounts: Record<ESLCategory, number> = {
    Articles: 0,
    Prepositions: 0,
    Tense: 0,
    Agreement: 0,
    "Sentence Structure": 0,
    Vocabulary: 0,
  };

  for (const f of findings) {
    categoryCounts[f.pattern.category]++;
  }

  const categoryCount = Object.values(categoryCounts).filter((c) => c > 0).length;

  return { findings, categoryCounts, totalCount: findings.length, categoryCount };
}
