"use client";

import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { FixGuide, getFixGuide } from "./fix-guide";

export function AIRiskPanel() {
  const { currentPaper, analysisResults, isAnalyzing, setAnalyzing, setAIRiskResult } =
    usePaperStore();
  const { apiKey } = useSettingsStore();
  const result = analysisResults.aiRisk;
  const loading = isAnalyzing.aiRisk;

  const runCheck = async () => {
    if (!currentPaper?.plainText) return;
    setAnalyzing("aiRisk", true);
    try {
      const res = await fetch("/api/analyze-ai-risk", {
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
      setAIRiskResult(data);
    } catch (err) {
      console.error("AI risk analysis failed:", err);
    } finally {
      setAnalyzing("aiRisk", false);
    }
  };

  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <ShieldCheck className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">AI Writing Risk Scanner</p>
          <p className="text-sm text-muted-foreground">
            Checks for patterns that Turnitin flags: predictable writing, uniform
            sentences, generic vocabulary, and formulaic transitions.
          </p>
        </div>
        <Button onClick={runCheck} disabled={!currentPaper?.plainText}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Check AI Risk
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Analysing your writing patterns...
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
          <p className="text-sm font-medium">Overall AI Risk Score</p>
          <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {result.overallScore}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-check
        </Button>
      </div>

      <Progress
        value={result.overallScore}
        className="h-2.5"
      />

      <p className="text-sm text-muted-foreground">{result.summary}</p>

      {result.topIssues && result.topIssues.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Top Issues
          </p>
          {result.topIssues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}

      {result.paragraphs && result.paragraphs.length > 0 && (
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Paragraph Analysis
        </p>
        {result.paragraphs.map((para) => (
          <Card key={para.index} className="p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Paragraph {para.index + 1}
              </span>
              <Badge
                variant={
                  para.riskScore < 20
                    ? "default"
                    : para.riskScore < 40
                      ? "secondary"
                      : "destructive"
                }
              >
                {para.riskScore}% risk
              </Badge>
            </div>
            <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
              {para.text}
            </p>
            {para.flags.map((flag, fi) => (
              <div
                key={fi}
                className="mb-1 flex items-start gap-1.5 text-xs"
              >
                <Badge variant="outline" className="shrink-0 text-xs">
                  {flag.type}
                </Badge>
                <span className="text-muted-foreground">{flag.detail}</span>
              </div>
            ))}
            {para.suggestion && (
              <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                <span className="font-medium">Suggestion: </span>
                {para.suggestion}
              </div>
            )}
            {para.flags[0] && (
              <FixGuide
                issue={para.flags[0].type}
                {...getFixGuide(para.flags[0].type, para.flags[0].detail)}
              />
            )}
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
