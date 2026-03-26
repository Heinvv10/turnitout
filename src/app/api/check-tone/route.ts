import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";

interface ToneIssue {
  type: "informal" | "contraction" | "slang" | "first_person" | "hedging" | "emotional" | "bias";
  text: string;
  suggestion: string;
}

interface ToneResult {
  formalityScore: number;
  trafficLight: "green" | "yellow" | "red";
  issues: ToneIssue[];
  summary: string;
}

function buildToneSystemPrompt(referencingStyle: string): string {
  return `You are an academic writing tone and formality checker for university students (primarily first-year undergraduate level).

Your task is to analyse the given essay text and check for issues with academic tone and formality. The referencing style is ${referencingStyle}.

Check for the following issues:

1. **Informal language**: Contractions (don't, can't, won't), slang, colloquialisms, overly casual phrasing
2. **First-person overuse**: Excessive use of "I", "me", "my" (some is acceptable in reflective writing, but flag overuse in analytical/argumentative essays)
3. **Hedging language**: Too much "might", "could", "perhaps", "possibly", "maybe" -- weakens academic arguments
4. **Weak assertions**: "I think", "I feel", "In my opinion" without evidence backing
5. **Emotional language**: Emotional or sensational language in analytical writing (e.g. "amazing", "terrible", "shocking")
6. **Gendered or biased language**: Non-inclusive pronouns, stereotyping language
7. **Register inconsistency**: Mixing formal and informal registers within the same piece

Return your analysis as JSON with this exact structure:
{
  "formalityScore": <number 0-100, where 100 is very formal>,
  "trafficLight": "<green if score >= 75, yellow if 50-74, red if < 50>",
  "issues": [
    {
      "type": "<informal|contraction|slang|first_person|hedging|emotional|bias>",
      "text": "<the exact flagged text from the essay>",
      "suggestion": "<what to do instead>"
    }
  ],
  "summary": "<1-2 sentence summary of the overall tone assessment>"
}

Guidelines:
- Be specific: quote the exact text that is problematic
- Keep suggestions constructive and educational
- Limit to the most impactful 15 issues maximum
- Score should reflect the overall tone quality, not just count issues
- Academic writing should be formal but not stilted
- Some first-person is acceptable in reflective essays
- Return ONLY the JSON object, no other text`;
}

export async function POST(request: Request) {
  try {
    const { text, apiKey, referencingStyle } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    const systemPrompt = buildToneSystemPrompt(referencingStyle || "harvard");

    const response = await callClaude(
      systemPrompt,
      `Analyse the following essay for academic tone and formality:\n\n${text}`,
      apiKey,
    );

    const result = parseClaudeJSON<ToneResult>(response);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Tone check failed";
    console.error("Tone check error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
