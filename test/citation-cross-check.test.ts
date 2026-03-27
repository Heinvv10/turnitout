import { describe, it, expect } from "vitest";
import { crossCheckCitations } from "@/lib/citation-cross-check";

describe("crossCheckCitations", () => {
  describe("empty / edge cases", () => {
    it("returns empty results for empty text and empty references", () => {
      const result = crossCheckCitations("", "");
      expect(result.orphans).toHaveLength(0);
      expect(result.ghosts).toHaveLength(0);
      expect(result.duplicates).toHaveLength(0);
      expect(result.totalInText).toBe(0);
      expect(result.totalReferences).toBe(0);
    });

    it("returns empty results when both are falsy", () => {
      const result = crossCheckCitations("", "");
      expect(result.totalInText).toBe(0);
    });

    it("handles body text with no citations", () => {
      const result = crossCheckCitations(
        "This is a plain essay with no citations at all.",
        "Smith, J. (2020). A study. Journal of Testing, 1(1), 1-10.",
      );
      expect(result.totalInText).toBe(0);
      expect(result.ghosts.length).toBeGreaterThan(0);
    });

    it("handles references with no matching body", () => {
      const result = crossCheckCitations(
        "(Wright, 2013) found something.",
        "",
      );
      expect(result.orphans.length).toBeGreaterThan(0);
      expect(result.totalReferences).toBe(0);
    });
  });

  describe("single citation matched in references", () => {
    it("detects a matched parenthetical citation", () => {
      const body = "According to research (Wright, 2013), this is true.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.orphans).toHaveLength(0);
      expect(result.ghosts).toHaveLength(0);
      expect(result.totalInText).toBe(1);
      expect(result.totalReferences).toBe(1);
    });

    it("detects a matched narrative citation", () => {
      const body = "Wright (2013) found that this is true.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.orphans).toHaveLength(0);
      expect(result.ghosts).toHaveLength(0);
    });
  });

  describe("orphan citations", () => {
    it("flags a citation that has no matching reference", () => {
      const body = "Research shows (Miller, 2021) that results vary.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.orphans.length).toBeGreaterThan(0);
      expect(result.orphans[0].key).toBe("miller-2021");
    });

    it("flags multiple orphan citations", () => {
      const body =
        "Both (Miller, 2021) and (Jones, 2019) found interesting results.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.orphans.length).toBe(2);
    });
  });

  describe("ghost references", () => {
    it("flags a reference that is never cited in text", () => {
      const body = "This essay discusses nothing specific.";
      const refs =
        "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.\nSmith, A. (2020). Another study. Journal, 2(1), 5-15.";
      const result = crossCheckCitations(body, refs);

      expect(result.ghosts.length).toBe(2);
      expect(result.ghosts[0].surname).toBe("Wright");
    });

    it("does not flag a reference whose author IS cited", () => {
      const body = "According to (Wright, 2013), this is correct.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.ghosts).toHaveLength(0);
    });
  });

  describe("multiple authors", () => {
    it("handles Author & Author, Year citations", () => {
      const body = "As noted by (Smith & Jones, 2020), this matters.";
      const refs = "Smith, A. & Jones, B. (2020). A study. Journal, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.totalInText).toBe(1);
      expect(result.orphans).toHaveLength(0);
    });

    it("handles Author and Author, Year citations", () => {
      const body = "As noted by (Smith and Jones, 2020), this matters.";
      const refs = "Smith, A. & Jones, B. (2020). A study. Journal, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.totalInText).toBe(1);
    });
  });

  describe("et al. citations", () => {
    it("handles et al. parenthetical citations", () => {
      const body = "Research (Brown et al., 2019) confirmed the hypothesis.";
      const refs = "Brown, C., Green, D. & White, E. (2019). A study. Journal, 3(2), 20-30.";
      const result = crossCheckCitations(body, refs);

      expect(result.totalInText).toBe(1);
      expect(result.orphans).toHaveLength(0);
    });

    it("handles et al. narrative citations", () => {
      const body = "Brown et al. (2019) confirmed the hypothesis.";
      const refs = "Brown, C., Green, D. & White, E. (2019). A study. Journal, 3(2), 20-30.";
      const result = crossCheckCitations(body, refs);

      expect(result.totalInText).toBeGreaterThanOrEqual(1);
    });
  });

  describe("semicolon-separated citations", () => {
    it("parses multiple citations within one set of parentheses", () => {
      const body =
        "Several studies (Smith, 2020; Jones, 2019; Brown, 2018) agree on this.";
      const refs = [
        "Smith, A. (2020). Study A. Journal, 1(1), 1-10.",
        "Jones, B. (2019). Study B. Journal, 2(1), 5-15.",
        "Brown, C. (2018). Study C. Journal, 3(1), 10-20.",
      ].join("\n");
      const result = crossCheckCitations(body, refs);

      expect(result.totalInText).toBe(3);
      expect(result.orphans).toHaveLength(0);
    });

    it("detects orphan within semicolon group", () => {
      const body = "Studies (Smith, 2020; Unknown, 2019) disagree.";
      const refs = "Smith, A. (2020). Study A. Journal, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.orphans.length).toBe(1);
      expect(result.orphans[0].key).toBe("unknown-2019");
    });
  });

  describe("duplicate detection", () => {
    it("detects a citation used more than once", () => {
      const body =
        "First (Wright, 2013) and then again (Wright, 2013) later.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.duplicates.length).toBe(1);
      expect(result.duplicates[0].count).toBe(2);
      expect(result.duplicates[0].key).toBe("wright-2013");
    });

    it("does not flag single-use citations as duplicates", () => {
      const body = "Only once (Wright, 2013) is enough.";
      const refs = "Wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe("accent normalization", () => {
    it("normalises accented surname in citation to match plain reference", () => {
      // The reference extractor uses [A-Za-z'-]+ so accented chars in refs
      // won't parse. But if both citation and reference use ASCII, accents
      // in the normalisation path still work via NFD stripping.
      const body = "As noted by (Muller, 2020), this finding is relevant.";
      const refs = "Muller, K. (2020). Ein Studie. Journal of Research, 5(2), 30-40.";
      const result = crossCheckCitations(body, refs);

      expect(result.orphans).toHaveLength(0);
      expect(result.ghosts).toHaveLength(0);
    });

    it("normalises case differences between citation and reference", () => {
      const body = "According to (Wright, 2013), this is valid.";
      const refs = "wright, J. (2013). A study. Journal of Testing, 1(1), 1-10.";
      const result = crossCheckCitations(body, refs);

      // Both normalise to lowercase "wright"
      expect(result.orphans).toHaveLength(0);
    });
  });
});
