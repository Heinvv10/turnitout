"use client";

import { useMemo, useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages, AlertCircle, Lightbulb, ChevronDown, CheckCircle } from "lucide-react";
import {
  analyzeESLPatterns,
  type ESLCategory,
  type ESLFinding,
} from "@/lib/esl-patterns";

const CATEGORY_COLORS: Record<ESLCategory, string> = {
  Articles: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  Prepositions: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Tense: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Agreement: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "Sentence Structure": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Vocabulary: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

function FindingCard({ finding }: { finding: ESLFinding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-primary/40 p-3 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-2 text-left cursor-pointer"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] ${CATEGORY_COLORS[finding.pattern.category]}`}>
              {finding.pattern.category}
            </Badge>
            <span className="text-xs font-medium text-foreground">
              {finding.pattern.name}
            </span>
          </div>
          <p className="text-xs">
            <span className="rounded bg-red-100 px-1 py-0.5 font-mono text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {finding.matchedText}
            </span>
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200
            ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 pl-6 animate-fade-in-up">
          <div className="flex items-start gap-1.5">
            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              {finding.pattern.explanation}
            </p>
          </div>
          <div className="rounded-md bg-green-50 p-2 dark:bg-green-950/30">
            <p className="text-[11px] font-medium text-green-700 dark:text-green-400">
              {finding.pattern.fix}
            </p>
          </div>
          <p className="text-[11px] italic text-muted-foreground">
            {finding.pattern.tip}
          </p>
        </div>
      )}
    </Card>
  );
}

export function ESLGrammarPanel() {
  const { currentPaper } = usePaperStore();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const result = useMemo(() => {
    if (!currentPaper?.plainText) return null;
    return analyzeESLPatterns(currentPaper.plainText);
  }, [currentPaper?.plainText]);

  function toggleCategory(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  if (!currentPaper?.plainText) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Languages className="h-12 w-12 text-primary/30" />
        <p className="text-sm text-muted-foreground">
          Upload a paper to check for common ESL patterns.
        </p>
      </div>
    );
  }

  if (!result || result.totalCount === 0) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-950/30">
        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          No common ESL patterns detected — great job!
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your writing does not show typical mother-tongue transfer errors.
        </p>
      </div>
    );
  }

  // Group findings by category
  const grouped = new Map<ESLCategory, ESLFinding[]>();
  for (const f of result.findings) {
    const cat = f.pattern.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(f);
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <Languages className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">ESL Writing Coach</p>
          <p className="text-xs text-muted-foreground">
            {result.totalCount} {result.totalCount === 1 ? "pattern" : "patterns"} found
            across {result.categoryCount}{" "}
            {result.categoryCount === 1 ? "category" : "categories"}
          </p>
        </div>
      </div>

      {/* Category groups */}
      {Array.from(grouped.entries()).map(([category, findings]) => {
        const isOpen = expandedCats.has(category);
        return (
          <div key={category}>
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center justify-between rounded-lg bg-secondary/50
                px-3 py-2 hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${CATEGORY_COLORS[category]}`}>
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {findings.length} {findings.length === 1 ? "finding" : "findings"}
                </span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-200
                ${isOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}
            >
              <div className="space-y-2">
                {findings.map((finding, i) => (
                  <FindingCard key={`${category}-${i}`} finding={finding} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
