import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";

const SYSTEM_PROMPT = `You are an academic essay structure analyzer. Given a block of essay text (which may have NO headings at all), identify and split it into sections.

Rules:
- The INTRODUCTION is the opening paragraph(s) that set the context, define key terms, and state what the essay will discuss. Usually 1-2 paragraphs.
- The BODY is the main content — arguments, evidence, analysis, discussion, personal reflection. This is the largest section.
- The CONCLUSION is the closing paragraph(s) that summarize the essay's findings and provide a final reflection. Usually 1-2 paragraphs.
- The REFERENCES are the bibliography/reference list entries. These look like: Author, I. (Year). Title. Publisher.
- Do NOT change any text. Return the EXACT original text, just split into sections.
- If you cannot determine a section, leave it as an empty string.

Return valid JSON only:
{
  "introduction": "<exact text of introduction paragraph(s)>",
  "body": "<exact text of body paragraph(s)>",
  "conclusion": "<exact text of conclusion paragraph(s)>",
  "references": "<exact text of reference entries>"
}`;

export async function POST(request: Request) {
  try {
    const { text, apiKey } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    const response = await callClaude(
      SYSTEM_PROMPT,
      `Split this essay into sections. Return the EXACT original text in each section, do not rewrite anything.\n\n---\n${text}\n---\n\nReturn ONLY valid JSON.`,
      apiKey,
      "claude-haiku-4-5-20251001",
    );

    const result = parseClaudeJSON(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Section split failed";
    console.error("Split sections error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
