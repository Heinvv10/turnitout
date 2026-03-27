import { describe, it, expect } from "vitest";
import { analyzeESLPatterns } from "@/lib/esl-patterns";

describe("analyzeESLPatterns", () => {
  describe("text with no ESL errors", () => {
    it("returns empty findings for clean academic text", () => {
      const text =
        "Cognitive development proceeds through distinct stages. " +
        "Each stage involves new capabilities and greater abstraction.";
      const result = analyzeESLPatterns(text);

      expect(result.findings).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.categoryCount).toBe(0);
    });

    it("returns zero category counts for error-free text", () => {
      const text = "This sentence is grammatically correct and well-formed.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Articles).toBe(0);
      expect(result.categoryCounts.Prepositions).toBe(0);
      expect(result.categoryCounts.Tense).toBe(0);
      expect(result.categoryCounts.Agreement).toBe(0);
      expect(result.categoryCounts["Sentence Structure"]).toBe(0);
      expect(result.categoryCounts.Vocabulary).toBe(0);
    });
  });

  describe("Articles category", () => {
    it("detects missing article before singular noun", () => {
      const text = "She went to school yesterday morning.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Articles).toBeGreaterThan(0);
      const articleFindings = result.findings.filter(
        (f) => f.pattern.category === "Articles",
      );
      expect(articleFindings.length).toBeGreaterThan(0);
    });

    it("detects missing article before adjective-noun", () => {
      const text = "It is important factor in the study.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Articles).toBeGreaterThan(0);
    });
  });

  describe("Prepositions category", () => {
    it("detects 'discuss about' redundant preposition", () => {
      const text = "We need to discuss about the results of this study.";
      const result = analyzeESLPatterns(text);

      const prepFindings = result.findings.filter(
        (f) => f.pattern.category === "Prepositions",
      );
      expect(prepFindings.length).toBeGreaterThan(0);
      expect(prepFindings[0].matchedText.toLowerCase()).toContain("discuss");
    });

    it("detects 'arrive to' wrong preposition", () => {
      const text = "They arrived to the university campus late.";
      const result = analyzeESLPatterns(text);

      const prepFindings = result.findings.filter(
        (f) => f.pattern.category === "Prepositions",
      );
      expect(prepFindings.length).toBeGreaterThan(0);
    });

    it("detects 'comprises of' redundant preposition", () => {
      const text = "The study comprises of three main sections.";
      const result = analyzeESLPatterns(text);

      const match = result.findings.find((f) =>
        f.matchedText.toLowerCase().includes("comprises of"),
      );
      expect(match).toBeDefined();
    });

    it("detects 'emphasise on' incorrect preposition", () => {
      const text = "The researcher emphasized on the importance of ethics.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Prepositions).toBeGreaterThan(0);
    });
  });

  describe("Tense category", () => {
    it("detects tense shift within same sentence", () => {
      const text = "The study was conducted and the results are showing improvement.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Tense).toBeGreaterThan(0);
    });

    it("detects missing past tense marker after time indicator", () => {
      const text = "In 2019 the data show a significant decline in enrolment.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Tense).toBeGreaterThan(0);
    });
  });

  describe("Agreement category", () => {
    it("detects plural noun with singular verb", () => {
      const text = "The results shows a significant improvement in scores.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Agreement).toBeGreaterThan(0);
      const finding = result.findings.find((f) =>
        f.matchedText.toLowerCase().includes("results shows"),
      );
      expect(finding).toBeDefined();
    });

    it("detects collective noun with wrong verb form", () => {
      const text = "The people is very concerned about this issue.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Agreement).toBeGreaterThan(0);
    });

    it("detects this/that with plural noun", () => {
      const text = "This results are very interesting and noteworthy.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Agreement).toBeGreaterThan(0);
    });
  });

  describe("Sentence Structure category", () => {
    it("detects missing copula", () => {
      const text = "She happy about the results of the experiment.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts["Sentence Structure"]).toBeGreaterThan(0);
    });

    it("detects double negation", () => {
      const text = "They don't know nothing about cognitive development.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts["Sentence Structure"]).toBeGreaterThan(0);
    });

    it("detects comma splice with conjunctive adverb", () => {
      const text =
        "The results were significant, however the sample size was small.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts["Sentence Structure"]).toBeGreaterThan(0);
    });
  });

  describe("Vocabulary category", () => {
    it("detects 'explain me' transfer error", () => {
      const text = "Please explain me the concept of reinforcement.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Vocabulary).toBeGreaterThan(0);
    });

    it("detects 'would of' error", () => {
      const text = "The participants would of performed better with training.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Vocabulary).toBeGreaterThan(0);
    });

    it("detects 'the reason is because' redundancy", () => {
      const text = "The reason is because the sample was too small.";
      const result = analyzeESLPatterns(text);

      expect(result.categoryCounts.Vocabulary).toBeGreaterThan(0);
    });
  });

  describe("pattern count and grouping", () => {
    it("totalCount matches findings array length", () => {
      const text =
        "She went to school. The results shows improvement. They don't know nothing.";
      const result = analyzeESLPatterns(text);

      expect(result.totalCount).toBe(result.findings.length);
    });

    it("categoryCount reflects number of distinct categories with findings", () => {
      const text =
        "She went to school. The results shows improvement. " +
        "They don't know nothing about it. We need to discuss about it.";
      const result = analyzeESLPatterns(text);

      const nonZeroCategories = Object.values(result.categoryCounts).filter(
        (c) => c > 0,
      ).length;
      expect(result.categoryCount).toBe(nonZeroCategories);
    });

    it("findings are sorted by index position in text", () => {
      const text =
        "She went to school yesterday. The results shows improvement. " +
        "He arrived to campus late. They don't know nothing about it.";
      const result = analyzeESLPatterns(text);

      for (let i = 1; i < result.findings.length; i++) {
        expect(result.findings[i].index).toBeGreaterThanOrEqual(
          result.findings[i - 1].index,
        );
      }
    });
  });

  describe("multiple errors in one text", () => {
    it("detects errors across multiple categories", () => {
      const text =
        "She went to school yesterday. They discussed about the findings. " +
        "The results shows improvement. He happy about it. " +
        "Please explain me the concept. The study was done and it is good now.";
      const result = analyzeESLPatterns(text);

      expect(result.totalCount).toBeGreaterThan(3);
      expect(result.categoryCount).toBeGreaterThan(2);
    });
  });
});
