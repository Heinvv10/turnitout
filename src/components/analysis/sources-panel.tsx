"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookMarked,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import type { SourceSuggestion } from "@/types/analysis";

function SourceCard({
  source,
  referencingStyle,
}: {
  source: SourceSuggestion;
  referencingStyle: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const citation =
    referencingStyle === "apa7" || referencingStyle === "apa"
      ? source.formattedCitation.apa7
      : source.formattedCitation.harvard;

  const copyCitation = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">
          {source.title}
        </p>
        <Badge
          variant={
            source.relevance === "High"
              ? "default"
              : "secondary"
          }
          className="shrink-0"
        >
          {source.relevance}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        {source.authors} ({source.year})
      </p>

      {source.journal && source.journal !== "Unknown" && (
        <p className="text-xs italic text-muted-foreground">
          {source.journal}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          Cited by {source.citedBy}
        </Badge>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Open Access
          </a>
        )}
        {source.doi && (
          <a
            href={
              source.doi.startsWith("http")
                ? source.doi
                : `https://doi.org/${source.doi}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            DOI
          </a>
        )}
      </div>

      {source.abstract && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Abstract
          </button>
          {expanded && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {source.abstract}
            </p>
          )}
        </div>
      )}

      <Separator />

      <div className="flex items-center gap-2">
        <p className="flex-1 text-xs text-muted-foreground leading-snug line-clamp-2">
          {citation}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs shrink-0"
          onClick={copyCitation}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy Citation"}
        </Button>
      </div>
    </Card>
  );
}

export function SourcesPanel() {
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const analysisResults = usePaperStore((s) => s.analysisResults);
  const setSourcesResult = usePaperStore((s) => s.setSourcesResult);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const referencingStyle = useSettingsStore((s) => s.referencingStyle);

  const sources = analysisResults.sources;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findSources = async () => {
    if (!currentPaper?.plainText) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/suggest-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText.slice(0, 1000),
          moduleCode: "",
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSourcesResult(data);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to find sources";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Empty state - no text
  if (!currentPaper?.plainText && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <BookMarked className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Find Academic Sources</p>
          <p className="text-sm text-muted-foreground">
            Paste your essay first, then discover relevant
            peer-reviewed papers.
          </p>
        </div>
        <Button disabled>Paste essay first</Button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Searching academic databases...
        </p>
      </div>
    );
  }

  // Ready state - has text but no results yet
  if (!sources) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <BookMarked className="h-12 w-12 text-primary/60" />
        <div>
          <p className="text-lg font-medium">Find Academic Sources</p>
          <p className="text-sm text-muted-foreground">
            Discover relevant peer-reviewed papers based on your
            essay topic.
          </p>
        </div>
        <Button onClick={findSources}>
          <BookMarked className="mr-2 h-4 w-4" />
          Find Sources
        </Button>
        {error && (
          <p className="text-xs text-red-500 max-w-xs">{error}</p>
        )}
      </div>
    );
  }

  // Results state
  return (
    <div className="space-y-4">
      {/* Search terms */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground mr-1">
          Search terms:
        </span>
        {sources.searchTerms.map((term) => (
          <Badge key={term} variant="secondary" className="text-xs">
            {term}
          </Badge>
        ))}
      </div>

      <Separator />

      {/* Source cards */}
      {sources.sources.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No sources found. Try editing your essay or searching
          again.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {sources.sources.length} source
            {sources.sources.length !== 1 ? "s" : ""} found
          </p>
          {sources.sources.map((source, i) => (
            <SourceCard
              key={source.doi || i}
              source={source}
              referencingStyle={referencingStyle}
            />
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={findSources}
        className="w-full"
      >
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Search Again
      </Button>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
