"use client";

import { useState, useCallback } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Quote,
  Copy,
  Check,
  Loader2,
  Link,
  BookOpen,
  Hash,
  Trash2,
} from "lucide-react";

interface CitationResult {
  citation: string;
  inText: string;
  type: "url" | "doi" | "title";
  metadata: { author: string; year: string; title: string; publisher?: string; url?: string };
}

interface HistoryEntry {
  id: string;
  result: CitationResult;
  style: string;
  input: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Link; variant: "default" | "secondary" | "outline" }> = {
  url: { label: "URL", icon: Link, variant: "default" },
  doi: { label: "DOI", icon: Hash, variant: "secondary" },
  title: { label: "Title", icon: BookOpen, variant: "outline" },
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 gap-1 text-xs shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}

function ResultCard({
  entry,
  onRemove,
}: {
  entry: HistoryEntry;
  onRemove: (id: string) => void;
}) {
  const { result, style, input } = entry;
  const config = TYPE_CONFIG[result.type];
  const TypeIcon = config.icon;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground truncate flex-1">
          {input}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={config.variant} className="text-xs gap-1">
            <TypeIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          <Badge variant="secondary" className="text-xs uppercase">
            {style}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onRemove(entry.id)}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Full reference */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          Reference List Entry
        </p>
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm leading-relaxed">
            {result.citation}
          </p>
          <CopyButton text={result.citation} label="Copy" />
        </div>
      </div>

      {/* In-text citation */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          In-text Citation
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-muted px-2 py-1 text-sm">
            {result.inText}
          </code>
          <CopyButton text={result.inText} label="Copy" />
        </div>
      </div>
    </Card>
  );
}

export function CitationGenerator() {
  const { apiKey, referencingStyle } = useSettingsStore();

  const [input, setInput] = useState("");
  const [style, setStyle] = useState<"harvard" | "apa">(
    referencingStyle === "apa" || referencingStyle === "apa7"
      ? "apa"
      : "harvard",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const generate = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length < 3) {
      setError("Enter a URL, DOI, or title (at least 3 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-citation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, style, apiKey }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        result: data as CitationResult,
        style,
        input: trimmed,
      };

      setHistory((prev) => [entry, ...prev].slice(0, 5));
      setInput("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate citation";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input, style, apiKey]);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      generate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Quote className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Cite Source</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Paste a URL, DOI, or book/article title to generate a formatted
        reference.
      </p>

      {/* Input area */}
      <div className="space-y-3">
        <Input
          placeholder="Paste URL, DOI, or book title..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <div className="flex items-center gap-2">
          {/* Style toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setStyle("harvard")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                style === "harvard"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              Harvard
            </button>
            <button
              type="button"
              onClick={() => setStyle("apa")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                style === "apa"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              APA
            </button>
          </div>

          <Button
            onClick={generate}
            disabled={loading || !input.trim()}
            className="ml-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Quote className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>

      {/* Results */}
      {history.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Recent citations ({history.length}/5)
            </p>
            {history.map((entry) => (
              <ResultCard
                key={entry.id}
                entry={entry}
                onRemove={removeEntry}
              />
            ))}
          </div>
        </>
      )}

      {history.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Quote className="h-12 w-12 text-primary/30" />
          <div>
            <p className="text-sm font-medium">No citations yet</p>
            <p className="text-xs text-muted-foreground">
              Enter a source above to generate a formatted reference.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
