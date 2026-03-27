import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";
import { aiRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

interface AcademizeChange {
  from: string;
  to: string;
  reason: string;
}

interface AcademizeResult {
  original: string;
  academized: string;
  changes: AcademizeChange[];
}

const SYSTEM_PROMPT = `You are an academic writing tone converter for university students (primarily first-year undergraduate, ESL learners).

Your task: convert the given text from informal/conversational register into proper academic register while preserving the original meaning exactly.

Rules:
1. Replace contractions with full forms (don't → do not, can't → cannot)
2. Replace slang, colloquialisms, and casual phrasing with formal equivalents
3. Replace first-person statements ("I think") with impersonal academic constructions ("It can be argued that")
4. Replace emotional/sensational language with measured academic language
5. Replace vague hedging ("kind of", "sort of") with precise qualifiers
6. Improve sentence structure for academic clarity where needed
7. Preserve the original argument, evidence, and meaning — do NOT add new claims
8. Keep discipline-specific terminology intact
9. Do NOT change citations, references, or direct quotes

Return your result as JSON with this exact structure:
{
  "original": "<the original text, unchanged>",
  "academized": "<the fully converted academic version>",
  "changes": [
    {
      "from": "<exact phrase from original>",
      "to": "<replacement phrase in academic version>",
      "reason": "<brief educational explanation of why this change improves academic register>"
    }
  ]
}

Guidelines:
- List all significant changes (up to 20 maximum)
- Keep reasons concise (1 sentence) and educational
- The academized text should read naturally, not be stilted
- Return ONLY the JSON object, no other text`;

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
    const { text, apiKey } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    if (text.trim().length < 20) {
      return NextResponse.json(
        { error: "Text must be at least 20 characters" },
        { status: 400 },
      );
    }

    if (text.length > 50000) {
      return Response.json({ error: "Text too long (max 50,000 characters)" }, { status: 400 });
    }

    if (text.length > 15000) {
      return NextResponse.json(
        { error: "Text is too long. Please select a shorter section (max ~3000 words)." },
        { status: 400 },
      );
    }

    const response = await callClaude(
      SYSTEM_PROMPT,
      `Convert the following text to academic register:\n\n${text}`,
      apiKey,
      "claude-haiku-4-5-20251001",
    );

    const result = parseClaudeJSON<AcademizeResult>(response);

    // Ensure the original field matches what was sent
    result.original = text;

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Academize conversion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
