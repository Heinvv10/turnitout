import { describe, it, expect } from "vitest";
import { parseClaudeJSON } from "@/lib/parse-json";

interface TestData {
  name: string;
  value: number;
}

describe("parseClaudeJSON", () => {
  it("parses clean JSON", () => {
    const result = parseClaudeJSON<TestData>('{"name": "test", "value": 42}');
    expect(result.name).toBe("test");
    expect(result.value).toBe(42);
  });

  it("parses JSON wrapped in markdown fences", () => {
    const input = '```json\n{"name": "fenced", "value": 99}\n```';
    const result = parseClaudeJSON<TestData>(input);
    expect(result.name).toBe("fenced");
    expect(result.value).toBe(99);
  });

  it("parses JSON wrapped in plain markdown fences (no language tag)", () => {
    const input = '```\n{"name": "plain", "value": 1}\n```';
    const result = parseClaudeJSON<TestData>(input);
    expect(result.name).toBe("plain");
    expect(result.value).toBe(1);
  });

  it("extracts JSON from surrounding text", () => {
    const input = 'Here is the result:\n{"name": "embedded", "value": 7}\nHope this helps!';
    const result = parseClaudeJSON<TestData>(input);
    expect(result.name).toBe("embedded");
    expect(result.value).toBe(7);
  });

  it("throws when no JSON object is found", () => {
    expect(() => parseClaudeJSON("no json here")).toThrow("No JSON object found");
  });

  it("throws for completely empty input", () => {
    expect(() => parseClaudeJSON("")).toThrow("No JSON object found");
  });

  it("throws on truncated JSON with no closing brace (regex cannot match)", () => {
    // The regex requires at least one { ... } pair to extract JSON
    const input = '{"name": "truncated", "value": 10';
    expect(() => parseClaudeJSON(input)).toThrow("No JSON object found");
  });

  it("handles trailing comma before closing brace", () => {
    const input = '{"name": "test", "value": 5,}';
    const result = parseClaudeJSON<TestData>(input);
    expect(result.name).toBe("test");
    expect(result.value).toBe(5);
  });

  it("handles trailing commas", () => {
    const input = '{"name": "comma", "value": 5,}';
    const result = parseClaudeJSON<TestData>(input);
    expect(result.name).toBe("comma");
    expect(result.value).toBe(5);
  });

  it("handles nested objects", () => {
    const input = '{"outer": {"inner": "value"}}';
    const result = parseClaudeJSON<{ outer: { inner: string } }>(input);
    expect(result.outer.inner).toBe("value");
  });

  it("handles arrays inside JSON", () => {
    const input = '{"items": [1, 2, 3]}';
    const result = parseClaudeJSON<{ items: number[] }>(input);
    expect(result.items).toEqual([1, 2, 3]);
  });

  it("throws on truncated JSON with unclosed arrays and no closing brace", () => {
    const input = '{"items": [1, 2, 3';
    expect(() => parseClaudeJSON(input)).toThrow("No JSON object found");
  });

  it("handles JSON with whitespace padding", () => {
    const input = '   \n  {"name": "padded", "value": 0}  \n  ';
    const result = parseClaudeJSON<TestData>(input);
    expect(result.name).toBe("padded");
    expect(result.value).toBe(0);
  });
});
