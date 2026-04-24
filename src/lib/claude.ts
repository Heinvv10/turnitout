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
        model: model || "claude-haiku-4-5-20251001",
        max_tokens: maxTokens || 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      return text;
    } catch (err: unknown) {
      const isRetryable =
        err instanceof Error &&
        (err.message.includes("overloaded") ||
          err.message.includes("529") ||
          err.message.includes("rate") ||
          err.message.includes("rate_limit") ||
          err.message.includes("429"));

      if (isRetryable && attempt < maxRetries) {
        const delay = attempt * 5000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed after retries");
}
