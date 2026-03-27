import { describe, it, expect } from "vitest";
import { analyzeVocabulary } from "@/lib/vocabulary-analysis";

describe("analyzeVocabulary", () => {
  describe("empty text", () => {
    it("returns zero score and basic level for empty string", () => {
      const result = analyzeVocabulary("");
      expect(result.level).toBe("basic");
      expect(result.score).toBe(0);
      expect(result.totalWords).toBe(0);
      expect(result.uniqueWords).toBe(0);
      expect(result.lexicalDiversity).toBe(0);
      expect(result.upgrades).toHaveLength(0);
    });

    it("returns zero for whitespace-only input", () => {
      const result = analyzeVocabulary("   \n\t  ");
      expect(result.totalWords).toBe(0);
      expect(result.score).toBe(0);
    });
  });

  describe("simple words suggest upgrades", () => {
    it("suggests upgrades for common simple words", () => {
      const text =
        "This is a good thing and it is very important to use good methods. " +
        "We think this is a good approach because it is very good for results.";
      const result = analyzeVocabulary(text);

      const upgradeWords = result.upgrades.map((u) => u.word);
      expect(upgradeWords).toContain("good");
      expect(upgradeWords).toContain("very");
      expect(upgradeWords).toContain("think");
    });

    it("provides correct suggestions for 'good'", () => {
      const text = "The good results were good overall.";
      const result = analyzeVocabulary(text);
      const goodUpgrade = result.upgrades.find((u) => u.word === "good");

      expect(goodUpgrade).toBeDefined();
      expect(goodUpgrade!.suggestions).toContain("beneficial");
      expect(goodUpgrade!.suggestions).toContain("advantageous");
      expect(goodUpgrade!.count).toBe(2);
    });

    it("provides correct suggestions for 'bad'", () => {
      const text = "The bad outcome was truly bad for everyone involved.";
      const result = analyzeVocabulary(text);
      const badUpgrade = result.upgrades.find((u) => u.word === "bad");

      expect(badUpgrade).toBeDefined();
      expect(badUpgrade!.suggestions).toContain("detrimental");
    });

    it("sorts upgrades by count descending", () => {
      const text =
        "This is good and good and good but also bad and very very important.";
      const result = analyzeVocabulary(text);

      for (let i = 1; i < result.upgrades.length; i++) {
        expect(result.upgrades[i - 1].count).toBeGreaterThanOrEqual(
          result.upgrades[i].count,
        );
      }
    });
  });

  describe("academic words boost score", () => {
    it("scores higher when text contains academic vocabulary", () => {
      const simpleText =
        "This is a good thing and we think it is very important to look at many things.";
      const academicText =
        "This methodology demonstrates a significant correlation between the qualitative framework and the empirical paradigm of the hypothesis.";

      const simpleResult = analyzeVocabulary(simpleText);
      const academicResult = analyzeVocabulary(academicText);

      expect(academicResult.score).toBeGreaterThan(simpleResult.score);
    });

    it("recognises specific academic words", () => {
      const text =
        "The methodology and framework demonstrate a comprehensive analysis of the phenomenon. " +
        "Furthermore, the qualitative paradigm illustrates significant implications.";
      const result = analyzeVocabulary(text);

      expect(result.score).toBeGreaterThan(40);
    });
  });

  describe("lexical diversity", () => {
    it("calculates higher diversity for varied vocabulary", () => {
      const repetitive = "the the the the the the the the the the";
      const varied =
        "apple banana cherry date elderberry fig grape honeydew kiwi lemon";

      const repResult = analyzeVocabulary(repetitive);
      const varResult = analyzeVocabulary(varied);

      expect(varResult.lexicalDiversity).toBeGreaterThan(
        repResult.lexicalDiversity,
      );
    });

    it("returns diversity between 0 and 1", () => {
      const text = "Some words are here and some words are there too.";
      const result = analyzeVocabulary(text);

      expect(result.lexicalDiversity).toBeGreaterThanOrEqual(0);
      expect(result.lexicalDiversity).toBeLessThanOrEqual(1);
    });

    it("returns 1.0 when all words are unique", () => {
      const text = "apple banana cherry date elderberry";
      const result = analyzeVocabulary(text);
      expect(result.lexicalDiversity).toBe(1);
    });
  });

  describe("level thresholds", () => {
    it("assigns 'basic' for score below 40", () => {
      // Lots of simple repeated words, no academic vocab
      const text =
        "It is good good good very very very bad bad bad thing thing thing. " +
        "We think think think use use use get get get make make make help help.";
      const result = analyzeVocabulary(text);

      expect(result.score).toBeLessThan(40);
      expect(result.level).toBe("basic");
    });

    it("assigns 'intermediate' for score between 40 and 70", () => {
      const text =
        "The methodology demonstrates a correlation between these factors. " +
        "This analysis shows good results but also some bad outcomes in the data. " +
        "We think the framework is important for understanding the phenomenon.";
      const result = analyzeVocabulary(text);

      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThanOrEqual(70);
      expect(result.level).toBe("intermediate");
    });

    it("assigns 'advanced' for score above 70", () => {
      const text =
        "The theoretical framework demonstrates significant empirical correlation. " +
        "This qualitative methodology illustrates comprehensive paradigm implications. " +
        "Furthermore, the systematic analysis facilitates conceptual understanding. " +
        "The longitudinal assessment reveals substantial cognitive perception. " +
        "Subsequently, the multifaceted phenomenon contributes to contemporary discourse.";
      const result = analyzeVocabulary(text);

      expect(result.score).toBeGreaterThan(70);
      expect(result.level).toBe("advanced");
    });
  });

  describe("word count accuracy", () => {
    it("counts total and unique words correctly", () => {
      const text = "the cat sat on the mat";
      const result = analyzeVocabulary(text);

      expect(result.totalWords).toBe(6);
      expect(result.uniqueWords).toBe(5); // 'the' repeated
    });

    it("strips punctuation before counting", () => {
      const text = "Hello, world! How are you?";
      const result = analyzeVocabulary(text);

      // Punctuation stripped, single-char words filtered
      expect(result.totalWords).toBeGreaterThan(0);
    });
  });

  describe("specific word mappings", () => {
    const mappings: [string, string][] = [
      ["good", "beneficial"],
      ["bad", "detrimental"],
      ["big", "significant"],
      ["small", "minimal"],
      ["show", "demonstrate"],
      ["important", "crucial"],
      ["also", "furthermore"],
    ];

    for (const [simple, academic] of mappings) {
      it(`maps '${simple}' to suggestions including '${academic}'`, () => {
        const text = `The ${simple} factor is ${simple} indeed very ${simple} overall.`;
        const result = analyzeVocabulary(text);
        const upgrade = result.upgrades.find((u) => u.word === simple);
        expect(upgrade).toBeDefined();
        expect(upgrade!.suggestions).toContain(academic);
      });
    }
  });
});
