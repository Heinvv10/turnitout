import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";

interface FormattedCitation {
  original: string;
  corrected: string;
  changes: string[];
}

interface FormatCitationResponse {
  formatted: FormattedCitation[];
  allCorrected: string;
  issueCount: number;
  summary: string;
}

const SYSTEM_PROMPT = `You are a citation formatting expert for academic referencing.

Given raw/messy citations, reformat them to the specified referencing style.
Fix common errors: missing italics markers, wrong punctuation, incorrect order of elements, missing periods, incorrect capitalisation.

CRITICAL RULES:
- NEVER change the actual source information (author names, year, title, publisher) - only fix formatting
- Use *asterisks* to mark text that should be italicised (e.g. book titles, journal names)
- Fix spacing, punctuation order, and element ordering per the style guide
- Each citation should be on its own line in the corrected output

Return valid JSON with this exact structure:
{
  "formatted": [
    {
      "original": "the original citation text as given",
      "corrected": "the properly formatted citation",
      "changes": ["list of specific changes made"]
    }
  ],
  "allCorrected": "all corrected citations joined with newlines",
  "issueCount": 0,
  "summary": "brief summary of fixes"
}`;

export async function POST(request: Request) {
  try {
    const { citations, referencingStyle, apiKey } = await request.json();

    if (!citations || citations.trim().length < 10) {
      return NextResponse.json(
        { error: "Citations text must be at least 10 characters" },
        { status: 400 },
      );
    }

    const style = referencingStyle || "harvard";

    const userMessage = `Referencing style: ${style.toUpperCase()}

Please reformat these citations to correct ${style} format. Fix formatting only - do not change any source information.

Citations to format:
${citations}`;

    const response = await callClaude(
      SYSTEM_PROMPT,
      userMessage,
      apiKey,
      "claude-haiku-4-20250414",
      4096,
    );

    const result = parseClaudeJSON<FormatCitationResponse>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Citation formatting failed";
    console.error("Citation format error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
