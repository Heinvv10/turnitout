import { describe, it, expect } from "vitest";
import {
  GRADING_SCALES,
  REFERENCING_STYLES,
  COUNTRIES,
  getGradeLabel,
  getReferencingStyle,
} from "@/lib/i18n-config";

describe("GRADING_SCALES", () => {
  const requiredScales = ["south_africa", "uk", "us"] as const;

  it.each(requiredScales)("has %s scale defined", (scaleId) => {
    expect(GRADING_SCALES[scaleId]).toBeDefined();
    expect(typeof GRADING_SCALES[scaleId].label).toBe("string");
    expect(GRADING_SCALES[scaleId].label.length).toBeGreaterThan(0);
  });

  const allScaleIds = Object.keys(GRADING_SCALES) as (keyof typeof GRADING_SCALES)[];

  describe.each(allScaleIds)("scale %s", (scaleId) => {
    const scaleConfig = GRADING_SCALES[scaleId];

    it("has a non-empty label", () => {
      expect(typeof scaleConfig.label).toBe("string");
      expect(scaleConfig.label.length).toBeGreaterThan(0);
    });

    it("has a numeric pass threshold", () => {
      expect(typeof scaleConfig.pass).toBe("number");
      expect(scaleConfig.pass).toBeGreaterThanOrEqual(0);
      expect(scaleConfig.pass).toBeLessThanOrEqual(100);
    });

    it("has at least two grade entries", () => {
      expect(scaleConfig.scale.length).toBeGreaterThanOrEqual(2);
    });

    it("each grade has label, min, and description fields", () => {
      for (const grade of scaleConfig.scale) {
        expect(typeof grade.label).toBe("string");
        expect(grade.label.length).toBeGreaterThan(0);
        expect(typeof grade.min).toBe("number");
        expect(typeof grade.description).toBe("string");
        expect(grade.description.length).toBeGreaterThan(0);
      }
    });

    it("grade boundaries are in descending order of min values", () => {
      for (let i = 0; i < scaleConfig.scale.length - 1; i++) {
        expect(scaleConfig.scale[i].min).toBeGreaterThan(
          scaleConfig.scale[i + 1].min
        );
      }
    });

    it("lowest grade boundary starts at 0", () => {
      const last = scaleConfig.scale[scaleConfig.scale.length - 1];
      expect(last.min).toBe(0);
    });

    it("highest grade boundary is below or equal to 100", () => {
      expect(scaleConfig.scale[0].min).toBeLessThanOrEqual(100);
    });

    it("all min values are non-negative integers", () => {
      for (const grade of scaleConfig.scale) {
        expect(grade.min).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(grade.min)).toBe(true);
      }
    });
  });
});

describe("getGradeLabel", () => {
  it("returns correct label for SA distinction (75+)", () => {
    const result = getGradeLabel(85, "south_africa");
    expect(result).toBe("85% - First Class (Distinction)");
  });

  it("returns correct label for SA pass (50-59)", () => {
    const result = getGradeLabel(55, "south_africa");
    expect(result).toBe("55% - Third Class (Pass)");
  });

  it("returns correct label for SA fail (0-49)", () => {
    const result = getGradeLabel(30, "south_africa");
    expect(result).toBe("30% - Fail (Below minimum)");
  });

  it("returns correct label for UK first class (70+)", () => {
    const result = getGradeLabel(80, "uk");
    expect(result).toBe("80% - First Class Honours (1st)");
  });

  it("returns correct label for US A grade (93+)", () => {
    const result = getGradeLabel(95, "us");
    expect(result).toBe("95% - A (Excellent)");
  });

  it("returns score with % for unknown scale", () => {
    const result = getGradeLabel(75, "nonexistent_scale");
    expect(result).toBe("75%");
  });

  it("returns Fail label for score of 0", () => {
    const result = getGradeLabel(0, "south_africa");
    expect(result).toBe("0% - Fail (Below minimum)");
  });

  it("handles boundary values correctly at 50 for SA", () => {
    const result = getGradeLabel(50, "south_africa");
    expect(result).toBe("50% - Third Class (Pass)");
  });
});

describe("REFERENCING_STYLES", () => {
  it("has at least 3 referencing styles", () => {
    expect(REFERENCING_STYLES.length).toBeGreaterThanOrEqual(3);
  });

  it("each style has id, label, and description", () => {
    for (const style of REFERENCING_STYLES) {
      expect(typeof style.id).toBe("string");
      expect(style.id.length).toBeGreaterThan(0);
      expect(typeof style.label).toBe("string");
      expect(style.label.length).toBeGreaterThan(0);
      expect(typeof style.description).toBe("string");
      expect(style.description.length).toBeGreaterThan(0);
    }
  });

  it("includes harvard and apa7 styles", () => {
    const ids = REFERENCING_STYLES.map((s) => s.id);
    expect(ids).toContain("harvard");
    expect(ids).toContain("apa7");
  });
});

describe("getReferencingStyle", () => {
  it("returns correct style for known id", () => {
    const result = getReferencingStyle("harvard");
    expect(result.id).toBe("harvard");
    expect(result.label).toBe("Harvard");
  });

  it("falls back to first style for unknown id", () => {
    const result = getReferencingStyle("nonexistent");
    expect(result).toBe(REFERENCING_STYLES[0]);
  });
});

describe("COUNTRIES", () => {
  it("has at least 3 countries defined", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(3);
  });

  it("includes ZA, GB, and US", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(codes).toContain("ZA");
    expect(codes).toContain("GB");
    expect(codes).toContain("US");
  });

  it("each country has a defaultScale that exists in GRADING_SCALES", () => {
    const validScales = Object.keys(GRADING_SCALES);
    for (const country of COUNTRIES) {
      expect(validScales).toContain(country.defaultScale);
    }
  });

  it("each country has a defaultRef that exists in REFERENCING_STYLES", () => {
    const validRefs = REFERENCING_STYLES.map((s) => s.id);
    for (const country of COUNTRIES) {
      expect(validRefs).toContain(country.defaultRef);
    }
  });
});
