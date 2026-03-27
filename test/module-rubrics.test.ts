import { describe, it, expect } from "vitest";
import {
  MODULE_RUBRICS,
  getModuleRubric,
  type ModuleRubric,
  type AssessmentBrief,
} from "@/lib/module-rubrics";

describe("MODULE_RUBRICS data integrity", () => {
  const moduleCodes = Object.keys(MODULE_RUBRICS);

  it("has at least one module defined", () => {
    expect(moduleCodes.length).toBeGreaterThan(0);
  });

  describe.each(moduleCodes)("module %s", (code) => {
    const rubric: ModuleRubric = MODULE_RUBRICS[code];

    it("has required top-level fields", () => {
      expect(rubric.moduleCode).toBe(code);
      expect(typeof rubric.moduleName).toBe("string");
      expect(rubric.moduleName.length).toBeGreaterThan(0);
      expect(Array.isArray(rubric.assessments)).toBe(true);
      expect(rubric.assessments.length).toBeGreaterThan(0);
    });

    it("has a non-empty lecturer name", () => {
      expect(typeof rubric.lecturer).toBe("string");
      expect(rubric.lecturer.length).toBeGreaterThan(0);
    });

    it("has topics and learning outcomes arrays", () => {
      expect(Array.isArray(rubric.topics)).toBe(true);
      expect(rubric.topics.length).toBeGreaterThan(0);
      expect(Array.isArray(rubric.learningOutcomes)).toBe(true);
      expect(rubric.learningOutcomes.length).toBeGreaterThan(0);
    });

    describe("assessments", () => {
      rubric.assessments.forEach((assessment: AssessmentBrief, idx: number) => {
        describe(`assessment[${idx}]: ${assessment.name}`, () => {
          it("has a non-empty name", () => {
            expect(typeof assessment.name).toBe("string");
            expect(assessment.name.length).toBeGreaterThan(0);
          });

          it("has a dueWeek that is a positive integer within semester range (1-16)", () => {
            expect(typeof assessment.dueWeek).toBe("number");
            expect(Number.isInteger(assessment.dueWeek)).toBe(true);
            expect(assessment.dueWeek).toBeGreaterThanOrEqual(1);
            expect(assessment.dueWeek).toBeLessThanOrEqual(16);
          });

          it("has a non-empty question string", () => {
            expect(typeof assessment.question).toBe("string");
            expect(assessment.question.length).toBeGreaterThan(0);
          });

          it("has a type field", () => {
            expect(typeof assessment.type).toBe("string");
            expect(assessment.type.length).toBeGreaterThan(0);
          });

          it("has a numeric weighting between 0 and 100", () => {
            expect(typeof assessment.weighting).toBe("number");
            expect(assessment.weighting).toBeGreaterThan(0);
            expect(assessment.weighting).toBeLessThanOrEqual(100);
          });

          it("has a structure array", () => {
            expect(Array.isArray(assessment.structure)).toBe(true);
          });

          it("has a resources array", () => {
            expect(Array.isArray(assessment.resources)).toBe(true);
          });
        });
      });
    });

    describe("rubric criteria", () => {
      const rubricKeys = Object.keys(rubric.rubrics);

      it("has at least one rubric defined", () => {
        expect(rubricKeys.length).toBeGreaterThan(0);
      });

      rubricKeys.forEach((assessmentName) => {
        describe(`rubric for "${assessmentName}"`, () => {
          const criteria = rubric.rubrics[assessmentName];

          it("has criteria array with at least one criterion", () => {
            expect(Array.isArray(criteria)).toBe(true);
            expect(criteria.length).toBeGreaterThan(0);
          });

          criteria.forEach((criterion, idx) => {
            it(`criterion[${idx}] "${criterion.name}" has required fields`, () => {
              expect(typeof criterion.name).toBe("string");
              expect(criterion.name.length).toBeGreaterThan(0);
              expect(typeof criterion.description).toBe("string");
              expect(typeof criterion.maxMark).toBe("number");
              expect(criterion.maxMark).toBeGreaterThan(0);
            });

            it(`criterion[${idx}] "${criterion.name}" has all grading levels`, () => {
              expect(typeof criterion.levels.excellent).toBe("string");
              expect(typeof criterion.levels.good).toBe("string");
              expect(typeof criterion.levels.satisfactory).toBe("string");
              expect(typeof criterion.levels.basic).toBe("string");
              expect(typeof criterion.levels.fail).toBe("string");
            });
          });

          it("criteria maxMark values sum to 100", () => {
            const total = criteria.reduce((sum, c) => sum + c.maxMark, 0);
            expect(total).toBe(100);
          });
        });
      });
    });
  });
});

describe("getModuleRubric", () => {
  it("returns rubric and criteria for a valid module code", () => {
    const result = getModuleRubric("CALS5150");
    expect(result.rubric).not.toBeNull();
    expect(result.rubric!.moduleCode).toBe("CALS5150");
    expect(result.criteria).not.toBeNull();
    expect(result.criteria!.length).toBeGreaterThan(0);
  });

  it("returns specific assessment criteria when assessmentName is given", () => {
    const result = getModuleRubric("CALS5150", "Presentation");
    expect(result.rubric).not.toBeNull();
    expect(result.criteria).not.toBeNull();
    // Presentation rubric has specific criteria names
    const names = result.criteria!.map((c) => c.name);
    expect(names).toContain("Insight & Reflection");
  });

  it("falls back to first rubric when assessmentName is not found", () => {
    const result = getModuleRubric("CALS5150", "Nonexistent Assessment");
    expect(result.rubric).not.toBeNull();
    expect(result.criteria).not.toBeNull();
    // Should return the first rubric (Reflective Essay)
    const names = result.criteria!.map((c) => c.name);
    expect(names).toContain("Reflection & Insight");
  });

  it("returns null for unknown module code", () => {
    const result = getModuleRubric("FAKE999");
    expect(result.rubric).toBeNull();
    expect(result.criteria).toBeNull();
  });
});
