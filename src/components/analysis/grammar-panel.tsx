"use client";

import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SpellCheck, Loader2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { GrammarIssue } from "@/types/analysis";

function severityIcon(severity: GrammarIssue["severity"]) {
  switch (severity) {
    case "error":
      return <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />;
    case "warning":
      return <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />;
    case "suggestion":
      return <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />;
  }
}

function severityBorder(severity: GrammarIssue["severity"]) {
  switch (severity) {
    case "error":
      return "border-l-red-500";
    case "warning":
      return "border-l-yellow-500";
    case "suggestion":
      return "border-l-blue-500";
  }
}

function typeBadgeVariant(type: GrammarIssue["type"]) {
  switch (type) {
    case "grammar":
      return "destructive" as const;
    case "spelling":
      return "destructive" as const;
    case "punctuation":
      return "secondary" as const;
    case "word_choice":
      return "secondary" as const;
    case "sentence_structure":
      return "outline" as const;
  }
}

export function GrammarPanel() {
  const { currentPaper, analysisResults, isAnalyzing, setAnalyzing, setGrammarResult } =
    usePaperStore();
  const { apiKey, language } = useSettingsStore();
  const result = analysisResults.grammar;
  const loading = isAnalyzing.grammar;

  const runCheck = async () => {
    if (!currentPaper?.plainText) return;
    setAnalyzing("grammar", true);
    try {
      const res = await fetch("/api/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText,
          apiKey,
          language,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGrammarResult(data);
    } catch (err) {
      console.error("Grammar check failed:", err);
    } finally {
      setAnalyzing("grammar", false);
    }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <SpellCheck className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Grammar & Spelling Checker</p>
          <p className="text-sm text-muted-foreground">
            Checks grammar, spelling, and punctuation using{" "}
            {language === "en-ZA"
              ? "South African"
              : language === "en-GB"
                ? "British"
                : language === "en-US"
                  ? "American"
                  : "South African"}{" "}
            English conventions.
          </p>
        </div>
        <Button onClick={runCheck} disabled={!currentPaper?.plainText}>
          <SpellCheck className="mr-2 h-4 w-4" />
          Check Grammar
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Checking grammar and spelling...
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

  // Group issues by severity
  const errors = result.issues.filter((i) => i.severity === "error");
  const warnings = result.issues.filter((i) => i.severity === "warning");
  const suggestions = result.issues.filter((i) => i.severity === "suggestion");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Grammar Score</p>
          <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {result.score}/100
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={result.errorCount === 0 ? "default" : "destructive"}>
            {result.errorCount} {result.errorCount === 1 ? "issue" : "issues"}
          </Badge>
          <Button variant="outline" size="sm" onClick={runCheck}>
            Re-check
          </Button>
        </div>
      </div>

      <Progress value={result.score} className="h-2.5" />

      <p className="text-sm text-muted-foreground">{result.summary}</p>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-red-600">
            <AlertCircle className="h-3 w-3" />
            Errors ({errors.length})
          </p>
          {errors.map((issue, i) => (
            <IssueCard key={`error-${i}`} issue={issue} />
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            Warnings ({warnings.length})
          </p>
          {warnings.map((issue, i) => (
            <IssueCard key={`warning-${i}`} issue={issue} />
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-blue-600">
            <Info className="h-3 w-3" />
            Suggestions ({suggestions.length})
          </p>
          {suggestions.map((issue, i) => (
            <IssueCard key={`suggestion-${i}`} issue={issue} />
          ))}
        </div>
      )}

      {result.issues.length === 0 && (
        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            No issues found - your grammar looks great!
          </p>
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: GrammarIssue }) {
  return (
    <Card className={`border-l-4 ${severityBorder(issue.severity)} p-4 shadow-sm`}>
      <div className="flex items-start gap-2">
        {severityIcon(issue.severity)}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={typeBadgeVariant(issue.type)} className="text-xs">
              {issue.type.replace("_", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">{issue.location}</span>
          </div>
          <div className="text-xs">
            <span className="line-through text-red-600/70">{issue.text}</span>
            <span className="mx-1.5 text-muted-foreground">&rarr;</span>
            <span className="font-medium text-green-700 dark:text-green-400">
              {issue.correction}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">{issue.explanation}</p>
        </div>
      </div>
    </Card>
  );
}
