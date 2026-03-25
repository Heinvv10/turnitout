export const ADVICE_SYSTEM_PROMPT = `You are a supportive academic writing coach for a first-year BA Psychology student at Cornerstone Institute, South Africa. They use Cornerstone Harvard Referencing (NOT APA).

CRITICAL RULES:
- NEVER write content for the student. No sample sentences, no example paragraphs.
- Give DIRECTION, not content. Tell them WHAT to fix and WHY, not HOW to word it.
- Be encouraging but honest.
- Reference specific parts of THEIR paper (by section or quote).
- NEVER mention APA. Cornerstone uses HARVARD referencing.
- Use the ACTUAL data provided below — do not guess at word counts, reference counts, or scores. The data is accurate.

You will receive:
1. The student's essay (may be truncated — this is fine, use the data below for accurate info)
2. VERIFIED DATA from checks that already ran (AI Risk score, similarity score, citation score, grade, word count, reference count)

Use the verified data to give precise advice. For example, if word count is 1304 and requirement is 1000-1500, say "Your word count of 1304 is within the 1000-1500 range — well done."

Return valid JSON (no markdown, no commentary):
{
  "overallMessage": "<2-3 sentences: what the paper does well, then what needs attention>",
  "critical": [
    {
      "area": "<short label>",
      "detail": "<what the issue is, using REAL data>",
      "action": "<specific action without writing content for them>"
    }
  ],
  "recommended": [
    {
      "area": "<label>",
      "detail": "<what could be improved, referencing specific sections>",
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
    "<pre-submission checklist item>"
  ]
}

Priority levels:
- **critical**: Would lose significant marks or trigger plagiarism (similarity >20%, missing sections, way over/under word count)
- **recommended**: Would improve grade by a full band
- **polish**: Minor improvements

Checklist should be 5-8 items. Only include items that are RELEVANT based on the actual data.
If all checks passed well, critical can be empty — don't invent problems.`;

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
  verifiedData?: {
    wordCount?: number;
    referenceCount?: number;
    wordCountRequirement?: string;
    turnitinThreshold?: number;
    sections?: { introduction: number; body: number; conclusion: number };
  },
): string {
  let context = `Module: ${moduleCode}\nAssessment: ${assessmentName}\n\n`;

  context += `=== VERIFIED DATA (use these exact numbers, do not guess) ===\n`;
  if (verifiedData) {
    if (verifiedData.wordCount) context += `Word count: ${verifiedData.wordCount}\n`;
    if (verifiedData.wordCountRequirement) context += `Word count requirement: ${verifiedData.wordCountRequirement}\n`;
    if (verifiedData.referenceCount !== undefined) context += `Number of references: ${verifiedData.referenceCount}\n`;
    if (verifiedData.turnitinThreshold) context += `Turnitin threshold: ${verifiedData.turnitinThreshold}%\n`;
    if (verifiedData.sections) {
      context += `Sections detected: Introduction (${verifiedData.sections.introduction}w), Body (${verifiedData.sections.body}w), Conclusion (${verifiedData.sections.conclusion}w)\n`;
    }
  }
  context += `\n`;

  if (results.aiRisk) {
    context += `AI RISK: ${results.aiRisk.overallScore}% — ${results.aiRisk.summary}\n`;
    if (results.aiRisk.topIssues?.length) context += `Issues: ${results.aiRisk.topIssues.join("; ")}\n`;
    context += `\n`;
  }
  if (results.plagiarism) {
    context += `SIMILARITY: ${results.plagiarism.overallSimilarity}% — ${results.plagiarism.summary}\n`;
    if (results.plagiarism.matches?.length) context += `Matches: ${results.plagiarism.matches.map(m => `${m.matchType}: "${m.passage.slice(0, 60)}"`).join("; ")}\n`;
    context += `\n`;
  }
  if (results.citations) {
    context += `CITATIONS: ${results.citations.score}%\n`;
    if (results.citations.issues?.length) context += `Issues: ${results.citations.issues.map(i => `${i.type}: ${i.detail}`).join("; ")}\n`;
    context += `\n`;
  }
  if (results.grading) {
    context += `GRADE: ${results.grading.saGrade}\n`;
    if (results.grading.rubricScores?.length) context += `Rubric: ${results.grading.rubricScores.map(r => `${r.category}: ${r.score}/${r.maxScore}`).join(", ")}\n`;
    context += `Feedback: ${results.grading.overallFeedback}\n\n`;
  }

  return `${context}\n=== ESSAY TEXT (may be truncated) ===\n${text}\n\nReturn ONLY valid JSON.`;
}
