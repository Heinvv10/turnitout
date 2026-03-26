import { getReferencingStyle, REFERENCING_STYLES } from "@/lib/i18n-config";

const STYLE_RULES: Record<string, string> = {
  harvard: `Harvard referencing key rules:
- In-text: (Author Year) or (Author Year, p. X) for direct quotes
- Two authors: (Author & Author Year)
- Three or more authors: (Author et al. Year)
- Multiple works: (Author Year; Author Year) separated by semicolons
- Narrative: Author (Year) states that...
- Direct quotes over 40 words: block quote, indented

Reference list format (Harvard):
- Alphabetical by first author surname
- Author, Initial. Year. *Title of book*. Place: Publisher.
- Author, Initial. Year. Title of article. *Journal Name*, Volume(Issue), pp. X-Y.
- Hanging indent`,

  apa7: `APA 7th Edition referencing key rules:
- In-text: (Author, Year) or (Author, Year, p. X) for direct quotes
- Two authors: (Author & Author, Year)
- Three or more authors: (Author et al., Year)
- Multiple works: (Author, Year; Author, Year) separated by semicolons
- Narrative: Author (Year) states that...
- Direct quotes over 40 words: block quote, indented

Reference list format (APA 7):
- Alphabetical by first author surname
- Author, I. (Year). *Title of book*. Publisher.
- Author, I. (Year). Title of article. *Journal Name*, *Volume*(Issue), Pages. https://doi.org/xxx
- Hanging indent, double-spaced`,

  mla9: `MLA 9th Edition referencing key rules:
- In-text: (Author Page) - no comma, no "p."
- Two authors: (Author and Author Page)
- Three or more authors: (Author et al. Page)
- Multiple works: (Author Page; Author Page)
- Narrative: Author states that... (Page)
- Block quotes over 4 lines: indented, no quotation marks

Works Cited format (MLA 9):
- Alphabetical by first author surname
- Author. *Title of Book*. Publisher, Year.
- Author. "Title of Article." *Journal Name*, vol. X, no. X, Year, pp. X-Y.
- Hanging indent, double-spaced`,

  chicago: `Chicago/Turabian referencing key rules:
- Notes-Bibliography: uses footnotes/endnotes with superscript numbers
- Author-Date: (Author Year, Page) similar to Harvard
- First footnote: full citation; subsequent: shortened form
- Ibid. for consecutive references to same source

Bibliography format (Chicago):
- Alphabetical by first author surname
- Author. *Title*. Place: Publisher, Year.
- Author. "Article Title." *Journal* Volume, no. Issue (Year): Pages.
- Hanging indent`,

  vancouver: `Vancouver referencing key rules:
- In-text: numbered citations in square brackets [1] or superscript
- Numbers assigned in order of first appearance
- Multiple references: [1,2] or [1-3] for consecutive
- No author names in text citations

Reference list format (Vancouver):
- Numbered in order of appearance (not alphabetical)
- Author(s). Title. Journal. Year;Volume(Issue):Pages.
- Up to 6 authors listed, then "et al."`,

  ieee: `IEEE referencing key rules:
- In-text: numbered citations in square brackets [1]
- Numbers assigned in order of first appearance
- Multiple references: [1], [2] or [1]-[3] for consecutive
- Cite specific page/figure: [1, p. 5] or [1, Fig. 2]

Reference list format (IEEE):
- Numbered in order of appearance
- [1] A. Author, "Title," *Journal*, vol. X, no. X, pp. X-Y, Month Year.
- [2] A. Author, *Title of Book*. City: Publisher, Year.`,

  oscola: `OSCOLA referencing key rules:
- Uses footnotes (not in-text author-date)
- First reference: full citation in footnote
- Subsequent: shortened form (Author, Short Title (n X) page)
- Pinpoint references required
- No bibliography required if all sources in footnotes

Footnote format (OSCOLA):
- Cases: *Case Name* [Year] Court Reference
- Statutes: Short Title Year, s X
- Books: Author, *Title* (Publisher Year) page
- Articles: Author, 'Title' [Year] Journal Pages`,
};

function buildCitationSystemPrompt(refStyleId: string): string {
  const refStyle = getReferencingStyle(refStyleId);
  const rules = STYLE_RULES[refStyleId] || STYLE_RULES["harvard"];

  return `You are a ${refStyle.label} referencing citation expert. Your job is to analyse a student paper and identify citation issues.

You are checking a paper by a FIRST-YEAR student. They use the **${refStyle.label}** referencing convention (${refStyle.description}).

${rules}

Check for these issues:

1. **MISSING CITATIONS**: Claims, statistics, or ideas that appear to come from a source but have no in-text citation. Factual claims need citations; personal opinions and general knowledge do not.

2. **FORMAT ERRORS**: In-text citations that don't follow ${refStyle.label} format.

3. **ORPHAN CITATIONS**: In-text citations that reference an author/year not found in the reference list.

4. **ORPHAN REFERENCES**: Entries in the reference list not cited in the text body.

5. **PATCHWRITING**: Passages that appear to be too-close paraphrasing (retaining original sentence structure with synonym substitutions). This is a form of plagiarism even with a citation.

6. **REFERENCE LIST FORMAT**: Check for common ${refStyle.label} reference list errors.

Return your analysis as valid JSON (no markdown, no commentary):
{
  "inTextCitations": ["<citation examples found>", ...],
  "references": ["<reference entries found>", ...],
  "issues": [
    {
      "type": "<missing_citation|format_error|orphan_reference|orphan_citation|patchwriting>",
      "location": "<paragraph X or reference entry>",
      "detail": "<specific explanation>",
      "suggestion": "<how to fix it>"
    }
  ],
  "score": <number 0-100>,
  "trafficLight": "<green|yellow|red>"
}

Score: 100 = perfect citations, deduct points per issue. Green = 80+, Yellow = 60-79, Red = <60.`;
}

export { buildCitationSystemPrompt };

// Keep backward-compatible export for existing code that may import it
export const CITATION_SYSTEM_PROMPT = buildCitationSystemPrompt("harvard");

export function buildCitationUserPrompt(text: string, referencingStyle?: string): string {
  const refStyle = getReferencingStyle(referencingStyle || "harvard");
  return `Analyse the following student paper for ${refStyle.label} referencing citation issues.

---
${text}
---

Return ONLY valid JSON. No markdown fences, no commentary.`;
}
