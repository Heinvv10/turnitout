import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";

export async function POST(request: Request) {
  try {
    const { text, moduleCode, apiKey } = await request.json();

    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: "Module outline text is too short" },
        { status: 400 },
      );
    }

    const systemPrompt = `You are an academic document parser. Extract the assessment details and marking rubrics from this university module outline.

Return valid JSON (no markdown, no commentary) with this structure:
{
  "moduleCode": "<module code>",
  "moduleName": "<module name>",
  "lecturer": "<lecturer name>",
  "turnitinThreshold": <number>,
  "referencing": "<referencing style>",
  "assessments": [
    {
      "name": "<assessment name>",
      "type": "<Formative or Summative>",
      "weighting": <percentage>,
      "wordCount": "<word count requirement>",
      "dueWeek": <week number>,
      "question": "<the assessment question or task>",
      "structure": ["<required section 1>"],
      "resources": ["<required resource 1>"],
      "aiPolicy": "<AI policy for this assessment>",
      "referencing": "<referencing style>"
    }
  ],
  "rubrics": {
    "<assessment name>": [
      {
        "name": "<criterion name>",
        "description": "<what this criterion measures>",
        "maxMark": <number>,
        "levels": {
          "excellent": "<75-100% descriptor>",
          "good": "<70-74% descriptor>",
          "satisfactory": "<60-69% descriptor>",
          "basic": "<50-59% descriptor>",
          "fail": "<0-49% descriptor>"
        }
      }
    ]
  },
  "topics": ["<topic 1>"],
  "learningOutcomes": ["<outcome 1>"]
}`;

    const response = await callClaude(
      systemPrompt,
      `Parse this module outline for ${moduleCode || "unknown module"}:\n\n${text}`,
      apiKey,
    );

    const result = parseClaudeJSON(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to parse outline";
    console.error("Outline parsing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
