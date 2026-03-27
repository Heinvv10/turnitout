"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePaperStore } from "@/store/paper-store";
import {
  analyzeVocabulary,
  type VocabularyResult,
} from "@/lib/vocabulary-analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookA, Copy, Check } from "lucide-react";

function getLevelColor(level: string): string {
  switch (level) {
    case "advanced":
      return "bg-green-500/15 text-green-700 dark:text-green-400";
    case "intermediate":
      return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
    default:
      return "bg-red-500/15 text-red-700 dark:text-red-400";
  }
}

function getScoreColor(score: number): string {
  if (score > 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function CopyBadge({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-primary/20
        bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary
        transition-colors hover:bg-primary/10 cursor-pointer"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 opacity-50" />
      )}
      {text}
    </button>
  );
}

export function VocabularyPanel() {
  const { currentPaper } = usePaperStore();
  const plainText = currentPaper?.plainText ?? "";

  const result: VocabularyResult | null = useMemo(() => {
    if (!plainText || plainText.trim().length < 50) return null;
    return analyzeVocabulary(plainText);
  }, [plainText]);

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <BookA className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Vocabulary Level</p>
          <p className="text-sm text-muted-foreground">
            Write at least 50 characters to see vocabulary analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Vocabulary Analysis</p>

      {/* Score + Level */}
      <Card className="p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">
          Vocabulary Score
        </p>
        <p className={`text-5xl font-bold tabular-nums ${getScoreColor(result.score)}`}>
          {result.score}
        </p>
        <Badge
          className={`mt-2 capitalize ${getLevelColor(result.level)}`}
          variant="outline"
        >
          {result.level}
        </Badge>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Total</p>
          <p className="text-lg font-semibold tabular-nums">
            {result.totalWords}
          </p>
          <p className="text-xs text-muted-foreground">words</p>
        </Card>
        <Card className="p-3 text-center shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Unique</p>
          <p className="text-lg font-semibold tabular-nums">
            {result.uniqueWords}
          </p>
          <p className="text-xs text-muted-foreground">words</p>
        </Card>
        <Card className="p-3 text-center shadow-sm">
          <p className="text-xs uppercase text-muted-foreground">Diversity</p>
          <p className="text-lg font-semibold tabular-nums">
            {(result.lexicalDiversity * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">unique/total</p>
        </Card>
      </div>

      {/* Words to upgrade */}
      {result.upgrades.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Words to Upgrade ({result.upgrades.length})
          </p>
          {result.upgrades.map((upgrade) => (
            <Card key={upgrade.word} className="p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  &ldquo;{upgrade.word}&rdquo;
                </span>
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {upgrade.count}x
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {upgrade.suggestions.map((s) => (
                  <CopyBadge key={s} text={s} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <Check className="h-4 w-4" />
            No common simple words detected — strong academic vocabulary.
          </div>
        </Card>
      )}
    </div>
  );
}
