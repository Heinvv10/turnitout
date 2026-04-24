import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  AI_RISK_SYSTEM_PROMPT,
  buildAIRiskUserPrompt,
} from "@/lib/prompts/ai-risk-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import { aiRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import type { AIRiskResult } from "@/types/analysis";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateCheck = aiRateLimiter.check(ip);
  if (!rateCheck.allowed) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } },
    );
  }

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
    const isRateLimit = message.includes("429") || message.includes("rate_limit");
    return NextResponse.json({ error: message }, { status: isRateLimit ? 429 : 500 });
  }
}
