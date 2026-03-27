import { describe, it, expect } from "vitest";
import { calculateReadability } from "@/lib/readability";

describe("calculateReadability", () => {
  it("returns zeroed metrics for empty text", () => {
    const result = calculateReadability("");
    expect(result.fleschKincaid).toBe(0);
    expect(result.fleschEase).toBe(0);
    expect(result.avgSentenceLength).toBe(0);
    expect(result.avgSyllablesPerWord).toBe(0);
    expect(result.passiveVoice).toBe(0);
    expect(result.longSentences).toBe(0);
  });

  it("returns zeroed metrics for a single word (no sentence detected)", () => {
    // splitSentences requires >= 2 words per sentence, so "Hello" alone yields no sentences
    const result = calculateReadability("Hello");
    // wordCount = 1, sentenceCount forced to max(0,1) = 1
    expect(result.avgSentenceLength).toBe(1);
    expect(result.paragraphCount).toBe(1);
  });

  it("calculates metrics for a simple sentence", () => {
    const result = calculateReadability("The cat sat on the mat.");
    // 6 words, 1 sentence
    expect(result.avgSentenceLength).toBe(6);
    expect(result.paragraphCount).toBe(1);
    expect(result.longSentences).toBe(0);
    // All monosyllabic words -> avgSyllablesPerWord should be 1
    expect(result.avgSyllablesPerWord).toBe(1);
  });

  it("detects multiple sentences correctly", () => {
    const text = "The dog barked loudly. The cat ran away. The bird flew high.";
    const result = calculateReadability(text);
    // 3 sentences, each with enough words
    expect(result.avgSentenceLength).toBeCloseTo(4, 0);
    expect(result.longSentences).toBe(0);
  });

  it("detects multiple paragraphs", () => {
    const text = "First paragraph has some words here.\n\nSecond paragraph also has words here.";
    const result = calculateReadability(text);
    expect(result.paragraphCount).toBe(2);
  });

  it("counts syllables correctly through avgSyllablesPerWord", () => {
    // "university" = 5 syllables, single word sentence won't pass splitSentences
    // Use a sentence: "I love university." -> "I"=1, "love"=1, "university"=5 -> avg ~2.33
    const result = calculateReadability("I love university.");
    // 3 words but splitSentences needs >= 2 words, so 1 sentence detected
    // total syllables: 1 + 1 + 5 = 7, avg = 7/3 = 2.33
    expect(result.avgSyllablesPerWord).toBeCloseTo(2.33, 1);
  });

  it("handles monosyllabic words correctly", () => {
    // "cat" "dog" "run" "jump" -> all 1 syllable
    const result = calculateReadability("The cat and dog run fast.");
    expect(result.avgSyllablesPerWord).toBe(1);
  });

  it("produces higher Flesch-Kincaid for complex academic text", () => {
    const simpleText = "The cat sat on the mat. The dog ran fast. It was fun.";
    const complexText =
      "The epistemological implications of contemporary psychological research " +
      "necessitate a comprehensive reevaluation of established methodological " +
      "paradigms within developmental neuroscience.";
    const simpleResult = calculateReadability(simpleText);
    const complexResult = calculateReadability(complexText);
    // Complex text should have a higher grade level
    expect(complexResult.fleschKincaid).toBeGreaterThan(simpleResult.fleschKincaid);
  });

  it("detects passive voice in sentences with be-verb + past participle", () => {
    const text = "The paper was written by the student. The experiment was conducted carefully.";
    const result = calculateReadability(text);
    // Both sentences have passive voice, so passiveVoice should be 100%
    expect(result.passiveVoice).toBe(100);
  });

  it("detects passive voice with 'has been' construction", () => {
    const text = "The report has been completed. The data has been collected.";
    const result = calculateReadability(text);
    expect(result.passiveVoice).toBeGreaterThan(0);
  });

  it("returns 0 passive voice for active sentences", () => {
    const text = "The student wrote the paper. The researcher analyzed the data.";
    const result = calculateReadability(text);
    expect(result.passiveVoice).toBe(0);
  });

  it("detects long sentences (> 35 words)", () => {
    // Build a sentence with > 35 words
    const longSentence =
      "The comprehensive analysis of developmental psychology research methods " +
      "reveals significant implications for understanding how children learn and " +
      "develop cognitive abilities throughout various stages of their early life " +
      "experiences in diverse educational settings across multiple cultural contexts.";
    const shortSentence = "The cat sat on the mat.";
    const text = longSentence + " " + shortSentence;
    const result = calculateReadability(text);
    expect(result.longSentences).toBe(1);
  });

  describe("academic level classification", () => {
    it("classifies simple text as Too Simple", () => {
      // Very short, simple sentences should produce FK < 8
      const result = calculateReadability("I am a cat. He is a dog. We run fast.");
      expect(result.academicLevel).toBe("Too Simple");
    });

    it("classifies complex academic text appropriately", () => {
      const text =
        "The epistemological implications of contemporary psychological research " +
        "necessitate a comprehensive reevaluation of established methodological " +
        "paradigms within the interdisciplinary framework of developmental neuroscience " +
        "and cognitive psychopathology.";
      const result = calculateReadability(text);
      // This should be at least Undergraduate level
      expect(["Undergraduate", "Postgraduate/Too Complex"]).toContain(result.academicLevel);
    });
  });

  it("clamps Flesch Ease between 0 and 100", () => {
    const result = calculateReadability("I am a cat. He is a dog.");
    expect(result.fleschEase).toBeGreaterThanOrEqual(0);
    expect(result.fleschEase).toBeLessThanOrEqual(100);
  });
});
