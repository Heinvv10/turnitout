import Anthropic from "@anthropic-ai/sdk";

/**
 * Call Claude via the Anthropic SDK with retry logic for overloaded errors.
 */
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  apiKey?: string,
  model?: string,
  maxTokens?: number,
): Promise<string> {
  // Server-side env var takes priority (service-provided key)
  const key = process.env.ANTHROPIC_API_KEY || apiKey;

  if (!key) {
    throw new Error(
      "Service unavailable. Please contact support.",
    );
  }

  const client = new Anthropic({ apiKey: key });
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: maxTokens || 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      return text;
    } catch (err: unknown) {
      const isOverloaded =
        err instanceof Error &&
        (err.message.includes("overloaded") ||
          err.message.includes("529") ||
          err.message.includes("rate"));

      if (isOverloaded && attempt < maxRetries) {
        const delay = attempt * 3000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed after retries");
}
