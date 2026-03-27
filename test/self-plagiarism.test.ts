import { describe, it, expect } from "vitest";
import { checkSelfPlagiarism } from "@/lib/self-plagiarism";
import type { PreviousWork } from "@/lib/self-plagiarism";

describe("checkSelfPlagiarism", () => {
  describe("no overlap", () => {
    it("returns no matches for completely different texts", () => {
      const current =
        "The psychology of learning involves complex cognitive processes that shape behavior over time.";
      const previous: PreviousWork[] = [
        {
          title: "Essay A",
          text: "Astronomy explores celestial bodies and phenomena across the vast universe with powerful telescopes and instruments.",
        },
      ];
      const result = checkSelfPlagiarism(current, previous);

      expect(result.matches).toHaveLength(0);
      expect(result.overallScore).toBe(0);
    });

    it("returns no matches when previous texts array is empty", () => {
      const result = checkSelfPlagiarism(
        "Some text about cognitive development in children.",
        [],
      );
      expect(result.matches).toHaveLength(0);
      expect(result.overallScore).toBe(0);
    });
  });

  describe("exact copy detection", () => {
    it("detects high overlap when current is a copy of previous", () => {
      const shared =
        "Cognitive behavioral therapy is an evidence-based approach that helps individuals identify and change negative thought patterns and behaviors through structured sessions and homework assignments between weekly meetings.";
      const previous: PreviousWork[] = [
        { title: "Old Essay", text: shared },
      ];
      const result = checkSelfPlagiarism(shared, previous);

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(50);
    });

    it("reports the correct previous document title", () => {
      const shared =
        "The research methodology involved a systematic review of existing literature followed by qualitative interviews with ten participants from diverse backgrounds across three different institutions.";
      const previous: PreviousWork[] = [
        { title: "Research Methods Essay", text: shared },
      ];
      const result = checkSelfPlagiarism(shared, previous);

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].previousTitle).toBe("Research Methods Essay");
    });
  });

  describe("partial overlap (8+ word matches)", () => {
    it("detects an 8+ word consecutive overlap", () => {
      const shared =
        "the systematic review of existing literature reveals important findings about cognitive development";
      const current = `In this essay, ${shared} in adolescents specifically.`;
      const previous: PreviousWork[] = [
        {
          title: "Lit Review",
          text: `Our analysis using ${shared} was groundbreaking and significant.`,
        },
      ];
      const result = checkSelfPlagiarism(current, previous);

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(0);
    });

    it("does not flag overlaps shorter than 8 words", () => {
      const current =
        "Psychology is interesting and complex field requiring deep study and dedication over time.";
      const previous: PreviousWork[] = [
        {
          title: "Intro Essay",
          text: "Biology is interesting and complex topic requiring broad knowledge and understanding overall.",
        },
      ];
      const result = checkSelfPlagiarism(current, previous);

      // Short overlaps like "is interesting and complex" (4 words) should not flag
      expect(result.overallScore).toBeLessThan(50);
    });
  });

  describe("short text edge cases", () => {
    it("returns no matches for empty current text", () => {
      const result = checkSelfPlagiarism("", [
        { title: "Old", text: "Some previous work text." },
      ]);
      expect(result.matches).toHaveLength(0);
      expect(result.overallScore).toBe(0);
    });

    it("returns no matches for whitespace-only current text", () => {
      const result = checkSelfPlagiarism("   \n  ", [
        { title: "Old", text: "Some text here." },
      ]);
      expect(result.matches).toHaveLength(0);
      expect(result.overallScore).toBe(0);
    });

    it("returns no matches when current text is shorter than ngram size", () => {
      const result = checkSelfPlagiarism("Too short", [
        { title: "Old", text: "Too short is also here." },
      ]);
      expect(result.matches).toHaveLength(0);
      expect(result.overallScore).toBe(0);
    });
  });

  describe("multiple previous documents", () => {
    it("detects matches from different previous documents", () => {
      const phrase1 =
        "the cognitive behavioral framework provides a structured approach to understanding mental health";
      const phrase2 =
        "participants were recruited from three different university campuses across the country during autumn";
      const current = `In this study, ${phrase1}. Additionally, ${phrase2}.`;
      const previous: PreviousWork[] = [
        {
          title: "Essay One",
          text: `We explored how ${phrase1} disorders comprehensively.`,
        },
        {
          title: "Essay Two",
          text: `In our methodology, ${phrase2} semester.`,
        },
      ];
      const result = checkSelfPlagiarism(current, previous);

      expect(result.matches.length).toBeGreaterThanOrEqual(2);
      const titles = result.matches.map((m) => m.previousTitle);
      expect(titles).toContain("Essay One");
      expect(titles).toContain("Essay Two");
    });

    it("calculates overall score based on total coverage", () => {
      const longText =
        "This is a completely original essay about a topic that nobody has written about before in the history of academic writing at this institution.";
      const overlapping =
        "evidence based systematic review of existing peer reviewed literature on cognitive behavioral therapy approaches";
      const current = `${longText} Furthermore, ${overlapping} is crucial.`;
      const previous: PreviousWork[] = [
        {
          title: "Previous",
          text: `The ${overlapping} was conducted successfully.`,
        },
      ];
      const result = checkSelfPlagiarism(current, previous);

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(100);
    });
  });

  describe("normalisation", () => {
    it("detects matches regardless of case differences", () => {
      const phrase =
        "the systematic review of existing literature reveals important findings about development";
      const current = phrase;
      const previous: PreviousWork[] = [
        { title: "Old", text: phrase.toUpperCase() },
      ];
      const result = checkSelfPlagiarism(current, previous);

      expect(result.matches.length).toBeGreaterThan(0);
    });

    it("detects matches regardless of punctuation differences", () => {
      const current =
        "The systematic review of existing literature reveals important findings about development.";
      const previous: PreviousWork[] = [
        {
          title: "Old",
          text: "The systematic review of existing literature reveals important findings about development!",
        },
      ];
      const result = checkSelfPlagiarism(current, previous);

      expect(result.matches.length).toBeGreaterThan(0);
    });
  });
});
