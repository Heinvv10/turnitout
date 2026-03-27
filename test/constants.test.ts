import { describe, it, expect } from "vitest";
import { getSAGrade, MODULES, SA_GRADE_SCALE } from "@/lib/constants";

describe("getSAGrade", () => {
  it("returns Fail for 0%", () => {
    expect(getSAGrade(0)).toBe("0% - Fail (Below Minimum Pass)");
  });

  it("returns Fail for 49%", () => {
    expect(getSAGrade(49)).toBe("49% - Fail (Below Minimum Pass)");
  });

  it("returns Third Class for 50%", () => {
    expect(getSAGrade(50)).toBe("50% - Third Class (Adequate Achievement)");
  });

  it("returns Third Class for 59%", () => {
    expect(getSAGrade(59)).toBe("59% - Third Class (Adequate Achievement)");
  });

  it("returns Second Class (Lower) for 60%", () => {
    expect(getSAGrade(60)).toBe("60% - Second Class (Lower) (Significant Achievement)");
  });

  it("returns Second Class (Lower) for 69%", () => {
    expect(getSAGrade(69)).toBe("69% - Second Class (Lower) (Significant Achievement)");
  });

  it("returns Second Class (Upper) for 70%", () => {
    expect(getSAGrade(70)).toBe("70% - Second Class (Upper) (Meritorious Achievement)");
  });

  it("returns Second Class (Upper) for 74%", () => {
    expect(getSAGrade(74)).toBe("74% - Second Class (Upper) (Meritorious Achievement)");
  });

  it("returns First Class for 75%", () => {
    expect(getSAGrade(75)).toBe("75% - First Class (Distinction)");
  });

  it("returns First Class for 100%", () => {
    expect(getSAGrade(100)).toBe("100% - First Class (Distinction)");
  });

  it("includes the score percentage in the output", () => {
    const result = getSAGrade(85);
    expect(result).toContain("85%");
  });
});

describe("MODULES", () => {
  it("contains 8 modules total", () => {
    expect(MODULES).toHaveLength(8);
  });

  it("has 4 semester 1 modules", () => {
    const sem1 = MODULES.filter((m) => m.semester === 1);
    expect(sem1).toHaveLength(4);
  });

  it("has 4 semester 2 modules", () => {
    const sem2 = MODULES.filter((m) => m.semester === 2);
    expect(sem2).toHaveLength(4);
  });

  it("each module has required fields", () => {
    for (const mod of MODULES) {
      expect(mod.code).toBeTruthy();
      expect(typeof mod.code).toBe("string");
      expect(mod.name).toBeTruthy();
      expect(typeof mod.name).toBe("string");
      expect([1, 2]).toContain(mod.semester);
      expect(mod.credits).toBe(15);
    }
  });

  it("has unique module codes", () => {
    const codes = MODULES.map((m) => m.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

describe("SA_GRADE_SCALE", () => {
  it("is sorted from highest to lowest min score", () => {
    for (let i = 0; i < SA_GRADE_SCALE.length - 1; i++) {
      expect(SA_GRADE_SCALE[i].min).toBeGreaterThan(SA_GRADE_SCALE[i + 1].min);
    }
  });

  it("has 5 grade levels", () => {
    expect(SA_GRADE_SCALE).toHaveLength(5);
  });

  it("lowest grade starts at 0", () => {
    expect(SA_GRADE_SCALE[SA_GRADE_SCALE.length - 1].min).toBe(0);
  });
});
