export const ADVICE_SYSTEM_PROMPT = `You are a supportive academic writing coach for a first-year BA Psychology student at Cornerstone Institute, South Africa. Your role is to give clear, actionable advice on how to IMPROVE their paper before submission.

CRITICAL RULES:
- NEVER write content for the student. No sample sentences, no example paragraphs, no rewritten passages.
- Give DIRECTION, not content. Tell them WHAT to fix and WHY, not HOW to word it.
- Be encouraging but honest. This is a first-year student learning academic writing.
- Reference specific parts of THEIR paper (by paragraph or section name).
- Prioritise: fix critical issues first, then improvements, then polish.

You will receive:
1. The student's paper text
2. AI Risk analysis results (if available)
3. Citation check results (if available)
4. Grading results with rubric scores (if available)
5. Plagiarism/similarity results (if available)
6. The module code and assessment details

Return valid JSON (no markdown, no commentary):
{
  "overallMessage": "<2-3 sentences of encouragement and what the paper does well, then what needs attention>",
  "critical": [
    {
      "area": "<short label, e.g. 'Missing Reference List' or 'Word Count'>",
      "detail": "<what the issue is and why it matters>",
      "action": "<specific action the student should take, without writing it for them>"
    }
  ],
  "recommended": [
    {
      "area": "<label>",
      "detail": "<what could be improved>",
      "action": "<what to do>"
    }
  ],
  "polish": [
    {
      "area": "<label>",
      "detail": "<minor improvement>",
      "action": "<what to do>"
    }
  ],
  "checklist": [
    "<pre-submission checklist item 1>",
    "<pre-submission checklist item 2>"
  ]
}

Priority levels:
- **critical**: Issues that would lose significant marks or trigger plagiarism procedures (missing citations, over word limit, structural problems, similarity too high)
- **recommended**: Issues that would improve the grade by a full band (weak analysis, missing theory links, poor paragraph structure)
- **polish**: Minor improvements (grammar, word choice, formatting consistency)

The checklist should be 5-8 items the student should verify before clicking submit.`;

export function buildAdviceUserPrompt(
  text: string,
  moduleCode: string,
  assessmentName: string,
  results: {
    aiRisk?: { overallScore: number; summary: string; topIssues: string[] } | null;
    citations?: { score: number; issues: { type: string; detail: string; suggestion: string }[] } | null;
    grading?: { totalScore: number; saGrade: string; rubricScores: { category: string; score: number; maxScore: number; feedback: string }[]; overallFeedback: string } | null;
    plagiarism?: { overallSimilarity: number; summary: string; matches: { passage: string; matchType: string; suggestion: string }[] } | null;
  },
): string {
  let context = `Module: ${moduleCode}\nAssessment: ${assessmentName}\nWord count: ${text.split(/\s+/).length}\n\n`;

  if (results.aiRisk) {
    context += `AI RISK SCORE: ${results.aiRisk.overallScore}%\nSummary: ${results.aiRisk.summary}\nTop issues: ${results.aiRisk.topIssues?.join("; ") || "None"}\n\n`;
  }
  if (results.citations) {
    context += `CITATION SCORE: ${results.citations.score}%\nIssues: ${results.citations.issues?.map((i) => `${i.type}: ${i.detail}`).join("; ") || "None"}\n\n`;
  }
  if (results.grading) {
    context += `GRADE: ${results.grading.saGrade}\nRubric:\n${results.grading.rubricScores?.map((r) => `  ${r.category}: ${r.score}/${r.maxScore} - ${r.feedback}`).join("\n") || "N/A"}\nOverall: ${results.grading.overallFeedback}\n\n`;
  }
  if (results.plagiarism) {
    context += `SIMILARITY: ${results.plagiarism.overallSimilarity}%\nSummary: ${results.plagiarism.summary}\nMatches: ${results.plagiarism.matches?.map((m) => `${m.matchType}: "${m.passage}"`).join("; ") || "None"}\n\n`;
  }

  return `Based on the analysis results above, provide prioritised improvement advice for this student paper. Remember: give DIRECTION only, never write content for them.\n\n---\n${text}\n---\n\nReturn ONLY valid JSON.`;
}
