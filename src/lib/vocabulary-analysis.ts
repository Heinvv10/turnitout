/**
 * Vocabulary Level Indicator — pure analysis function.
 * Analyses lexical diversity and identifies simple words that can be
 * upgraded to more academic alternatives.
 */

export type VocabularyLevel = "basic" | "intermediate" | "advanced";

export interface WordUpgrade {
  word: string;
  count: number;
  suggestions: string[];
}

export interface VocabularyResult {
  level: VocabularyLevel;
  score: number;
  totalWords: number;
  uniqueWords: number;
  lexicalDiversity: number;
  upgrades: WordUpgrade[];
}

/** Map of common simple words to academic alternatives */
const ACADEMIC_UPGRADES: Record<string, string[]> = {
  good: ["beneficial", "advantageous", "constructive"],
  bad: ["detrimental", "adverse", "unfavorable"],
  big: ["significant", "substantial", "considerable"],
  small: ["minimal", "negligible", "marginal"],
  show: ["demonstrate", "illustrate", "indicate"],
  think: ["consider", "argue", "contend", "posit"],
  use: ["utilize", "employ", "implement"],
  get: ["obtain", "acquire", "achieve"],
  make: ["construct", "establish", "develop"],
  help: ["facilitate", "assist", "contribute to"],
  say: ["assert", "contend", "maintain", "suggest"],
  give: ["provide", "offer", "present"],
  important: ["significant", "crucial", "essential", "pivotal"],
  different: ["diverse", "distinct", "varied", "disparate"],
  many: ["numerous", "several", "various", "multiple"],
  lot: ["abundance", "multitude", "considerable amount"],
  thing: ["aspect", "element", "factor", "component"],
  very: ["considerably", "remarkably", "exceedingly"],
  really: ["genuinely", "substantially", "fundamentally"],
  also: ["furthermore", "additionally", "moreover"],
  but: ["however", "nevertheless", "conversely"],
  so: ["consequently", "therefore", "accordingly"],
  because: ["owing to", "due to", "as a result of"],
  like: ["such as", "comparable to", "analogous to"],
  look: ["examine", "investigate", "observe"],
  seem: ["appear", "indicate", "suggest"],
  keep: ["maintain", "preserve", "sustain"],
  start: ["initiate", "commence", "undertake"],
  end: ["conclude", "terminate", "finalize"],
  need: ["require", "necessitate", "demand"],
  want: ["desire", "aspire", "seek"],
  change: ["transform", "modify", "alter"],
  try: ["attempt", "endeavor", "strive"],
  tell: ["inform", "convey", "communicate"],
  find: ["identify", "discover", "ascertain"],
  ask: ["inquire", "request", "query"],
  go: ["proceed", "advance", "progress"],
  come: ["arise", "emerge", "originate"],
  put: ["place", "position", "allocate"],
  enough: ["sufficient", "adequate", "ample"],
};

/**
 * Words commonly found in academic writing. Used to boost the score
 * when the text already contains sophisticated vocabulary.
 */
const ACADEMIC_VOCABULARY = new Set([
  "analyze", "analyse", "hypothesis", "methodology", "framework",
  "paradigm", "theoretical", "empirical", "qualitative", "quantitative",
  "correlation", "significant", "implications", "perspective", "discourse",
  "construct", "phenomenon", "subsequently", "furthermore", "consequently",
  "nevertheless", "moreover", "conceptual", "systematic", "fundamental",
  "comprehensive", "substantial", "demonstrate", "illustrate", "facilitate",
  "contribute", "prevalent", "inherent", "contemporary", "predominant",
  "acquisition", "assessment", "cognitive", "perception", "disposition",
  "contextual", "longitudinal", "pedagogical", "epistemological",
  "socioeconomic", "interdisciplinary", "multifaceted", "juxtapose",
]);

/**
 * Tokenise text into lowercase words (letters only).
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Analyse the vocabulary level of the given text.
 */
export function analyzeVocabulary(text: string): VocabularyResult {
  const words = tokenize(text);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      level: "basic",
      score: 0,
      totalWords: 0,
      uniqueWords: 0,
      lexicalDiversity: 0,
      upgrades: [],
    };
  }

  const uniqueSet = new Set(words);
  const uniqueWords = uniqueSet.size;
  const lexicalDiversity = parseFloat((uniqueWords / totalWords).toFixed(3));

  // Count occurrences of upgradeable simple words
  const wordCounts = new Map<string, number>();
  for (const w of words) {
    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
  }

  const upgrades: WordUpgrade[] = [];
  for (const [simple, suggestions] of Object.entries(ACADEMIC_UPGRADES)) {
    const count = wordCounts.get(simple) || 0;
    if (count > 0) {
      upgrades.push({ word: simple, count, suggestions: suggestions.slice(0, 3) });
    }
  }
  // Sort by count descending so the most overused words appear first
  upgrades.sort((a, b) => b.count - a.count);

  // Count how many words are recognised academic vocabulary
  let academicWordCount = 0;
  for (const w of words) {
    if (ACADEMIC_VOCABULARY.has(w)) {
      academicWordCount++;
    }
  }
  const academicRatio = academicWordCount / totalWords;

  // Count how many words are simple/upgradeable
  let simpleWordCount = 0;
  for (const u of upgrades) {
    simpleWordCount += u.count;
  }
  const simpleRatio = simpleWordCount / totalWords;

  // Score calculation:
  // - Lexical diversity contributes up to 40 points (diversity * 80, capped at 40)
  // - Academic vocabulary ratio contributes up to 40 points (ratio * 400, capped at 40)
  // - Penalty for simple word overuse: up to -20 points
  const diversityScore = Math.min(40, lexicalDiversity * 80);
  const academicScore = Math.min(40, academicRatio * 400);
  const simplePenalty = Math.min(20, simpleRatio * 100);

  const rawScore = diversityScore + academicScore - simplePenalty;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let level: VocabularyLevel;
  if (score < 40) {
    level = "basic";
  } else if (score <= 70) {
    level = "intermediate";
  } else {
    level = "advanced";
  }

  return {
    level,
    score,
    totalWords,
    uniqueWords,
    lexicalDiversity,
    upgrades,
  };
}
