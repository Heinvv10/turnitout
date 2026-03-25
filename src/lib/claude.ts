import Anthropic from "@anthropic-ai/sdk";

/**
 * Call Claude via the Anthropic SDK.
 * The API key is passed from the client (stored in localStorage).
 */
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  apiKey?: string,
): Promise<string> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!key || key === "your-api-key-here") {
    throw new Error(
      "No API key configured. Go to Settings (gear icon) and enter your Anthropic API key.",
    );
  }

  const client = new Anthropic({ apiKey: key });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return text;
}
