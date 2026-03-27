import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import {
  buildGradingSystemPrompt,
  buildGradingUserPrompt,
} from "@/lib/prompts/grading-prompt";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { GradingResult } from "@/types/analysis";

export async function POST(request: Request) {
  try {
    const { text, moduleCode, assignmentTitle, assessmentName, uploadedOutline, apiKey, gradingScale, referencingStyle } =
      await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    if (text.length > 50000) {
      return Response.json({ error: "Text too long (max 50,000 characters)" }, { status: 400 });
    }

    const systemPrompt = buildGradingSystemPrompt(
      moduleCode || "",
      assessmentName,
      uploadedOutline || null,
      gradingScale,
      referencingStyle,
    );

    const response = await callClaude(
      systemPrompt,
      buildGradingUserPrompt(
        text,
        moduleCode || "",
        assignmentTitle || "Untitled",
      ),
      apiKey,
    );

    const result = parseClaudeJSON<GradingResult>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Grading failed";
    console.error("Grading error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
