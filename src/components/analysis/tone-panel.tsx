"use client";

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

const issueTypeLabels: Record<string, { label: string; color: string }> = {
  informal: { label: "Informal", color: "destructive" },
  contraction: { label: "Contraction", color: "destructive" },
  slang: { label: "Slang", color: "destructive" },
  first_person: { label: "First Person", color: "secondary" },
  hedging: { label: "Hedging", color: "secondary" },
  emotional: { label: "Emotional", color: "secondary" },
  bias: { label: "Bias", color: "outline" },
};

export function TonePanel() {
  const { currentPaper, analysisResults } = usePaperStore();
  const { apiKey } = useSettingsStore();
  const { setToneResult } = usePaperStore();
  const result = analysisResults.tone;

  const loading = false; // managed locally for manual re-check
  const runCheck = async () => {
    if (!currentPaper?.plainText) return;
    try {
      const res = await fetch("/api/check-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText,
          apiKey,
        }),
      });
      const data = await res.json();
      if (!data.error) setToneResult(data);
    } catch {}
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <p className="font-medium">Tone & Formality Checker</p>
          <p className="text-sm text-muted-foreground">
            Check your essay for informal language, contractions, hedging, and
            other tone issues that could affect your academic writing quality.
          </p>
        </div>
        <Button onClick={runCheck} disabled={!currentPaper?.plainText}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Check Tone
        </Button>
      </div>
    );
  }

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
          <p className="text-sm font-medium">Formality Score</p>
          <p className={`text-2xl font-bold ${scoreColor}`}>
            {result.formalityScore}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-check
        </Button>
      </div>

      <Progress value={result.formalityScore} className="h-2" />

      <p className="text-sm text-muted-foreground">{result.summary}</p>

      {result.issues && result.issues.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Issues ({result.issues.length})
          </p>
          {result.issues.map((issue, i) => {
            const typeInfo = issueTypeLabels[issue.type] || {
              label: issue.type,
              color: "outline",
            };
            return (
              <Card key={i} className="p-3">
                <div className="mb-1 flex items-center gap-2">
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
                <p className="mb-1 text-xs text-muted-foreground">
                  &ldquo;{issue.text}&rdquo;
                </p>
                <p className="text-xs">
                  <span className="font-medium">Suggestion: </span>
                  {issue.suggestion}
                </p>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          Academic tone is appropriate
        </div>
      )}
    </div>
  );
}
