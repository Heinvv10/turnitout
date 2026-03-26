import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";

const SYSTEM_PROMPT = `You are an academic writing structure advisor for university students.
Given a topic, word count, assignment type, and optionally an assessment question, suggest an essay outline.

Rules:
- Include section headings, word allocation per section, and key points to cover for each section
- Word allocations MUST sum to the requested total word count
- NEVER write actual essay content — only suggest structure and guidance
- If an assessment question is provided, tailor the outline specifically to answer it
- For reflective essays, include personal reflection prompts
- For literature reviews, structure around themes not chronology
- For case studies, include case description, analysis, and recommendations sections
- For reports, include executive summary, methodology, findings, recommendations
- Always include Introduction and Conclusion sections
- Recommend an appropriate number of academic sources based on word count

Return valid JSON only:
{
  "title": "Suggested title",
  "sections": [
    {
      "heading": "1. Introduction",
      "wordTarget": 150,
      "keyPoints": ["Define key terms", "State thesis", "Outline essay structure"],
      "tips": "Keep concise - introduce the topic and your approach"
    }
  ],
  "totalWords": 1200,
  "estimatedSections": 5,
  "referencesNeeded": "5-8 academic sources recommended"
}`;

interface OutlineRequest {
  topic: string;
  wordCount: number;
  assignmentType: string;
  moduleCode: string;
  assessmentQuestion?: string;
  apiKey: string;
}

export async function POST(request: Request) {
  try {
    const {
      topic,
      wordCount,
      assignmentType,
      moduleCode,
      assessmentQuestion,
      apiKey,
    } = (await request.json()) as OutlineRequest;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 },
      );
    }

    if (!wordCount || wordCount < 100) {
      return NextResponse.json(
        { error: "Word count must be at least 100" },
        { status: 400 },
      );
    }

    let userMessage = `Generate an essay outline for:
- Topic: ${topic}
- Word count: ${wordCount}
- Assignment type: ${assignmentType || "Essay"}
- Module: ${moduleCode || "General"}`;

    if (assessmentQuestion) {
      userMessage += `\n- Assessment question: ${assessmentQuestion}`;
    }

    userMessage += `\n\nReturn ONLY valid JSON.`;

    const response = await callClaude(
      SYSTEM_PROMPT,
      userMessage,
      apiKey,
      "claude-haiku-4-5-20251001",
      2048,
    );

    const result = parseClaudeJSON(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Outline generation failed";
    console.error("Generate outline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
