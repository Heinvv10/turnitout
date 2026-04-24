import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  PLAGIARISM_SYSTEM_PROMPT,
  buildPlagiarismUserPrompt,
} from "@/lib/prompts/plagiarism-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import { aiRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import type { PlagiarismResult } from "@/types/analysis";

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
    const isRateLimit = message.includes("429") || message.includes("rate_limit");
    return NextResponse.json({ error: message }, { status: isRateLimit ? 429 : 500 });
  }
}
