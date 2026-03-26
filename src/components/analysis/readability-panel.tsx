"use client";

import { useState, useEffect, useCallback } from "react";
import { usePaperStore } from "@/store/paper-store";
import { calculateReadability, type ReadabilityResult } from "@/lib/readability";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

function getEaseColor(ease: number): string {
  if (ease >= 30 && ease <= 60) return "bg-green-500";
  if (ease >= 20 && ease <= 70) return "bg-yellow-500";
  return "bg-red-500";
}

function getEaseLabel(ease: number): string {
  if (ease >= 30 && ease <= 60) return "Academic range";
  if (ease < 30) return "Very difficult";
  return "Too easy for academic writing";
}

function getLevelBadgeVariant(
  level: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (level === "First Year" || level === "Undergraduate") return "default";
  if (level === "High School") return "secondary";
  return "destructive";
}

export function ReadabilityPanel() {
  const { currentPaper } = usePaperStore();
  const [result, setResult] = useState<ReadabilityResult | null>(null);

  const calculate = useCallback(() => {
    if (!currentPaper?.plainText || currentPaper.plainText.trim().length < 50) {
      setResult(null);
      return;
    }
    setResult(calculateReadability(currentPaper.plainText));
  }, [currentPaper?.plainText]);

  // Auto-calculate on mount and when text changes
  useEffect(() => {
    calculate();
  }, [calculate]);

  if (!currentPaper?.plainText || currentPaper.plainText.trim().length < 50) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium">Readability Analysis</p>
          <p className="text-sm text-muted-foreground">
            Write at least 50 characters to see readability metrics.
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      {/* Header with recalculate */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Readability Scores</p>
        <Button variant="outline" size="sm" onClick={calculate}>
          <RefreshCw className="mr-1.5 h-3 w-3" />
          Recalculate
        </Button>
      </div>

      {/* Grade Level - Big number */}
      <Card className="p-4 text-center">
        <p className="text-xs uppercase text-muted-foreground">
          Flesch-Kincaid Grade Level
        </p>
        <p className="text-4xl font-bold tabular-nums">
          {result.fleschKincaid}
        </p>
        <Badge
          variant={getLevelBadgeVariant(result.academicLevel)}
          className="mt-2"
        >
          {result.academicLevel}
        </Badge>
      </Card>

      {/* Flesch Reading Ease gauge */}
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase text-muted-foreground">
            Flesch Reading Ease
          </p>
          <span className="text-sm font-mono font-medium">
            {result.fleschEase}/100
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${getEaseColor(result.fleschEase)}`}
            style={{ width: `${result.fleschEase}%` }}
          />
          {/* Academic sweet spot markers */}
          <div
            className="absolute top-0 h-full w-px bg-foreground/30"
            style={{ left: "30%" }}
          />
          <div
            className="absolute top-0 h-full w-px bg-foreground/30"
            style={{ left: "60%" }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {getEaseLabel(result.fleschEase)} -- Academic sweet spot: 30-60
        </p>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">
            Avg Sentence Length
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {result.avgSentenceLength}
          </p>
          <p className="text-[10px] text-muted-foreground">words</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">
            Avg Syllables/Word
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {result.avgSyllablesPerWord}
          </p>
          <p className="text-[10px] text-muted-foreground">syllables</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">
            Paragraphs
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {result.paragraphCount}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">
            Avg Paragraph Length
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {result.avgParagraphLength}
          </p>
          <p className="text-[10px] text-muted-foreground">words</p>
        </Card>
      </div>

      {/* Long sentences warning */}
      <Card className="p-3">
        <div className="flex items-center gap-2">
          {result.longSentences > 3 ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
          )}
          <div>
            <p className="text-sm font-medium">
              Long Sentences (&gt;35 words):{" "}
              <span className="font-mono">{result.longSentences}</span>
            </p>
            {result.longSentences > 3 && (
              <p className="text-xs text-muted-foreground">
                Consider breaking some long sentences into shorter ones for
                clarity.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Passive voice */}
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-sm font-medium">Passive Voice</p>
          </div>
          <span className="text-sm font-mono font-medium">
            {result.passiveVoice}%
          </span>
        </div>
        <Progress value={result.passiveVoice} className="h-1.5" />
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {result.passiveVoice >= 10 && result.passiveVoice <= 20
            ? "Normal range for academic writing (10-20%)"
            : result.passiveVoice < 10
              ? "Low passive voice -- consider if more objective phrasing is needed"
              : "High passive voice -- consider using more active constructions"}
        </p>
      </Card>
    </div>
  );
}
