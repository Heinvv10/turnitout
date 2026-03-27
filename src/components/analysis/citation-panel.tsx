"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { FixGuide, getFixGuide } from "./fix-guide";
import { CitationCrossCheckPanel } from "./citation-cross-check-panel";

interface FormattedCitation {
  original: string;
  corrected: string;
  changes: string[];
}

interface FormatResult {
  formatted: FormattedCitation[];
  allCorrected: string;
  issueCount: number;
  summary: string;
}

export function CitationPanel() {
  const { currentPaper, analysisResults, isAnalyzing } = usePaperStore(
    useShallow((s) => ({
      currentPaper: s.currentPaper,
      analysisResults: s.analysisResults,
      isAnalyzing: s.isAnalyzing,
    })),
  );
  const setAnalyzing = usePaperStore((s) => s.setAnalyzing);
  const setCitationResult = usePaperStore((s) => s.setCitationResult);
  const updateReferences = usePaperStore((s) => s.updateReferences);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const referencingStyle = useSettingsStore((s) => s.referencingStyle);
  const result = analysisResults.citations;
  const loading = isAnalyzing.citations;

  const [formatResult, setFormatResult] = useState<FormatResult | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showFormatted, setShowFormatted] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);

  const runCheck = async () => {
    if (!currentPaper?.plainText) return;
    setAnalyzing("citations", true);
    try {
      const res = await fetch("/api/check-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.references
            ? `${currentPaper.plainText}\n\nReference List\n${currentPaper.references}`
            : currentPaper.plainText,
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCitationResult(data);
    } catch (err) {
      console.error("Citation check failed:", err);
    } finally {
      setAnalyzing("citations", false);
    }
  };

  const runFormat = async () => {
    if (!currentPaper?.references) return;
    setIsFormatting(true);
    setFormatError(null);
    try {
      const res = await fetch("/api/format-citation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citations: currentPaper.references,
          referencingStyle: referencingStyle || "harvard",
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFormatResult(data);
      setShowFormatted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Formatting failed";
      setFormatError(message);
    } finally {
      setIsFormatting(false);
    }
  };

  const applyFixes = () => {
    if (!formatResult?.allCorrected) return;
    const correctedText = formatResult.allCorrected;
    // Convert asterisk-marked italics to HTML <em> for the HTML version
    const correctedHtml = correctedText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const htmlLine = line.replace(
          /\*([^*]+)\*/g,
          "<em>$1</em>",
        );
        return `<p>${htmlLine}</p>`;
      })
      .join("");
    // Plain text strips the asterisks
    const plainText = correctedText.replace(/\*/g, "");
    updateReferences(correctedHtml, plainText);
    setFormatResult(null);
    setShowFormatted(false);
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <BookOpen className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Harvard Citation Checker</p>
          <p className="text-sm text-muted-foreground">
            Validates your in-text citations, cross-references against your
            reference list, and checks Cornerstone Harvard referencing format.
          </p>
        </div>
        <Button onClick={runCheck} disabled={!currentPaper?.plainText}>
          <BookOpen className="mr-2 h-4 w-4" />
          Check Citations
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Checking citations and references...
        </p>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor =
    result.trafficLight === "green"
      ? "text-green-600"
      : result.trafficLight === "yellow"
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Citation Score</p>
          <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {result.score}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-check
        </Button>
      </div>

      <Progress value={result.score} className="h-2.5" />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center shadow-sm">
          <p className="text-3xl font-bold tabular-nums">{result.inTextCitations?.length || 0}</p>
          <p className="text-xs text-muted-foreground">In-text Citations</p>
        </Card>
        <Card className="p-3 text-center shadow-sm">
          <p className="text-3xl font-bold tabular-nums">{result.references?.length || 0}</p>
          <p className="text-xs text-muted-foreground">References</p>
        </Card>
      </div>

      {!result.issues || result.issues.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          No citation issues found
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Issues ({result.issues.length})
          </p>
          {result.issues.map((issue, i) => (
            <Card key={i} className="p-4 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                <Badge variant="outline" className="text-xs">
                  {issue.type.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {issue.location}
                </span>
              </div>
              <p className="text-sm">{issue.detail}</p>
              {issue.suggestion && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {issue.suggestion}
                </p>
              )}
              <FixGuide
                issue={issue.type}
                {...getFixGuide(issue.type)}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Citation Cross-Check */}
      <div className="border-t pt-4">
        <CitationCrossCheckPanel />
      </div>

      {/* Format References Section */}
      <div className="border-t pt-4">
        <Button
          onClick={runFormat}
          disabled={!currentPaper?.references || isFormatting}
          variant="outline"
          className="w-full"
        >
          {isFormatting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Formatting references...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Format References ({(referencingStyle || "harvard").toUpperCase()})
            </>
          )}
        </Button>

        {formatError && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {formatError}
          </div>
        )}

        {formatResult && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{formatResult.summary}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFormatted(!showFormatted)}
              >
                {showFormatted ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showFormatted && (
              <div className="space-y-3">
                {formatResult.formatted.map((item, i) => (
                  <Card key={i} className="p-4 shadow-sm space-y-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                        Original
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        {item.original}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-green-600 dark:text-green-400 mb-1">
                        Corrected
                      </p>
                      <p className="text-xs font-medium">
                        {item.corrected}
                      </p>
                    </div>
                    {item.changes.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.changes.map((change, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="text-[11px]"
                          >
                            {change}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}

                <Button
                  onClick={applyFixes}
                  className="w-full"
                  size="sm"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply Fixes to Reference Editor
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
