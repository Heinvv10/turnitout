"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Fingerprint,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  FileWarning,
  Eye,
} from "lucide-react";
import { FixGuide, getFixGuide } from "./fix-guide";
import { ParaphraseButton } from "./paraphrase-button";
import { OriginalityViewer } from "./originality-viewer";

const matchTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  direct_copy: { label: "Uncited Copy", color: "destructive", icon: "red" },
  close_paraphrase: { label: "Close Paraphrase", color: "destructive", icon: "red" },
  patchwriting: { label: "Patchwriting", color: "secondary", icon: "yellow" },
  common_knowledge: { label: "Common Knowledge", color: "outline", icon: "green" },
};

export function OriginalityPanel() {
  const {
    currentPaper,
    analysisResults,
    isAnalyzing,
    setAnalyzing,
    setPlagiarismResult,
  } = usePaperStore();
  const { apiKey } = useSettingsStore();
  const result = analysisResults.plagiarism;
  const loading = isAnalyzing.plagiarism;
  const [viewerMatch, setViewerMatch] = useState<number | null>(null);

  const runCheck = async () => {
    if (!currentPaper?.plainText) return;
    setAnalyzing("plagiarism", true);
    try {
      const res = await fetch("/api/check-plagiarism", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText,
          moduleCode: currentPaper.moduleCode,
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlagiarismResult(data);
    } catch (err) {
      console.error("Originality check failed:", err);
    } finally {
      setAnalyzing("plagiarism", false);
    }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Fingerprint className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Originality Check</p>
          <p className="text-sm text-muted-foreground">
            Checks for similarity to known sources, uncited content,
            patchwriting, and close paraphrasing. Cornerstone threshold:{" "}
            <strong>25%</strong>.
          </p>
        </div>
        <Button onClick={runCheck} disabled={!currentPaper?.plainText}>
          <Fingerprint className="mr-2 h-4 w-4" />
          Check Originality
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Checking originality...
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

  const barColor =
    result.trafficLight === "green"
      ? "bg-green-500"
      : result.trafficLight === "yellow"
        ? "bg-yellow-500"
        : "bg-red-500";

  // Split matches into cited (ok) vs uncited (problem)
  const uncitedMatches = result.matches?.filter(
    (m) => m.matchType !== "common_knowledge",
  ) || [];
  const okMatches = result.matches?.filter(
    (m) => m.matchType === "common_knowledge",
  ) || [];

  return (
    <div className="space-y-4">
      {/* Similarity Score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Similarity Score</p>
          <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {result.overallSimilarity}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-check
        </Button>
      </div>

      {/* Similarity bar with threshold */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(result.overallSimilarity, 100)}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-red-600"
          style={{ left: "25%" }}
          title="Cornerstone threshold: 25%"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0% Original</span>
        <span className="font-medium text-red-600">25% Threshold</span>
        <span>100%</span>
      </div>

      <p className="text-sm text-muted-foreground">{result.summary}</p>

      {/* Plagiarism Warning */}
      {(result.uncitedMatches || 0) > 0 && (
        <Card className="border-red-300 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-950/30">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                Plagiarism Warning
              </p>
              <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                {result.uncitedMatches} passage{(result.uncitedMatches || 0) > 1 ? "s" : ""} appear
                to be from external sources without proper citation. This could
                be flagged as plagiarism by Turnitin and may result in mark
                deductions or disciplinary action.
              </p>
              <div className="mt-2 rounded bg-red-100 p-2 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <p className="font-medium">What to do:</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  <li>Add proper citations for all borrowed ideas</li>
                  <li>Put direct quotes in quotation marks with page numbers</li>
                  <li>Rewrite paraphrased sections in your own words</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {(result.uncitedMatches || 0) === 0 && result.overallSimilarity < 25 && (
        <Card className="border-green-300 bg-green-50 p-4 shadow-sm dark:border-green-800 dark:bg-green-950/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-bold text-green-700 dark:text-green-400">
                No Plagiarism Detected
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Your work appears original and properly cited. You are within
                Cornerstone&apos;s {25}% similarity threshold.
              </p>
            </div>
          </div>
        </Card>
      )}

      {result.overallSimilarity >= 25 && (result.uncitedMatches || 0) === 0 && (
        <Card className="border-yellow-300 bg-yellow-50 p-4 shadow-sm dark:border-yellow-800 dark:bg-yellow-950/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                High Similarity — Review Needed
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Your similarity score ({result.overallSimilarity}%) exceeds the
                25% threshold. Even though citations appear present, Turnitin
                will flag this. Reduce direct quotes and paraphrase more in your
                own words.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-lg font-bold">
              {result.citedProperly || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Properly Cited</p>
        </Card>
        <Card className="p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            <span className="text-lg font-bold">
              {result.uncitedMatches || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Needs Citation</p>
        </Card>
        <Card className="p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1">
            {result.selfPlagiarismRisk ? (
              <FileWarning className="h-3 w-3 text-red-500" />
            ) : (
              <CheckCircle className="h-3 w-3 text-green-500" />
            )}
            <span className="text-lg font-bold">
              {result.selfPlagiarismRisk ? "Risk" : "Clear"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Self-Plagiarism</p>
        </Card>
      </div>

      {/* Uncited / Problem Matches */}
      {uncitedMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              Needs Attention ({uncitedMatches.length})
            </p>
          </div>
          {uncitedMatches.map((match, i) => {
            const typeInfo = matchTypeLabels[match.matchType] || {
              label: match.matchType,
              color: "outline",
            };
            return (
              <Card
                key={i}
                className="border-red-200 bg-red-50/30 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/10"
              >
                <div className="mb-1 flex items-center justify-between">
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
                  <span className="text-xs font-mono text-muted-foreground">
                    {match.similarityPercent}% match
                  </span>
                </div>
                <p className="mb-1 text-xs text-muted-foreground line-clamp-2">
                  &ldquo;{match.passage}&rdquo;
                </p>
                {match.passage && (
                  <div className="mb-1 flex items-center gap-2">
                    <ParaphraseButton text={match.passage} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => setViewerMatch(i)}
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                )}
                <p className="mb-1 text-xs text-muted-foreground">
                  Likely source: {match.possibleSource}
                </p>
                <div className="rounded bg-white/60 p-2 text-xs dark:bg-black/20">
                  <span className="font-medium">Fix: </span>
                  {match.suggestion}
                </div>
                <FixGuide
                  issue={match.matchType}
                  {...getFixGuide(match.matchType)}
                />
              </Card>
            );
          })}
        </div>
      )}

      {/* Properly Cited / OK */}
      {okMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
              Properly Handled ({okMatches.length})
            </p>
          </div>
          {okMatches.map((match, i) => (
            <Card
              key={i}
              className="border-green-200 bg-green-50/30 p-4 shadow-sm dark:border-green-900 dark:bg-green-950/10"
            >
              <div className="mb-1 flex items-center justify-between">
                <Badge variant="outline">Common Knowledge</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                &ldquo;{match.passage}&rdquo;
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* All clear */}
      {(!result.matches || result.matches.length === 0) && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          No originality issues detected
        </div>
      )}

      {/* Side-by-side originality viewer */}
      {viewerMatch !== null && uncitedMatches[viewerMatch] && (
        <OriginalityViewer
          open
          passage={uncitedMatches[viewerMatch].passage}
          source={uncitedMatches[viewerMatch].possibleSource}
          similarity={uncitedMatches[viewerMatch].similarityPercent}
          matchType={uncitedMatches[viewerMatch].matchType}
          suggestion={uncitedMatches[viewerMatch].suggestion}
          onClose={() => setViewerMatch(null)}
        />
      )}
    </div>
  );
}
