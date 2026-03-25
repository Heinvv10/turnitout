"use client";

import { Badge } from "@/components/ui/badge";

interface WordCounterProps {
  wordCount: number;
  charCount: number;
}

export function WordCounter({ wordCount, charCount }: WordCounterProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary" className="font-mono">
        {wordCount} words
      </Badge>
      <Badge variant="secondary" className="font-mono">
        {charCount} characters
      </Badge>
    </div>
  );
}
