import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  buildCitationSystemPrompt,
  buildCitationUserPrompt,
} from "@/lib/prompts/citation-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { CitationResult } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const { text, apiKey, referencingStyle } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    const response = await callClaude(
      buildCitationSystemPrompt(referencingStyle || "harvard"),
      buildCitationUserPrompt(text, referencingStyle),
      apiKey,
      "claude-haiku-4-5-20251001",
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
