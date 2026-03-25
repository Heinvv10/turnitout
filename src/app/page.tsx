"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { OutlineGate } from "@/components/analysis/outline-gate";
import { PaperEditor } from "@/components/editor/paper-editor";
import { AnalysisTabs } from "@/components/analysis/analysis-tabs";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { useHistoryStore } from "@/store/history-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, PlayCircle, PanelRightOpen } from "lucide-react";

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const {
    currentPaper,
    analysisResults,
    isAnalyzing,
    setAnalyzing,
    setAIRiskResult,
    setCitationResult,
    setGradingResult,
    setPlagiarismResult,
  } = usePaperStore();
  const { selectedModule, setSelectedModule, moduleOutlines, apiKey } =
    useSettingsStore();
  const { addEntry } = useHistoryStore();
  const searchParams = useSearchParams();

  // Handle ?module=XXXX from dashboard links
  useEffect(() => {
    const moduleParam = searchParams.get("module");
    if (moduleParam) {
      setSelectedModule(moduleParam);
    }
  }, [searchParams, setSelectedModule]);

  const anyLoading =
    isAnalyzing.aiRisk || isAnalyzing.citations || isAnalyzing.grading || isAnalyzing.plagiarism;

  const runAllChecks = async () => {
    if (!currentPaper?.plainText) return;

    const uploadedOutline = moduleOutlines[selectedModule] || undefined;

    const body = {
      text: currentPaper.plainText,
      moduleCode: selectedModule,
      assignmentTitle: currentPaper.title,
      uploadedOutline,
      apiKey,
    };

    setAnalyzing("aiRisk", true);
    setAnalyzing("citations", true);
    setAnalyzing("grading", true);
    setAnalyzing("plagiarism", true);

    const safeFetch = async (url: string, retries = 2): Promise<unknown> => {
      for (let i = 0; i <= retries; i++) {
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await r.json();
          if (data.error?.includes("overloaded") || data.error?.includes("529")) {
            if (i < retries) { await new Promise(r => setTimeout(r, (i + 1) * 3000)); continue; }
          }
          if (data.error) throw new Error(data.error);
          return data;
        } catch (err) {
          if (i < retries && err instanceof Error && (err.message.includes("overloaded") || err.message.includes("529"))) {
            await new Promise(r => setTimeout(r, (i + 1) * 3000));
            continue;
          }
          throw err;
        }
      }
      throw new Error("Failed after retries");
    };

    // Run in two batches to avoid rate limits
    const [aiRes, citRes] = await Promise.allSettled([
      safeFetch("/api/analyze-ai-risk"),
      safeFetch("/api/check-citations"),
    ]);

    if (aiRes.status === "fulfilled") setAIRiskResult(aiRes.value as Parameters<typeof setAIRiskResult>[0]);
    if (citRes.status === "fulfilled") setCitationResult(citRes.value as Parameters<typeof setCitationResult>[0]);
    setAnalyzing("aiRisk", false);
    setAnalyzing("citations", false);

    const [gradeRes, plagRes] = await Promise.allSettled([
      safeFetch("/api/grade-paper"),
      safeFetch("/api/check-plagiarism"),
    ]);

    if (gradeRes.status === "fulfilled") setGradingResult(gradeRes.value as Parameters<typeof setGradingResult>[0]);
    if (plagRes.status === "fulfilled") setPlagiarismResult(plagRes.value as Parameters<typeof setPlagiarismResult>[0]);
    setAnalyzing("grading", false);
    setAnalyzing("plagiarism", false);

    // Save to history (localStorage)
    const updatedResults = usePaperStore.getState().analysisResults;
    if (currentPaper) {
      addEntry({
        id: crypto.randomUUID(),
        paperTitle: currentPaper.title || "Untitled",
        moduleCode: selectedModule,
        timestamp: new Date().toISOString(),
        wordCount: currentPaper.wordCount,
        readiness: updatedResults,
      });

      // Save to database
      const { studentDbId } = useSettingsStore.getState();
      if (studentDbId) {
        fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "saveHistory",
            studentId: studentDbId,
            paperTitle: currentPaper.title || "Untitled",
            moduleCode: selectedModule,
            wordCount: currentPaper.wordCount,
            overallScore: updatedResults.overall,
            trafficLight: updatedResults.trafficLight,
            resultsSummary: {
              aiRisk: updatedResults.aiRisk?.overallScore ?? null,
              similarity: updatedResults.plagiarism?.overallSimilarity ?? null,
              citations: updatedResults.citations?.score ?? null,
              grade: updatedResults.grading?.totalScore ?? null,
            },
          }),
        }).catch((err) => console.error("DB history save failed:", err));
      }
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <OutlineGate />

      <div className="flex items-center justify-between border-b px-4 py-2">
        <p className="text-sm text-muted-foreground">
          {currentPaper
            ? `${currentPaper.wordCount} words`
            : "Start writing to begin"}
        </p>
        <Button
          onClick={runAllChecks}
          disabled={!currentPaper?.plainText || anyLoading}
          size="sm"
        >
          {anyLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 h-4 w-4" />
          )}
          Run All Checks
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 overflow-y-auto border-r p-4">
          <PaperEditor />
        </div>

        {/* Analysis Panel - Desktop */}
        <div className="hidden w-[420px] shrink-0 overflow-y-auto bg-card lg:block">
          <AnalysisTabs />
        </div>

        {/* Analysis Panel - Mobile (Sheet) */}
        <div className="fixed bottom-4 right-4 lg:hidden z-50">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <PanelRightOpen className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto p-0">
              <AnalysisTabs />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
