import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";

type InputType = "url" | "doi" | "title";
type CitationStyle = "harvard" | "apa";

interface CitationMetadata {
  author: string;
  year: string;
  title: string;
  publisher?: string;
  url?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
}

interface GenerateCitationResponse {
  citation: string;
  inText: string;
  type: InputType;
  metadata: CitationMetadata;
}

function detectInputType(input: string): InputType {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return "url";
  if (/^10\.\d{4,}/.test(trimmed)) return "doi";
  return "title";
}

async function fetchUrlMetadata(
  url: string,
): Promise<Record<string, string>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TurnItOut/1.0; +https://turnitout.app)",
      },
    });

    if (!res.ok) return {};

    const html = await res.text();
    const meta: Record<string, string> = {};

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) meta.title = titleMatch[1].trim();

    const ogTags = [
      "og:title",
      "og:description",
      "og:site_name",
      "og:url",
      "article:author",
      "article:published_time",
      "citation_author",
      "citation_title",
      "citation_date",
      "citation_journal_title",
      "citation_doi",
      "citation_publisher",
    ];

    for (const tag of ogTags) {
      const pattern = new RegExp(
        `<meta[^>]+(?:property|name)=["']${tag}["'][^>]+content=["']([^"']+)["']`,
        "i",
      );
      const match = html.match(pattern);
      if (match) meta[tag] = match[1].trim();

      // Also try reversed attribute order
      const pattern2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${tag}["']`,
        "i",
      );
      const match2 = html.match(pattern2);
      if (match2 && !meta[tag]) meta[tag] = match2[1].trim();
    }

    meta.url = url;
    return meta;
  } catch {
    return { url };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDoiMetadata(
  doi: string,
): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "TurnItOut/1.0 (mailto:support@turnitout.app)" },
      },
    );

    if (!res.ok) return {};

    const data = await res.json();
    return data.message || {};
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

function buildClaudePrompt(
  input: string,
  type: InputType,
  style: CitationStyle,
  context: string,
): string {
  return `You are a citation formatting expert. Generate a ${style.toUpperCase()} reference from the provided source information.

Input type: ${type}
Input: ${input}
${context ? `\nExtracted metadata:\n${context}` : ""}

Return valid JSON with this exact structure:
{
  "citation": "the full formatted reference list entry",
  "inText": "the in-text citation format e.g. (Author, 2024)",
  "metadata": {
    "author": "author name(s)",
    "year": "publication year",
    "title": "title of work",
    "publisher": "publisher if applicable",
    "url": "url if applicable",
    "journal": "journal name if applicable",
    "volume": "volume if applicable",
    "issue": "issue if applicable",
    "pages": "pages if applicable",
    "doi": "doi if applicable"
  }
}

RULES:
- Use correct ${style === "harvard" ? "Harvard" : "APA 7th edition"} formatting
- Mark text that should be italicised with *asterisks*
- If information is missing, make reasonable inferences or omit optional fields
- For Harvard: Author, A.B. Year. *Title*. Place: Publisher.
- For APA: Author, A. B. (Year). *Title*. Publisher. https://doi.org/xxx
- The inText should be in the format used in-text, e.g. (Smith, 2024) or (Smith & Jones, 2024)
- Return ONLY the JSON, no other text`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, style, apiKey } = body;

    if (!input || typeof input !== "string" || input.trim().length < 3) {
      return NextResponse.json(
        { error: "Input must be at least 3 characters" },
        { status: 400 },
      );
    }

    const citationStyle: CitationStyle =
      style === "apa" || style === "apa7" ? "apa" : "harvard";
    const type = detectInputType(input.trim());
    let context = "";

    if (type === "url") {
      const meta = await fetchUrlMetadata(input.trim());
      context = JSON.stringify(meta, null, 2);
    } else if (type === "doi") {
      const meta = await fetchDoiMetadata(input.trim());
      if (meta.title) {
        const authors = Array.isArray(meta.author)
          ? (meta.author as Array<{ given?: string; family?: string }>)
              .map((a) => `${a.family || ""}, ${a.given || ""}`)
              .join("; ")
          : "Unknown";

        const published = meta["published-print"] || meta["published-online"];
        const dateParts =
          published &&
          typeof published === "object" &&
          "date-parts" in (published as Record<string, unknown>)
            ? (
                (published as Record<string, unknown>)[
                  "date-parts"
                ] as number[][]
              )?.[0]
            : null;
        const year = dateParts ? String(dateParts[0]) : "n.d.";

        context = JSON.stringify(
          {
            authors,
            year,
            title: Array.isArray(meta.title) ? meta.title[0] : meta.title,
            journal: meta["container-title"],
            volume: meta.volume,
            issue: meta.issue,
            pages: meta.page,
            doi: input.trim(),
            publisher: meta.publisher,
          },
          null,
          2,
        );
      }
    }

    const prompt = buildClaudePrompt(input.trim(), type, citationStyle, context);

    const response = await callClaude(
      "You are a citation formatting assistant. Return only valid JSON.",
      prompt,
      apiKey,
      "claude-haiku-4-20250414",
      2048,
    );

    const result = parseClaudeJSON<{
      citation: string;
      inText: string;
      metadata: CitationMetadata;
    }>(response);

    const output: GenerateCitationResponse = {
      citation: result.citation,
      inText: result.inText,
      type,
      metadata: result.metadata,
    };

    return NextResponse.json(output);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Citation generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
