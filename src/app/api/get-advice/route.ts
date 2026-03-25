import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  ADVICE_SYSTEM_PROMPT,
  buildAdviceUserPrompt,
} from "@/lib/prompts/advice-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";

export async function POST(request: Request) {
  try {
    const { text, moduleCode, assessmentName, results, apiKey } =
      await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    const response = await callClaude(
      ADVICE_SYSTEM_PROMPT,
      buildAdviceUserPrompt(text, moduleCode || "", assessmentName || "", results || {}),
      apiKey,
    );

    const result = parseClaudeJSON(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate advice";
    console.error("Advice error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
