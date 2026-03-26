import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { GrammarResult } from "@/types/analysis";

const LANGUAGE_LABELS: Record<string, string> = {
  "en-ZA": "South African English",
  "en-GB": "British English",
  "en-US": "American English",
  "en-AU": "Australian English",
};

function buildSystemPrompt(language: string): string {
  const langLabel = LANGUAGE_LABELS[language] || LANGUAGE_LABELS["en-ZA"];

  return `You are an expert academic writing proofreader specialising in ${langLabel}.

Your task is to check the given academic essay for grammar, spelling, punctuation, word choice, and sentence structure issues.

IMPORTANT RULES:
- Use ${langLabel} spelling conventions (e.g. "analyse" not "analyze" for SA/UK English, "colour" not "color")
- Flag genuine errors, NOT style preferences
- Be educational: explain WHY something is wrong so the student learns
- For each issue, provide the exact problematic text (max 50 characters), a correction, and a clear explanation
- Indicate the approximate location (e.g. "paragraph 1", "paragraph 3")
- Categorise severity:
  - "error": clear grammatical/spelling mistakes
  - "warning": likely incorrect but context-dependent
  - "suggestion": improvement that would strengthen the writing

Respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100, where 100 is perfect>,
  "trafficLight": "<green if score >= 90, yellow if 70-89, red if < 70>",
  "errorCount": <total number of errors and warnings>,
  "issues": [
    {
      "type": "<grammar|spelling|punctuation|word_choice|sentence_structure>",
      "severity": "<error|warning|suggestion>",
      "text": "<the problematic text, max 50 chars>",
      "correction": "<suggested fix>",
      "explanation": "<why it is wrong - be educational>",
      "location": "<e.g. paragraph 2>"
    }
  ],
  "summary": "<1-2 sentence overview of the writing quality>"
}`;
}

function buildUserPrompt(text: string): string {
  return `Please check the following academic essay for grammar, spelling, and punctuation issues:\n\n${text}`;
}

export async function POST(request: Request) {
  try {
    const { text, apiKey, language } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    const response = await callClaude(
      buildSystemPrompt(language || "en-ZA"),
      buildUserPrompt(text),
      apiKey,
    );

    const result = parseClaudeJSON<GrammarResult>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Grammar check failed";
    console.error("Grammar check error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
