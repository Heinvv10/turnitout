/**
 * Module-specific assessment rubrics extracted from official Cornerstone Institute module outlines.
 * These are used to grade papers against the EXACT criteria the lecturers use.
 */

export interface AssessmentBrief {
  name: string;
  type: string;
  weighting: number;
  wordCount: string;
  dueWeek: number;
  question: string;
  structure: string[];
  resources: string[];
  aiPolicy: string;
  referencing: string;
}

export interface RubricCriterion {
  name: string;
  description: string;
  maxMark: number;
  levels: {
    excellent: string; // 75-100%
    good: string; // 70-74%
    satisfactory: string; // 60-69%
    basic: string; // 50-59%
    fail: string; // 0-49%
  };
}

export interface ModuleRubric {
  moduleCode: string;
  moduleName: string;
  lecturer: string;
  turnitinThreshold: number;
  assessments: AssessmentBrief[];
  rubrics: Record<string, RubricCriterion[]>; // keyed by assessment name
  topics: string[];
  learningOutcomes: string[];
}

import {
  CALS5150_RUBRIC,
  NTIN5150_RUBRIC,
  DEVP5150_RUBRIC,
  NCHC5150_RUBRIC,
  PSIN5150_RUBRIC,
  FDEV5150_RUBRIC,
  THIN5150_RUBRIC,
} from "./rubrics";

export const MODULE_RUBRICS: Record<string, ModuleRubric> = {
  CALS5150: CALS5150_RUBRIC,
  NTIN5150: NTIN5150_RUBRIC,
  DEVP5150: DEVP5150_RUBRIC,
  NCHC5150: NCHC5150_RUBRIC,
  PSIN5150: PSIN5150_RUBRIC,
  FDEV5150: FDEV5150_RUBRIC,
  THIN5150: THIN5150_RUBRIC,
};

/**
 * Get the rubric for a specific module and assessment type.
 * Falls back to generic rubric if module-specific one doesn't exist.
 */
export function getModuleRubric(
  moduleCode: string,
  assessmentName?: string,
): { rubric: ModuleRubric | null; criteria: RubricCriterion[] | null } {
  const rubric = MODULE_RUBRICS[moduleCode] || null;
  if (!rubric) return { rubric: null, criteria: null };

  if (assessmentName && rubric.rubrics[assessmentName]) {
    return { rubric, criteria: rubric.rubrics[assessmentName] };
  }

  // Default to first assessment's rubric
  const firstKey = Object.keys(rubric.rubrics)[0];
  return {
    rubric,
    criteria: firstKey ? rubric.rubrics[firstKey] : null,
  };
}
