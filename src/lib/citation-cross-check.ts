/**
 * Citation Cross-Checker
 *
 * Pure function that compares in-text citations against a reference list
 * to find orphans (cited but not referenced), ghosts (referenced but not
 * cited), and duplicates (same author+year cited multiple times).
 */

export interface CrossCheckResult {
  orphans: OrphanCitation[];
  ghosts: GhostReference[];
  duplicates: DuplicateCitation[];
  totalInText: number;
  totalReferences: number;
}

export interface OrphanCitation {
  /** The raw citation text found in the body, e.g. "(Wright, 2013)" */
  citation: string;
  /** Normalised key used for matching, e.g. "wright-2013" */
  key: string;
}

export interface GhostReference {
  /** The full reference line from the reference list */
  reference: string;
  /** First author surname extracted from the reference */
  surname: string;
}

export interface DuplicateCitation {
  citation: string;
  key: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ParsedCitation {
  raw: string;
  surname: string;
  year: string;
  key: string;
}

/**
 * Normalise a surname for comparison: lowercase, trim, strip accents.
 */
function normaliseSurname(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function makeKey(surname: string, year: string): string {
  return `${normaliseSurname(surname)}-${year.trim()}`;
}

/**
 * Extract all in-text citations from the body text.
 *
 * Supported patterns:
 *   (Author, Year)           -> (Wright, 2013)
 *   (Author & Author, Year)  -> (Smith & Jones, 2020)
 *   (Author et al., Year)    -> (Brown et al., 2019)
 *   Author (Year)            -> Wright (2013)
 */
function extractInTextCitations(text: string): ParsedCitation[] {
  const citations: ParsedCitation[] = [];

  // Pattern 1: (Author, Year), (Author & Author, Year), (Author et al., Year)
  // Also handles multiple citations inside one pair of parentheses separated by ;
  const parenPattern =
    /\(([A-Z][a-zA-Z'-]+(?:\s(?:&|and)\s[A-Z][a-zA-Z'-]+)?(?:\set\sal\.)?,\s*\d{4}(?:;\s*[A-Z][a-zA-Z'-]+(?:\s(?:&|and)\s[A-Z][a-zA-Z'-]+)?(?:\set\sal\.)?,\s*\d{4})*)\)/g;

  let match: RegExpExecArray | null;

  while ((match = parenPattern.exec(text)) !== null) {
    const inner = match[1];
    // Split on semicolons for multiple citations within one set of parens
    const parts = inner.split(";").map((p) => p.trim());

    for (const part of parts) {
      const citMatch = part.match(
        /^([A-Z][a-zA-Z'-]+)(?:\s(?:&|and)\s[A-Z][a-zA-Z'-]+)?(?:\set\sal\.)?,\s*(\d{4})$/,
      );
      if (citMatch) {
        const surname = citMatch[1];
        const year = citMatch[2];
        citations.push({
          raw: `(${part})`,
          surname,
          year,
          key: makeKey(surname, year),
        });
      }
    }
  }

  // Pattern 2: Author (Year) — narrative citations
  const narrativePattern =
    /([A-Z][a-zA-Z'-]+(?:\s(?:&|and)\s[A-Z][a-zA-Z'-]+)?(?:\set\sal\.)?)\s\((\d{4})\)/g;

  while ((match = narrativePattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const authorPart = match[1];
    // Extract first surname
    const surnameMatch = authorPart.match(/^([A-Z][a-zA-Z'-]+)/);
    if (!surnameMatch) continue;
    const surname = surnameMatch[1];
    const year = match[2];

    // Avoid duplicating citations already captured by the parenthetical pattern
    // (narrative citations won't start with a paren, so there shouldn't be overlap)
    citations.push({
      raw: fullMatch,
      surname,
      year,
      key: makeKey(surname, year),
    });
  }

  return citations;
}

/**
 * Parse reference list lines and extract the leading surname from each.
 *
 * Assumes each reference starts with a surname (possibly followed by initials,
 * comma, or period). Blank lines are skipped.
 */
function extractReferenceSurnames(
  referenceText: string,
): { surname: string; line: string }[] {
  if (!referenceText.trim()) return [];

  const lines = referenceText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 10);

  const results: { surname: string; line: string }[] = [];

  for (const line of lines) {
    // Skip lines that are obviously headings
    if (/^(references?|bibliography|works cited)\s*$/i.test(line)) continue;

    // Extract leading surname: everything before the first comma, period,
    // or whitespace that is followed by an initial pattern.
    const surnameMatch = line.match(/^([A-Za-z'-]+)/);
    if (surnameMatch) {
      results.push({ surname: surnameMatch[1], line });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Cross-check in-text citations against the reference list.
 *
 * @param bodyText    The essay body (plain text, excluding reference list)
 * @param references  The reference list as plain text (one reference per line)
 * @returns           Structured cross-check result
 */
export function crossCheckCitations(
  bodyText: string,
  references: string,
): CrossCheckResult {
  if (!bodyText && !references) {
    return {
      orphans: [],
      ghosts: [],
      duplicates: [],
      totalInText: 0,
      totalReferences: 0,
    };
  }

  const inTextCitations = extractInTextCitations(bodyText || "");
  const refEntries = extractReferenceSurnames(references || "");

  // Build a set of normalised reference surnames for lookup
  const refSurnameSet = new Set(
    refEntries.map((r) => normaliseSurname(r.surname)),
  );

  // Count occurrences of each citation key
  const citationCounts = new Map<string, { citation: ParsedCitation; count: number }>();
  for (const cit of inTextCitations) {
    const existing = citationCounts.get(cit.key);
    if (existing) {
      existing.count += 1;
    } else {
      citationCounts.set(cit.key, { citation: cit, count: 1 });
    }
  }

  // Build a set of normalised cited surnames for ghost detection
  const citedSurnameSet = new Set(
    inTextCitations.map((c) => normaliseSurname(c.surname)),
  );

  // Orphans: cited in text but surname not found in any reference
  const orphans: OrphanCitation[] = [];
  const seenOrphanKeys = new Set<string>();

  for (const [key, { citation }] of citationCounts) {
    if (!refSurnameSet.has(normaliseSurname(citation.surname))) {
      if (!seenOrphanKeys.has(key)) {
        seenOrphanKeys.add(key);
        orphans.push({ citation: citation.raw, key });
      }
    }
  }

  // Ghosts: in reference list but never cited in text
  const ghosts: GhostReference[] = [];
  const seenGhostSurnames = new Set<string>();

  for (const ref of refEntries) {
    const norm = normaliseSurname(ref.surname);
    if (!citedSurnameSet.has(norm) && !seenGhostSurnames.has(norm)) {
      seenGhostSurnames.add(norm);
      ghosts.push({ reference: ref.line, surname: ref.surname });
    }
  }

  // Duplicates: cited more than once (informational)
  const duplicates: DuplicateCitation[] = [];
  for (const [key, { citation, count }] of citationCounts) {
    if (count > 1) {
      duplicates.push({ citation: citation.raw, key, count });
    }
  }

  return {
    orphans,
    ghosts,
    duplicates,
    totalInText: citationCounts.size,
    totalReferences: refEntries.length,
  };
}
