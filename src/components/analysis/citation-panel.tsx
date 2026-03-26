"use client";

import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { FixGuide, getFixGuide } from "./fix-guide";

export function CitationPanel() {
  const {
    currentPaper,
    analysisResults,
    isAnalyzing,
    setAnalyzing,
    setCitationResult,
  } = usePaperStore();
  const { apiKey } = useSettingsStore();
  const result = analysisResults.citations;
  const loading = isAnalyzing.citations;

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

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium">Harvard Citation Checker</p>
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
          <p className={`text-2xl font-bold ${scoreColor}`}>
            {result.score}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-check
        </Button>
      </div>

      <Progress value={result.score} className="h-2" />

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{result.inTextCitations?.length || 0}</p>
          <p className="text-xs text-muted-foreground">In-text Citations</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{result.references?.length || 0}</p>
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
            <Card key={i} className="p-3">
              <div className="mb-1 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                <Badge variant="outline" className="text-[10px]">
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
    </div>
  );
}
