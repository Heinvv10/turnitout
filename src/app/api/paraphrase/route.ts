import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";

const SYSTEM_PROMPT = `You are an academic writing assistant for a BA Psychology Year 1 student at Cornerstone Institute.
Your task is to rephrase passages that have been flagged for similarity or plagiarism concerns.

Rules:
- Provide exactly 3 alternative phrasings
- Maintain the original meaning precisely
- Use an academic tone appropriate for university-level psychology writing
- Produce genuinely original rephrasing, not just synonym swaps
- Preserve any technical/psychological terminology where appropriate
- Each alternative should be meaningfully different from the others

Respond ONLY with a JSON object in this exact format:
{"alternatives": ["first rephrasing", "second rephrasing", "third rephrasing"]}`;

function buildUserPrompt(text: string, context?: string): string {
  let prompt = `Rephrase the following flagged passage into 3 original alternatives:\n\n"${text}"`;
  if (context) {
    prompt += `\n\nSurrounding context for reference:\n"${context}"`;
  }
  return prompt;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, context, apiKey } = body as {
      text?: string;
      context?: string;
      apiKey?: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and cannot be empty" },
        { status: 400 },
      );
    }

    const response = await callClaude(
      SYSTEM_PROMPT,
      buildUserPrompt(text.trim(), context?.trim()),
      apiKey,
      undefined,
      1024,
    );

    // Parse JSON from response, handling potential markdown wrapping
    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned) as { alternatives: string[] };

    if (
      !parsed.alternatives ||
      !Array.isArray(parsed.alternatives) ||
      parsed.alternatives.length === 0
    ) {
      return NextResponse.json(
        { error: "Failed to generate alternatives" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      alternatives: parsed.alternatives.slice(0, 3),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Paraphrasing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
