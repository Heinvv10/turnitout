/**
 * Self-plagiarism detection via n-gram comparison.
 * Pure function — no side effects, no API calls, fully testable.
 */

export interface PreviousWork {
  title: string;
  text: string;
}

export interface SelfPlagiarismMatch {
  phrase: string;
  currentPosition: number;
  previousTitle: string;
  similarity: number;
}

export interface SelfPlagiarismResult {
  matches: SelfPlagiarismMatch[];
  overallScore: number;
}

/** Normalise text: lowercase, collapse whitespace, strip punctuation */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split normalised text into words */
function tokenise(text: string): string[] {
  return text.split(" ").filter(Boolean);
}

/** Build a set of n-grams (sliding window of `n` words) */
function buildNgrams(words: string[], n: number): Map<string, number[]> {
  const ngrams = new Map<string, number[]>();
  for (let i = 0; i <= words.length - n; i++) {
    const gram = words.slice(i, i + n).join(" ");
    const positions = ngrams.get(gram) ?? [];
    positions.push(i);
    ngrams.set(gram, positions);
  }
  return ngrams;
}

/**
 * Extend a 5-gram match into the longest consecutive overlap.
 * Returns the full matching phrase and its word-length.
 */
function extendMatch(
  currentWords: string[],
  prevWords: string[],
  currentStart: number,
  prevStart: number,
): { phrase: string; length: number } {
  let end = 0;
  while (
    currentStart + end < currentWords.length &&
    prevStart + end < prevWords.length &&
    currentWords[currentStart + end] === prevWords[prevStart + end]
  ) {
    end++;
  }
  return {
    phrase: currentWords.slice(currentStart, currentStart + end).join(" "),
    length: end,
  };
}

const NGRAM_SIZE = 5;
const MIN_CONSECUTIVE_WORDS = 8;

/**
 * Check current text against a list of previous works for self-plagiarism.
 *
 * Algorithm:
 * 1. Build 5-gram index for each previous document.
 * 2. Slide through current text; when a 5-gram matches, extend to find
 *    the longest consecutive overlap.
 * 3. Flag overlaps of 8+ consecutive words.
 * 4. Score = fraction of current words covered by flagged matches.
 */
export function checkSelfPlagiarism(
  currentText: string,
  previousTexts: PreviousWork[],
): SelfPlagiarismResult {
  if (!currentText.trim() || previousTexts.length === 0) {
    return { matches: [], overallScore: 0 };
  }

  const currentNorm = normalise(currentText);
  const currentWords = tokenise(currentNorm);

  if (currentWords.length < NGRAM_SIZE) {
    return { matches: [], overallScore: 0 };
  }

  // Pre-index each previous document
  const prevIndices = previousTexts.map((prev) => {
    const words = tokenise(normalise(prev.text));
    return {
      title: prev.title,
      words,
      ngrams: buildNgrams(words, NGRAM_SIZE),
    };
  });

  const matches: SelfPlagiarismMatch[] = [];
  // Track which current-word positions are already covered
  const covered = new Set<number>();

  const currentNgrams = buildNgrams(currentWords, NGRAM_SIZE);

  for (const [gram, currentPositions] of currentNgrams) {
    for (const prev of prevIndices) {
      const prevPositions = prev.ngrams.get(gram);
      if (!prevPositions) continue;

      for (const cPos of currentPositions) {
        // Skip if this position is already covered
        if (covered.has(cPos)) continue;

        for (const pPos of prevPositions) {
          const { phrase, length } = extendMatch(
            currentWords,
            prev.words,
            cPos,
            pPos,
          );

          if (length >= MIN_CONSECUTIVE_WORDS) {
            // Mark all positions as covered
            for (let i = cPos; i < cPos + length; i++) {
              covered.add(i);
            }

            // Compute similarity as ratio of match length to current text
            const similarity = Math.round((length / currentWords.length) * 100);

            matches.push({
              phrase,
              currentPosition: cPos,
              previousTitle: prev.title,
              similarity,
            });

            // Only record the longest match at this position
            break;
          }
        }
      }
    }
  }

  // Sort by position in current text
  matches.sort((a, b) => a.currentPosition - b.currentPosition);

  // Overall score: percentage of current words that overlap with previous work
  const overallScore =
    currentWords.length > 0
      ? Math.round((covered.size / currentWords.length) * 100)
      : 0;

  return { matches, overallScore };
}
