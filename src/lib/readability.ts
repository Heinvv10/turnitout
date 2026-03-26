export interface ReadabilityResult {
  fleschKincaid: number;
  fleschEase: number;
  academicLevel: string;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  longSentences: number;
  passiveVoice: number;
  paragraphCount: number;
  avgParagraphLength: number;
}

/**
 * Count syllables in an English word using vowel-group heuristics.
 */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 2) return 1;

  let count = 0;
  let prevVowel = false;
  const vowels = "aeiouy";

  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevVowel) {
      count++;
    }
    prevVowel = isVowel;
  }

  // Silent-e: if word ends in 'e' and it's not the only vowel group
  if (w.endsWith("e") && count > 1) {
    count--;
  }

  // Words ending in -le after a consonant get a syllable back
  if (w.endsWith("le") && w.length > 2 && !vowels.includes(w[w.length - 3])) {
    count++;
  }

  // Words ending in -es or -ed (silent endings)
  if (
    (w.endsWith("es") || w.endsWith("ed")) &&
    count > 1 &&
    !w.endsWith("les") &&
    !w.endsWith("tes") &&
    !w.endsWith("ces") &&
    !w.endsWith("ges")
  ) {
    // Keep the count as reduced, these are usually silent
  }

  return Math.max(1, count);
}

/**
 * Split text into sentences using punctuation-based heuristics.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.split(/\s+/).length >= 2);
}

/**
 * Split text into paragraphs.
 */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Extract words from text.
 */
function getWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
    .filter((w) => w.length > 0);
}

/**
 * Estimate passive voice percentage by detecting "be-verb + past participle" patterns.
 * Looks for: is/was/were/are/been/being/be + word ending in -ed/-en/-t (common past participles).
 */
function estimatePassiveVoice(text: string): number {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;

  const beVerbs =
    /\b(is|was|were|are|am|been|being|be|has been|have been|had been|will be|would be|could be|should be|might be|may be)\b/i;
  const pastParticiple = /\b\w+(ed|en|elt|ept|ilt|ort|ung|own|awn|orn)\b/i;

  let passiveCount = 0;

  for (const sentence of sentences) {
    const beMatch = sentence.match(beVerbs);
    if (beMatch) {
      // Check if there's a past participle after the be-verb
      const afterBe = sentence.slice(
        (beMatch.index ?? 0) + beMatch[0].length,
      );
      // Allow up to 3 words between be-verb and participle (for adverbs)
      const nearbyWords = afterBe.trim().split(/\s+/).slice(0, 4).join(" ");
      if (pastParticiple.test(nearbyWords)) {
        passiveCount++;
      }
    }
  }

  return Math.round((passiveCount / sentences.length) * 100);
}

/**
 * Map Flesch-Kincaid grade level to an academic level label.
 */
function getAcademicLevel(fk: number): string {
  if (fk < 8) return "Too Simple";
  if (fk < 10) return "High School";
  if (fk < 13) return "First Year";
  if (fk < 16) return "Undergraduate";
  return "Postgraduate/Too Complex";
}

/**
 * Calculate readability metrics for a given text.
 * Entirely client-side -- no API call needed.
 */
export function calculateReadability(text: string): ReadabilityResult {
  const words = getWords(text);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const paragraphCount = Math.max(paragraphs.length, 1);

  // Syllable counting
  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord =
    wordCount > 0 ? totalSyllables / wordCount : 0;

  // Flesch-Kincaid Grade Level
  const fleschKincaid =
    wordCount > 0
      ? 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
      : 0;

  // Flesch Reading Ease
  const fleschEase =
    wordCount > 0
      ? 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
      : 0;

  // Long sentences (> 35 words)
  let longSentences = 0;
  for (const sentence of sentences) {
    if (getWords(sentence).length > 35) {
      longSentences++;
    }
  }

  // Passive voice estimation
  const passiveVoice = estimatePassiveVoice(text);

  // Average paragraph length
  const totalParagraphWords = paragraphs.reduce(
    (sum, p) => sum + getWords(p).length,
    0,
  );
  const avgParagraphLength = totalParagraphWords / paragraphCount;

  return {
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    fleschEase: Math.round(Math.max(0, Math.min(100, fleschEase)) * 10) / 10,
    academicLevel: getAcademicLevel(fleschKincaid),
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    longSentences,
    passiveVoice,
    paragraphCount: paragraphs.length,
    avgParagraphLength: Math.round(avgParagraphLength * 10) / 10,
  };
}
