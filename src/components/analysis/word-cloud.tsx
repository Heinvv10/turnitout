"use client";

import { useState, useCallback, useMemo } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Cloud } from "lucide-react";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "have", "has",
  "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "shall", "can", "this", "that", "these", "those", "it", "its",
  "they", "their", "them", "we", "our", "he", "she", "him", "her", "my",
  "your", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as",
  "but", "or", "and", "not", "no", "if", "so", "up", "out", "about", "into",
  "over", "after", "before", "between", "under", "during", "than", "very",
  "also", "just", "then", "now", "here", "there", "when", "where", "which",
  "who", "whom", "what", "how", "all", "each", "every", "both", "few", "more",
  "most", "some", "any", "other", "etc",
]);

interface WordEntry {
  word: string;
  count: number;
}

function tokenize(text: string): WordEntry[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

function getWordColor(ratio: number): string {
  // ratio is 0..1 where 1 = highest frequency
  if (ratio > 0.7) return "text-red-500 dark:text-red-400";
  if (ratio > 0.5) return "text-orange-500 dark:text-orange-400";
  if (ratio > 0.3) return "text-yellow-600 dark:text-yellow-400";
  if (ratio > 0.15) return "text-emerald-600 dark:text-emerald-400";
  return "text-blue-500 dark:text-blue-400";
}

function getWordSize(ratio: number): string {
  // ratio is 0..1 where 1 = highest frequency
  if (ratio > 0.8) return "text-2xl";
  if (ratio > 0.6) return "text-xl";
  if (ratio > 0.4) return "text-lg";
  if (ratio > 0.25) return "text-base";
  if (ratio > 0.1) return "text-sm";
  return "text-xs";
}

export function WordCloud() {
  const { currentPaper } = usePaperStore();
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);
  const [recalcKey, setRecalcKey] = useState(0);

  const words = useMemo(() => {
    if (!currentPaper?.plainText || currentPaper.plainText.trim().length < 50) {
      return [];
    }
    return tokenize(currentPaper.plainText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPaper?.plainText, recalcKey]);

  const handleRecalculate = useCallback(() => {
    setRecalcKey((k) => k + 1);
    setSelectedWord(null);
  }, []);

  if (!currentPaper?.plainText || currentPaper.plainText.trim().length < 50) {
    return null;
  }

  if (words.length === 0) return null;

  const maxCount = words[0]?.count ?? 1;

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Word Frequency</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRecalculate}>
          <RefreshCw className="mr-1.5 h-3 w-3" />
          Recalculate
        </Button>
      </div>
      <p className="mb-3 text-[10px] text-muted-foreground">
        Top 30 most-used words (excluding common words)
      </p>

      {/* Word cloud display */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border bg-muted/30 p-4 dark:bg-muted/10">
        {words.map(({ word, count }) => {
          const ratio = count / maxCount;
          const isSelected = selectedWord?.word === word;

          return (
            <button
              key={word}
              type="button"
              onClick={() =>
                setSelectedWord(isSelected ? null : { word, count })
              }
              className={`inline-block cursor-pointer rounded px-1 py-0.5 font-medium transition-all hover:opacity-80 ${getWordSize(ratio)} ${getWordColor(ratio)} ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/10"
                  : ""
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Selected word info */}
      {selectedWord && (
        <div className="mt-2 rounded-md bg-muted/50 px-3 py-1.5 text-center text-xs dark:bg-muted/20">
          <span className="font-semibold">&ldquo;{selectedWord.word}&rdquo;</span>
          {" "}appears{" "}
          <span className="font-mono font-semibold">{selectedWord.count}</span>
          {" "}time{selectedWord.count !== 1 ? "s" : ""}
        </div>
      )}

      {/* Color legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          High
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
          Med-High
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
          Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Low
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          Rare
        </span>
      </div>
    </Card>
  );
}
