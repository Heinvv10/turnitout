"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ToneIssue {
  type: "informal" | "contraction" | "slang" | "first_person" | "hedging" | "emotional" | "bias";
  text: string;
  suggestion: string;
}

interface ToneResult {
  formalityScore: number;
  trafficLight: "green" | "yellow" | "red";
  issues: ToneIssue[];
  summary: string;
}

const TYPE_LABELS: Record<ToneIssue["type"], string> = {
  informal: "Informal Language",
  contraction: "Contraction",
  slang: "Slang/Colloquialism",
  first_person: "First Person",
  hedging: "Hedging",
  emotional: "Emotional Language",
  bias: "Bias/Non-inclusive",
};

const TYPE_COLORS: Record<ToneIssue["type"], string> = {
  informal: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  contraction: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  slang: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  first_person: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  hedging: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  emotional: "bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400",
  bias: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

function groupIssuesByType(issues: ToneIssue[]): Record<string, ToneIssue[]> {
  const grouped: Record<string, ToneIssue[]> = {};
  for (const issue of issues) {
    if (!grouped[issue.type]) grouped[issue.type] = [];
    grouped[issue.type].push(issue);
  }
  return grouped;
}

export function TonePanel() {
  const { currentPaper } = usePaperStore();
  const { apiKey, referencingStyle } = useSettingsStore();
  const [result, setResult] = useState<ToneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runCheck = async () => {
    if (!currentPaper?.plainText) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/check-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText,
          apiKey,
          referencingStyle,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tone check failed";
      console.error("Tone check failed:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initial state
  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium">Tone & Formality Check</p>
          <p className="text-sm text-muted-foreground">
            Check your essay for informal language, contractions, hedging, and
            other tone issues that could affect your academic writing quality.
          </p>
        </div>
        <Button
          onClick={runCheck}
          disabled={!currentPaper?.plainText || loading}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Check Tone
        </Button>
        {error && <p className="text-xs text-red-500 max-w-xs">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Analysing tone and formality...
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

  const progressColor =
    result.trafficLight === "green"
      ? "bg-green-500"
      : result.trafficLight === "yellow"
        ? "bg-yellow-500"
        : "bg-red-500";

  const grouped = groupIssuesByType(result.issues);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Tone Analysis</p>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-check
        </Button>
      </div>

      {/* Formality score */}
      <Card className="p-4 text-center">
        <p className="text-xs uppercase text-muted-foreground">
          Formality Score
        </p>
        <p className={`text-4xl font-bold tabular-nums ${scoreColor}`}>
          {result.formalityScore}%
        </p>
        <div className="mx-auto mt-3 max-w-xs">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${result.formalityScore}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20 p-3">
        <p className="text-sm">{result.summary}</p>
      </Card>

      {/* Issues grouped by type */}
      {Object.keys(grouped).length === 0 && (
        <Card className="p-4 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
          <p className="mt-2 text-sm font-medium">No tone issues found</p>
          <p className="text-xs text-muted-foreground">
            Your writing maintains a consistent academic tone.
          </p>
        </Card>
      )}

      {Object.entries(grouped).map(([type, issues]) => (
        <div key={type} className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm font-semibold">
              {TYPE_LABELS[type as ToneIssue["type"]] || type}{" "}
              <span className="font-normal text-muted-foreground">
                ({issues.length})
              </span>
            </p>
          </div>
          {issues.map((issue, i) => (
            <Card key={i} className="p-3">
              <div className="mb-1.5 flex items-start gap-2">
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] ${TYPE_COLORS[issue.type]}`}
                >
                  {TYPE_LABELS[issue.type]}
                </Badge>
              </div>
              <p className="mb-1 text-xs">
                <span className="font-medium">Found: </span>
                <span className="italic text-muted-foreground">
                  &ldquo;{issue.text}&rdquo;
                </span>
              </p>
              <p className="text-xs">
                <span className="font-medium">Suggestion: </span>
                {issue.suggestion}
              </p>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
