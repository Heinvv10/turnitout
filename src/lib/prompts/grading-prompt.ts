import { MODULES, getSAGrade } from "@/lib/constants";
import {
  getModuleRubric,
  type RubricCriterion,
  type ModuleRubric,
} from "@/lib/module-rubrics";

/**
 * Build the grading system prompt. Can accept an uploaded outline
 * or fall back to hardcoded rubrics.
 */
export function buildGradingSystemPrompt(
  moduleCode: string,
  assessmentName?: string,
  uploadedOutline?: ModuleRubric | null,
): string {
  // Priority: uploaded outline > hardcoded rubric > generic
  if (uploadedOutline) {
    const criteria = assessmentName
      ? uploadedOutline.rubrics?.[assessmentName]
      : Object.values(uploadedOutline.rubrics || {})[0];
    if (criteria) {
      return buildSpecificPrompt(uploadedOutline, criteria, assessmentName);
    }
  }

  const { rubric, criteria } = getModuleRubric(moduleCode, assessmentName);
  if (rubric && criteria) {
    return buildSpecificPrompt(rubric, criteria, assessmentName);
  }
  return GENERIC_GRADING_PROMPT;
}

function buildSpecificPrompt(
  rubric: ModuleRubric,
  criteria: RubricCriterion[],
  assessmentName?: string,
): string {
  const assessment = assessmentName
    ? rubric.assessments.find((a) => a.name === assessmentName)
    : rubric.assessments[0];

  const rubricTable = criteria
    .map(
      (c) =>
        `### ${c.name} (/${c.maxMark})
Description: ${c.description}
- A (75-100%): ${c.levels.excellent}
- B (70-74%): ${c.levels.good}
- C (60-69%): ${c.levels.satisfactory}
- D (50-59%): ${c.levels.basic}
- F (0-49%): ${c.levels.fail}`,
    )
    .join("\n\n");

  return `You are grading a first-year paper for **${rubric.moduleCode} - ${rubric.moduleName}** at Cornerstone Institute, South Africa. The lecturer is ${rubric.lecturer}.

## Module Learning Outcomes
${rubric.learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join("\n")}

## Assessment Details
${assessment ? `- **Assessment:** ${assessment.name} (${assessment.type}, ${assessment.weighting}% of module)
- **Word count:** ${assessment.wordCount}
- **Question:** ${assessment.question}
- **Required structure:** ${assessment.structure.join(" → ")}
- **Required resources:** ${assessment.resources.join("; ")}
- **Referencing style:** ${assessment.referencing}
- **AI Policy:** ${assessment.aiPolicy}` : "No specific assessment brief available."}

## Turnitin Threshold
Similarity score above **${rubric.turnitinThreshold}%** triggers automatic plagiarism procedures.

## Marking Rubric
Grade against these EXACT criteria (these are the criteria the lecturer uses):

${rubricTable}

**Total: /${criteria.reduce((sum, c) => sum + c.maxMark, 0)}**

## South African Grading Scale
- 75-100%: A - Distinction (Excellent)
- 70-74%: B - Upper Second (Good)
- 60-69%: C - Lower Second (Satisfactory)
- 50-59%: D - Third Class (Basic pass)
- 0-49%: F - Fail (Needs development)

## Important Grading Notes
- This is a FIRST-YEAR student (NQF Level 5). Grade at first-year level.
- Be constructive and encouraging - this is formative feedback to help improve before submission.
- The essay is a REFLECTIVE piece - personal experience and self-awareness matter as much as theory.
- Check if they meet the word count requirement (${assessment?.wordCount || "as specified"}).
- Check if the required structure is followed.
- Flag any potential AI-generated content patterns (overly generic, lacks personal voice).

Return valid JSON (no markdown, no commentary):
{
  "rubricScores": [
    {
      "category": "<exact criterion name from rubric>",
      "maxScore": <max mark>,
      "score": <awarded mark>,
      "feedback": "<2-3 sentences of specific feedback referencing the rubric level descriptors>",
      "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"]
    }
  ],
  "totalScore": <number 0-100>,
  "saGrade": "<e.g. 65% - C (Satisfactory)>",
  "overallFeedback": "<paragraph of constructive overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "trafficLight": "<green|yellow|red>"
}

Traffic light: green = 60%+, yellow = 50-59%, red = <50%.`;
}

const GENERIC_GRADING_PROMPT = `You are an experienced South African university lecturer grading a first-year BA Psychology paper at Cornerstone Institute. You provide constructive, formative feedback to help the student improve before final submission.

Grade against these rubric categories:

1. **Understanding of Concepts (0-25)**: Does the student demonstrate a genuine grasp of key theories, concepts, and psychological principles?
2. **Critical Analysis (0-25)**: Does the student evaluate, compare, and synthesise rather than merely describe?
3. **Argument Structure & Flow (0-20)**: Is there a clear thesis/argument? Are paragraphs logically organised?
4. **Source Quality & Citation (0-15)**: Are sources peer-reviewed and relevant? Is Harvard referencing format correct?
5. **Academic Tone & Writing Quality (0-15)**: Is the register formal and academic? Is grammar correct?

GRADING SCALE (South African):
- 75-100%: Distinction
- 70-74%: Upper Second
- 60-69%: Lower Second
- 50-59%: Third Class (pass)
- 0-49%: Fail

This is a FIRST-YEAR student. Grade at first-year level. Be encouraging but honest.

Return valid JSON (no markdown, no commentary):
{
  "rubricScores": [
    {
      "category": "<category name>",
      "maxScore": <number>,
      "score": <number>,
      "feedback": "<2-3 sentences>",
      "improvements": ["<improvement 1>", "<improvement 2>"]
    }
  ],
  "totalScore": <number 0-100>,
  "saGrade": "<e.g. 65% - Lower Second (Satisfactory)>",
  "overallFeedback": "<paragraph of constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "trafficLight": "<green|yellow|red>"
}

Traffic light: green = 60%+, yellow = 50-59%, red = <50%.`;

export function buildGradingUserPrompt(
  text: string,
  moduleCode: string,
  assignmentTitle: string,
): string {
  const module = MODULES.find((m) => m.code === moduleCode);
  const moduleName = module?.name || moduleCode;

  return `Grade the following first-year paper.

Module: ${moduleCode} — ${moduleName}
Assignment title: ${assignmentTitle || "Untitled"}
Word count: ${text.split(/\s+/).length}

---
${text}
---

Return ONLY valid JSON. No markdown fences, no commentary.`;
}
