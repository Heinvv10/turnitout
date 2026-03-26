"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Lightbulb,
  Loader2,
  AlertOctagon,
  TrendingUp,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react";

export function AdvicePanel() {
  const { currentPaper, analysisResults } = usePaperStore();
  const { selectedModule, apiKey, moduleOutlines } = useSettingsStore();
  const { setAdviceResult } = usePaperStore();

  const advice = analysisResults.advice;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const hasResults =
    analysisResults.aiRisk ||
    analysisResults.citations ||
    analysisResults.grading ||
    analysisResults.plagiarism;

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getAdvice = async () => {
    if (!currentPaper?.plainText) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/get-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText.slice(0, 3000),
          moduleCode: selectedModule,
          assessmentName: "",
          results: {
            aiRisk: analysisResults.aiRisk
              ? { overallScore: analysisResults.aiRisk.overallScore, summary: analysisResults.aiRisk.summary, topIssues: analysisResults.aiRisk.topIssues }
              : null,
            citations: analysisResults.citations
              ? { score: analysisResults.citations.score, issues: analysisResults.citations.issues }
              : null,
            grading: analysisResults.grading
              ? { totalScore: analysisResults.grading.totalScore, saGrade: analysisResults.grading.saGrade, rubricScores: analysisResults.grading.rubricScores, overallFeedback: analysisResults.grading.overallFeedback }
              : null,
            plagiarism: analysisResults.plagiarism
              ? { overallSimilarity: analysisResults.plagiarism.overallSimilarity, summary: analysisResults.plagiarism.summary, matches: analysisResults.plagiarism.matches }
              : null,
          },
          verifiedData: {
            wordCount: currentPaper.wordCount,
            referenceCount: currentPaper.referenceCount,
            wordCountRequirement: (() => {
              const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
              const assessment = outline?.assessments?.find((a: { type: string }) => a.type !== "Summative");
              return assessment?.wordCount || "";
            })(),
            turnitinThreshold: (() => {
              const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
              return outline?.turnitinThreshold || 25;
            })(),
          },
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdviceResult(data);
      setCheckedItems(new Set());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to get advice";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!hasResults && !advice && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Lightbulb className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Improvement Advice</p>
          <p className="text-sm text-muted-foreground">
            Run the checks first, then get personalised advice.
          </p>
        </div>
        <Button disabled>Run checks first</Button>
      </div>
    );
  }

  if (!advice && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Lightbulb className="h-12 w-12 text-yellow-500/60" />
        <div>
          <p className="text-lg font-medium">Ready for Advice</p>
          <p className="text-sm text-muted-foreground">
            Your checks are complete. Get personalised improvement advice.
          </p>
        </div>
        <Button onClick={getAdvice} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Get Improvement Advice
        </Button>
        {error && <p className="text-xs text-red-500 max-w-xs">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Preparing advice...</p>
      </div>
    );
  }

  if (!advice) return null;

  return (
    <div className="space-y-4">
      <Card className="bg-primary/5 border-primary/20 p-4">
        <p className="text-sm">{advice.overallMessage}</p>
      </Card>

      {advice.critical && advice.critical.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-500" />
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Fix Before Submitting ({advice.critical.length})
            </p>
          </div>
          {advice.critical.map((item, i) => (
            <Card key={i} className="border-red-200 bg-red-50/50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/20">
              <p className="mb-1 text-sm font-medium">{item.area}</p>
              <p className="mb-2 text-xs text-muted-foreground">{item.detail}</p>
              <div className="rounded bg-white/80 p-2 text-xs dark:bg-black/20">
                <span className="font-medium text-red-700 dark:text-red-400">Action: </span>{item.action}
              </div>
            </Card>
          ))}
        </div>
      )}

      {advice.recommended && advice.recommended.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              Recommended Improvements ({advice.recommended.length})
            </p>
          </div>
          {advice.recommended.map((item, i) => (
            <Card key={i} className="border-yellow-200 bg-yellow-50/50 p-4 shadow-sm dark:border-yellow-900 dark:bg-yellow-950/20">
              <p className="mb-1 text-sm font-medium">{item.area}</p>
              <p className="mb-2 text-xs text-muted-foreground">{item.detail}</p>
              <div className="rounded bg-white/80 p-2 text-xs dark:bg-black/20">
                <span className="font-medium text-yellow-700 dark:text-yellow-400">Action: </span>{item.action}
              </div>
            </Card>
          ))}
        </div>
      )}

      {advice.polish && advice.polish.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Final Polish ({advice.polish.length})
            </p>
          </div>
          {advice.polish.map((item, i) => (
            <Card key={i} className="p-4 shadow-sm">
              <p className="mb-1 text-sm font-medium">{item.area}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
              <p className="mt-1 text-xs"><span className="font-medium">Tip: </span>{item.action}</p>
            </Card>
          ))}
        </div>
      )}

      {advice.checklist && advice.checklist.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Pre-Submission Checklist</p>
          <Card className="p-4 shadow-sm">
            {advice.checklist.map((item, i) => (
              <button key={i} onClick={() => toggleCheck(i)} className="flex w-full items-start gap-2 rounded p-1.5 text-left text-xs hover:bg-muted/50">
                {checkedItems.has(i) ? <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" /> : <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                <span className={checkedItems.has(i) ? "line-through text-muted-foreground" : ""}>{item}</span>
              </button>
            ))}
            <div className="mt-2 text-center text-xs text-muted-foreground">
              {checkedItems.size}/{advice.checklist.length} completed
            </div>
          </Card>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={getAdvice} className="w-full">
        <Lightbulb className="mr-2 h-3.5 w-3.5" />
        Refresh Advice
      </Button>
    </div>
  );
}
