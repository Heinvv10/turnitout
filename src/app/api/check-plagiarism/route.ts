import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  PLAGIARISM_SYSTEM_PROMPT,
  buildPlagiarismUserPrompt,
} from "@/lib/prompts/plagiarism-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { PlagiarismResult } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const { text, moduleCode, apiKey } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    if (text.length > 50000) {
      return Response.json({ error: "Text too long (max 50,000 characters)" }, { status: 400 });
    }

    const response = await callClaude(
      PLAGIARISM_SYSTEM_PROMPT,
      buildPlagiarismUserPrompt(text, moduleCode || ""),
      apiKey,
    );

    const result = parseClaudeJSON<PlagiarismResult>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Plagiarism check failed";
    console.error("Plagiarism check error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
