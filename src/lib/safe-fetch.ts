/**
 * Fetch with retry logic for overloaded API endpoints.
 * Retries on 529 / "overloaded" errors with exponential backoff.
 */
export async function safeFetch(
  url: string,
  payload: Record<string, unknown>,
  options?: { delay?: number; retries?: number },
): Promise<unknown> {
  const { delay = 0, retries = 2 } = options ?? {};
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));

  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (
        data.error?.includes("overloaded") ||
        data.error?.includes("529")
      ) {
        if (i < retries) {
          await new Promise((r) => setTimeout(r, (i + 1) * 3000));
          continue;
        }
      }
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      if (
        i < retries &&
        err instanceof Error &&
        (err.message.includes("overloaded") || err.message.includes("529"))
      ) {
        await new Promise((r) => setTimeout(r, (i + 1) * 3000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed after retries");
}
