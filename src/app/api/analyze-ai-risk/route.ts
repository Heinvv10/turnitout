import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  AI_RISK_SYSTEM_PROMPT,
  buildAIRiskUserPrompt,
} from "@/lib/prompts/ai-risk-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { AIRiskResult } from "@/types/analysis";

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
      AI_RISK_SYSTEM_PROMPT,
      buildAIRiskUserPrompt(text, moduleCode || ""),
      apiKey,
    );

    const result = parseClaudeJSON<AIRiskResult>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("AI risk analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
