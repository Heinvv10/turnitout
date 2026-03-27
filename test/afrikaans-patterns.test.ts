import { describe, it, expect } from "vitest";
import {
  detectAfrikaans,
  analyzeAfrikaansPatterns,
  ACADEMIC_PHRASES,
} from "@/lib/afrikaans-patterns";

describe("detectAfrikaans", () => {
  it("returns high confidence for Afrikaans text", () => {
    const text =
      "Die studente het die werk gedoen en hulle het nie die antwoorde gekry nie. " +
      "Ons kan dit nie verander nie omdat die resultate reeds bevestig is.";
    const confidence = detectAfrikaans(text);

    expect(confidence).toBeGreaterThan(0.3);
  });

  it("returns low confidence for English text", () => {
    const text =
      "The students completed their work and they did not find the answers. " +
      "We cannot change it because the results have already been confirmed.";
    const confidence = detectAfrikaans(text);

    expect(confidence).toBeLessThan(0.15);
  });

  it("returns 0 for very short text (fewer than 5 words)", () => {
    const confidence = detectAfrikaans("Die kat");
    expect(confidence).toBe(0);
  });

  it("returns 0 for empty text", () => {
    const confidence = detectAfrikaans("");
    expect(confidence).toBe(0);
  });

  it("recognises key Afrikaans marker words", () => {
    // Text packed with marker words
    const text = "Die en van het nie wat dat vir kan sal met ook maar ons hulle";
    const confidence = detectAfrikaans(text);
    expect(confidence).toBeGreaterThan(0.5);
  });

  it("caps confidence at 1.0", () => {
    const text =
      "die die die die die die die die die die die die die die die die die die die die";
    const confidence = detectAfrikaans(text);
    expect(confidence).toBeLessThanOrEqual(1);
  });
});

describe("analyzeAfrikaansPatterns", () => {
  describe("language detection integration", () => {
    it("sets isAfrikaans true for Afrikaans text", () => {
      const text =
        "Die studente het nie die antwoorde gekry nie. Ons kan dit nie verander nie.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.isAfrikaans).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.15);
    });

    it("sets isAfrikaans false for English text", () => {
      const text =
        "The students completed their work and received excellent grades.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.isAfrikaans).toBe(false);
    });

    it("skips pattern analysis for non-Afrikaans text", () => {
      const text =
        "The students completed their homework assignment thoroughly.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.findings).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe("Anglisismes detection", () => {
    it("detects anglicised verb forms with ge- prefix", () => {
      const text =
        "Die studente het die film ge-enjoy en hulle het nie die werk gedoen nie.";
      const result = analyzeAfrikaansPatterns(text);

      const anglicisms = result.findings.filter(
        (f) => f.pattern.category === "Anglisismes",
      );
      expect(anglicisms.length).toBeGreaterThan(0);
      expect(result.categoryCounts.Anglisismes).toBeGreaterThan(0);
    });

    it("detects 'applikasie' anglicism", () => {
      const text =
        "Die applikasie is ingedien maar hulle het nie die resultaat gekry nie.";
      const result = analyzeAfrikaansPatterns(text);

      const match = result.findings.find((f) =>
        f.matchedText.toLowerCase().includes("applikasie"),
      );
      expect(match).toBeDefined();
    });
  });

  describe("Register detection", () => {
    it("detects informal 'dis' in academic text", () => {
      const text =
        "Dis belangrik dat die studente hulle werk voltooi het en nie agter geraak het nie.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.categoryCounts.Register).toBeGreaterThan(0);
    });

    it("detects informal 'okay' in academic text", () => {
      const text =
        "Die resultate was okay maar die studente het nie genoeg tyd gehad nie.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.categoryCounts.Register).toBeGreaterThan(0);
    });
  });

  describe("Spelling detection", () => {
    it("detects 'baje' misspelling", () => {
      const text =
        "Die studente het baje hard gewerk maar hulle het nie die toets geslaag nie.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.categoryCounts.Spelling).toBeGreaterThan(0);
    });
  });

  describe("Woordorde detection", () => {
    it("detects missing inversion after fronted adverb", () => {
      const text =
        "Gister ek het die werk voltooi maar hulle het nie gehelp nie.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.categoryCounts.Woordorde).toBeGreaterThan(0);
    });
  });

  describe("category counting", () => {
    it("totalCount matches findings length", () => {
      const text =
        "Dis baje moeilik. Gister ek het dit ge-enjoy maar hulle het nie gehelp nie.";
      const result = analyzeAfrikaansPatterns(text);

      expect(result.totalCount).toBe(result.findings.length);
    });

    it("categoryCount reflects distinct categories with findings", () => {
      const text =
        "Dis baje moeilik. Gister ek het dit ge-enjoy maar hulle het nie gehelp nie.";
      const result = analyzeAfrikaansPatterns(text);

      const nonZero = Object.values(result.categoryCounts).filter(
        (c) => c > 0,
      ).length;
      expect(result.categoryCount).toBe(nonZero);
    });

    it("initialises all category counts to zero before counting", () => {
      const text =
        "Die studente het hulle werk korrek en volledig voltooi sonder enige foute nie.";
      const result = analyzeAfrikaansPatterns(text);

      for (const count of Object.values(result.categoryCounts)) {
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("findings sorting", () => {
    it("findings are sorted by index ascending", () => {
      const text =
        "Dis baje moeilik. Gister ek het dit ge-enjoy maar hulle het nie gehelp nie.";
      const result = analyzeAfrikaansPatterns(text);

      for (let i = 1; i < result.findings.length; i++) {
        expect(result.findings[i].index).toBeGreaterThanOrEqual(
          result.findings[i - 1].index,
        );
      }
    });
  });
});

describe("ACADEMIC_PHRASES", () => {
  it("contains phrases for multiple contexts", () => {
    const contexts = new Set(ACADEMIC_PHRASES.map((p) => p.context));
    expect(contexts.size).toBeGreaterThanOrEqual(4);
  });

  it("includes Inleiding phrases", () => {
    const inleiding = ACADEMIC_PHRASES.filter(
      (p) => p.context === "Inleiding",
    );
    expect(inleiding.length).toBeGreaterThan(0);
  });

  it("includes Gevolgtrekking phrases", () => {
    const gevolg = ACADEMIC_PHRASES.filter(
      (p) => p.context === "Gevolgtrekking",
    );
    expect(gevolg.length).toBeGreaterThan(0);
  });

  it("every phrase has a non-empty phrase string", () => {
    for (const item of ACADEMIC_PHRASES) {
      expect(item.phrase.length).toBeGreaterThan(0);
    }
  });
});
