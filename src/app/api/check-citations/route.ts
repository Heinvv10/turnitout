import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  CITATION_SYSTEM_PROMPT,
  buildCitationUserPrompt,
} from "@/lib/prompts/citation-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { CitationResult } from "@/types/analysis";

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
      CITATION_SYSTEM_PROMPT,
      buildCitationUserPrompt(text),
      apiKey,
    );

    const result = parseClaudeJSON<CitationResult>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Citation check failed";
    console.error("Citation check error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
