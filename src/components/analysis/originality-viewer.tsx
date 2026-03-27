"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLink, X } from "lucide-react";

interface OriginalityViewerProps {
  passage: string;
  source: string;
  sourceUrl?: string;
  similarity: number;
  matchType: string;
  suggestion: string;
  open: boolean;
  onClose: () => void;
}

const matchTypeLabels: Record<string, { label: string; color: string }> = {
  direct_copy: { label: "Uncited Copy", color: "destructive" },
  close_paraphrase: { label: "Close Paraphrase", color: "destructive" },
  patchwriting: { label: "Patchwriting", color: "secondary" },
  common_knowledge: { label: "Common Knowledge", color: "outline" },
};

function getSimilarityColor(percent: number): string {
  if (percent >= 75) return "text-red-600 dark:text-red-400";
  if (percent >= 50) return "text-orange-600 dark:text-orange-400";
  if (percent >= 25) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

function getSimilarityBg(percent: number): string {
  if (percent >= 75) return "bg-red-500";
  if (percent >= 50) return "bg-orange-500";
  if (percent >= 25) return "bg-yellow-500";
  return "bg-green-500";
}

function HighlightedPassage({ text }: { text: string }) {
  // Highlight words that are likely matched (longer words are more significant)
  const words = text.split(/(\s+)/);
  return (
    <p className="text-sm leading-relaxed">
      {words.map((word, i) => {
        const isWord = /\w{4,}/.test(word);
        if (isWord) {
          return (
            <mark
              key={i}
              className="rounded-sm bg-yellow-200 px-0.5 dark:bg-yellow-800/60 dark:text-yellow-100"
            >
              {word}
            </mark>
          );
        }
        return <span key={i}>{word}</span>;
      })}
    </p>
  );
}

export function OriginalityViewer({
  passage,
  source,
  sourceUrl,
  similarity,
  matchType,
  suggestion,
  open,
  onClose,
}: OriginalityViewerProps) {
  const typeInfo = matchTypeLabels[matchType] || {
    label: matchType,
    color: "outline",
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Originality Detail</DialogTitle>
            <Badge
              variant={
                typeInfo.color as
                  | "destructive"
                  | "secondary"
                  | "outline"
                  | "default"
              }
            >
              {typeInfo.label}
            </Badge>
          </div>
          <DialogDescription>
            Side-by-side comparison of flagged passage and source information
          </DialogDescription>
        </DialogHeader>

        {/* Similarity indicator */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Similarity</span>
              <span
                className={`font-mono font-bold ${getSimilarityColor(similarity)}`}
              >
                {similarity}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${getSimilarityBg(similarity)}`}
                style={{ width: `${Math.min(similarity, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Split view */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left: Student passage */}
          <div className="rounded-lg border border-yellow-300 bg-yellow-50/50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-400">
              Your Text
            </p>
            <HighlightedPassage text={passage} />
          </div>

          {/* Right: Source info */}
          <div className="rounded-lg border border-blue-300 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
              Likely Source
            </p>
            <p className="text-sm font-medium">{source}</p>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ExternalLink className="h-3 w-3" />
                View source
              </a>
            )}
            {!sourceUrl && (
              <p className="mt-1 text-xs text-muted-foreground">
                No direct URL available for this source type
              </p>
            )}
          </div>
        </div>

        {/* Suggestion */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How to Fix
          </p>
          <p className="text-sm">{suggestion}</p>
        </div>

        {/* Footer close */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="mr-1 h-3 w-3" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
