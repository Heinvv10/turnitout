"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { OnboardingModal } from "@/components/layout/onboarding-modal";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TemplateExport } from "@/components/template/template-export";
import { DocumentPreview } from "@/components/template/document-preview";
import { Tabs as ExportTabs, TabsContent as ETC, TabsList as ETL, TabsTrigger as ETT } from "@/components/ui/tabs";
import { Loader2, PlayCircle, PanelRightOpen, Download, Eye, Settings2 } from "lucide-react";

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
    sections,
    setAnalyzing,
    setAIRiskResult,
    setCitationResult,
    setGradingResult,
    setPlagiarismResult,
    setPaper,
    setSections,
    clearResults,
  } = usePaperStore();
  const { selectedModule, setSelectedModule, moduleOutlines, apiKey, gradingScale, referencingStyle, saveModulePaper, getModulePaper } =
    useSettingsStore();
  const { addEntry } = useHistoryStore();
  const searchParams = useSearchParams();
  const prevModuleRef = useRef(selectedModule);

  // Handle ?module=XXXX from dashboard links
  useEffect(() => {
    const moduleParam = searchParams.get("module");
    if (moduleParam) {
      setSelectedModule(moduleParam);
    }
  }, [searchParams, setSelectedModule]);

  // Save current paper and restore previous when switching modules
  useEffect(() => {
    const prevModule = prevModuleRef.current;
    if (prevModule === selectedModule) return;

    // Save current paper for the previous module
    if (prevModule && currentPaper && currentPaper.plainText) {
      saveModulePaper(prevModule, currentPaper, sections, analysisResults);
    }

    // Restore paper for the new module
    const saved = getModulePaper(selectedModule);
    if (saved) {
      setPaper(saved.paper);
      setSections(saved.sections);
      // Restore analysis results
      if (saved.results.aiRisk) setAIRiskResult(saved.results.aiRisk);
      if (saved.results.citations) setCitationResult(saved.results.citations);
      if (saved.results.grading) setGradingResult(saved.results.grading);
      if (saved.results.plagiarism) setPlagiarismResult(saved.results.plagiarism);
    } else {
      // Clear for fresh module
      clearResults();
      setSections(null);
      setPaper({
        id: crypto.randomUUID(),
        moduleCode: selectedModule,
        title: "",
        content: "",
        plainText: "",
        wordCount: 0,
        references: "",
        referencesHtml: "",
        referenceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    prevModuleRef.current = selectedModule;
  }, [selectedModule]);

  const anyLoading =
    isAnalyzing.aiRisk || isAnalyzing.citations || isAnalyzing.grading || isAnalyzing.plagiarism;

  const runAllChecks = async () => {
    if (!currentPaper?.plainText) return;

    const uploadedOutline = moduleOutlines[selectedModule] || undefined;

    // Combine body + references for full text analysis, but keep them separate for context
    const fullText = currentPaper.references
      ? `${currentPaper.plainText}\n\nReference List\n${currentPaper.references}`
      : currentPaper.plainText;

    const body = {
      text: fullText,
      moduleCode: selectedModule,
      assignmentTitle: currentPaper.title,
      uploadedOutline,
      apiKey,
      gradingScale,
      referencingStyle,
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

      // Save paper + results for this module
      const latestPaper = usePaperStore.getState().currentPaper;
      const latestSections = usePaperStore.getState().sections;
      if (latestPaper) {
        saveModulePaper(selectedModule, latestPaper, latestSections, updatedResults);
      }
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <OnboardingModal />
      <Header />
      <OutlineGate />

      <div className="flex items-center justify-between border-b px-4 py-2">
        <p className="text-sm text-muted-foreground">
          {currentPaper
            ? `${currentPaper.wordCount} words`
            : "Start writing to begin"}
        </p>
        <div className="flex items-center gap-2">
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

          <Dialog>
            <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
              <Download className="h-3.5 w-3.5" />
              Export .docx
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Export to Word Template</DialogTitle>
              </DialogHeader>
              <ExportTabs defaultValue="preview">
                <ETL className="w-full">
                  <ETT value="preview" className="flex-1 gap-1 text-xs">
                    <Eye className="h-3 w-3" />
                    Document Preview
                  </ETT>
                  <ETT value="settings" className="flex-1 gap-1 text-xs">
                    <Settings2 className="h-3 w-3" />
                    Export Settings
                  </ETT>
                </ETL>
                <ETC value="preview" className="max-h-[60vh] overflow-y-auto mt-2">
                  <DocumentPreview />
                </ETC>
                <ETC value="settings" className="mt-2">
                  <TemplateExport />
                </ETC>
              </ExportTabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="w-[60%] shrink-0 overflow-y-auto border-r p-4">
          <PaperEditor />
        </div>

        {/* Analysis Panel - Desktop */}
        <div className="hidden flex-1 overflow-y-auto bg-card lg:block">
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
