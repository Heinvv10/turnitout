/**
 * Parse JSON from Claude responses, handling markdown fences, extra text,
 * and truncated/malformed JSON.
 */
export function parseClaudeJSON<T>(text: string): T {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  // Try to find JSON object in the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in response");
  }

  let jsonStr = jsonMatch[0];

  // First try parsing as-is
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Try to fix common JSON issues
  }

  // Fix truncated JSON - close unclosed brackets/braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (const ch of jsonStr) {
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  // Close any unclosed strings
  if (inString) jsonStr += '"';

  // Remove trailing comma before closing
  jsonStr = jsonStr.replace(/,\s*$/, "");

  // Close unclosed arrays and objects
  for (let i = 0; i < openBrackets; i++) jsonStr += "]";
  for (let i = 0; i < openBraces; i++) jsonStr += "}";

  // Try again with fixes
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Last resort: try to fix trailing commas before ] or }
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(jsonStr) as T;
  }
}
