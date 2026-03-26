import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { parseClaudeJSON } from "@/lib/parse-json";
import type { SourceSuggestion } from "@/types/analysis";

interface OpenAlexAuthor {
  author: { display_name: string };
}

interface OpenAlexWork {
  title: string;
  authorships: OpenAlexAuthor[];
  publication_year: number;
  primary_location?: {
    source?: { display_name: string };
  };
  cited_by_count: number;
  doi: string | null;
  open_access?: { oa_url: string | null };
  abstract_inverted_index?: Record<string, number[]>;
}

interface OpenAlexResponse {
  results: OpenAlexWork[];
}

function reconstructAbstract(
  invertedIndex: Record<string, number[]> | undefined,
): string {
  if (!invertedIndex) return "";
  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }
  words.sort((a, b) => a[1] - b[1]);
  const full = words.map((w) => w[0]).join(" ");
  return full.length > 200 ? full.slice(0, 200) + "..." : full;
}

function formatAuthors(authorships: OpenAlexAuthor[]): string {
  const names = authorships
    .slice(0, 5)
    .map((a) => a.author.display_name);
  if (authorships.length > 5) names.push("et al.");
  return names.join(", ");
}

function formatAuthorsSurname(authorships: OpenAlexAuthor[]): string {
  const parsed = authorships.map((a) => {
    const parts = a.author.display_name.split(" ");
    const surname = parts[parts.length - 1];
    const initials = parts
      .slice(0, -1)
      .map((p) => p[0]?.toUpperCase() + ".")
      .join(" ");
    return { surname, initials };
  });

  if (parsed.length === 0) return "Unknown";
  if (parsed.length === 1)
    return `${parsed[0].surname}, ${parsed[0].initials}`;
  if (parsed.length === 2)
    return `${parsed[0].surname}, ${parsed[0].initials} & ${parsed[1].surname}, ${parsed[1].initials}`;

  const first = parsed.slice(0, 5).map((p) => `${p.surname}, ${p.initials}`);
  if (parsed.length > 5) first.push("et al.");
  const last = first.pop();
  return first.join(", ") + " & " + last;
}

function formatHarvard(
  work: OpenAlexWork,
): string {
  const authors = formatAuthorsSurname(work.authorships);
  const year = work.publication_year || "n.d.";
  const title = work.title || "Untitled";
  const journal =
    work.primary_location?.source?.display_name || "";
  const doi = work.doi
    ? ` doi:${work.doi.replace("https://doi.org/", "")}`
    : "";

  if (journal) {
    return `${authors} (${year}) '${title}', ${journal}.${doi}`;
  }
  return `${authors} (${year}) '${title}'.${doi}`;
}

function formatAPA7(
  work: OpenAlexWork,
): string {
  const authors = formatAuthorsSurname(work.authorships);
  const year = work.publication_year || "n.d.";
  const title = work.title || "Untitled";
  const journal =
    work.primary_location?.source?.display_name || "";
  const doiUrl = work.doi || "";

  if (journal) {
    return `${authors} (${year}). ${title}. *${journal}*. ${doiUrl}`;
  }
  return `${authors} (${year}). ${title}. ${doiUrl}`;
}

async function extractSearchTerms(
  text: string,
  apiKey: string,
): Promise<string[]> {
  const systemPrompt = `You are an academic research assistant. Extract 3-5 key search terms or phrases from the given essay text that would be useful for finding relevant academic papers. Focus on the main concepts, theories, and topics discussed. Return a JSON object with a "terms" array of strings. Each term should be 1-4 words.`;

  const response = await callClaude(
    systemPrompt,
    `Extract academic search terms from this essay excerpt:\n\n${text}`,
    apiKey,
    "claude-haiku-4-20250514",
    1024,
  );

  const parsed = parseClaudeJSON<{ terms: string[] }>(response);
  return parsed.terms.slice(0, 5);
}

async function searchOpenAlex(
  query: string,
): Promise<OpenAlexWork[]> {
  const encoded = encodeURIComponent(query);
  const urls = [
    `https://api.openalex.org/works?search=${encoded}&filter=is_oa:true&sort=cited_by_count:desc&per_page=10&mailto=turnitout@example.com`,
    `https://api.openalex.org/works?search=${encoded}&filter=publication_year:2015-2026&sort=relevance_score:desc&per_page=10&mailto=turnitout@example.com`,
  ];

  const results: OpenAlexWork[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as OpenAlexResponse;
      if (data.results) {
        results.push(...data.results);
      }
    } catch {
      // Skip failed requests
    }
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const { text, apiKey } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 },
      );
    }

    const truncatedText =
      text.length > 1000 ? text.slice(0, 1000) : text;

    // Step 1: Extract search terms using Claude Haiku
    const searchTerms = await extractSearchTerms(
      truncatedText,
      apiKey,
    );

    // Step 2: Search OpenAlex for each term in parallel
    const searchPromises = searchTerms.map((term) =>
      searchOpenAlex(term),
    );
    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    // Step 3: Deduplicate by DOI
    const seen = new Set<string>();
    const unique: OpenAlexWork[] = [];
    for (const work of flatResults) {
      const key = work.doi || work.title;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(work);
    }

    // Step 4: Sort by citation count and take top 10
    unique.sort((a, b) => b.cited_by_count - a.cited_by_count);
    const top = unique.slice(0, 10);

    // Step 5: Format results
    const sources: SourceSuggestion[] = top.map((work, i) => ({
      title: work.title || "Untitled",
      authors: formatAuthors(work.authorships),
      year: work.publication_year || 0,
      journal:
        work.primary_location?.source?.display_name || "Unknown",
      citedBy: work.cited_by_count,
      doi: work.doi || "",
      url:
        work.open_access?.oa_url ||
        work.doi ||
        "",
      relevance: i < 5 ? "High" : "Medium",
      abstract: reconstructAbstract(
        work.abstract_inverted_index,
      ),
      formattedCitation: {
        harvard: formatHarvard(work),
        apa7: formatAPA7(work),
      },
    }));

    return NextResponse.json({ searchTerms, sources });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to suggest sources";
    console.error("Source suggestion error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
