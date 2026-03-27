import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { aiRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";

const COACH_SYSTEM_PROMPT = `You are a Socratic academic writing coach. Your role is to help students improve their essays by asking thought-provoking questions — NEVER by writing content for them.

Rules:
- Ask ONE focused question at a time
- Reference specific parts of their essay when asking questions
- If they ask you to write something, redirect: "I can't write that for you, but let me ask — what point are you trying to make in that section?"
- Use the analysis scores to guide your questions (e.g. if citations score is low, ask about their sources)
- Be warm, encouraging, and supportive — this is a first-year student
- Keep responses under 3 sentences
- If they share a fix they made, praise the improvement and suggest the next area to work on

You have access to:
- Their essay text (may be truncated)
- Their module code and analysis scores
- The conversation history`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
    const { message, essayContext, moduleCode, analysisScores, chatHistory, apiKey } =
      await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Build the user prompt with full context
    const contextParts: string[] = [];

    if (moduleCode) {
      contextParts.push(`Module: ${moduleCode}`);
    }

    if (analysisScores) {
      contextParts.push(`Analysis scores: ${JSON.stringify(analysisScores)}`);
    }

    if (essayContext) {
      const truncated =
        essayContext.length > 3000
          ? essayContext.slice(0, 3000) + "\n[...truncated]"
          : essayContext;
      contextParts.push(`Essay text:\n${truncated}`);
    }

    // Build conversation as a single user message with history context
    const historyLines: string[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory as ChatMessage[]) {
        const role = msg.role === "user" ? "Student" : "Coach";
        historyLines.push(`${role}: ${msg.content}`);
      }
    }

    const userPrompt = [
      contextParts.length > 0
        ? `Context:\n${contextParts.join("\n\n")}`
        : "",
      historyLines.length > 0
        ? `Conversation so far:\n${historyLines.join("\n")}`
        : "",
      `Student's new message: ${message}`,
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const response = await callClaude(
      COACH_SYSTEM_PROMPT,
      userPrompt,
      apiKey,
      "claude-sonnet-4-20250514",
      1024,
    );

    return new Response(response, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Coach unavailable";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
