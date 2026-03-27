"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { OnboardingModal } from "@/components/layout/onboarding-modal";
import { OutlineGate } from "@/components/analysis/outline-gate";
import { PaperEditor } from "@/components/editor/paper-editor";
import { AnalysisTabs } from "@/components/analysis/analysis-tabs";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { useHistoryStore } from "@/store/history-store";
import { useDraftHistoryStore } from "@/store/draft-history-store";
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
import { ChatPanel } from "@/components/coach/chat-panel";
import { TTSButton } from "@/components/editor/tts-button";
import { safeFetch } from "@/lib/safe-fetch";
import { Loader2, PlayCircle, PanelRightOpen, Download, Eye, Settings2, Zap } from "lucide-react";

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
    setGrammarResult,
    setToneResult,
    setAdviceResult,
    setPaper,
    setSections,
    clearResults,
  } = usePaperStore();
  const { selectedModule, setSelectedModule, moduleOutlines, apiKey, gradingScale, referencingStyle, language, saveModulePaper, getModulePaper } =
    useSettingsStore();
  const { addEntry } = useHistoryStore();
  const { addSnapshot } = useDraftHistoryStore();
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
    isAnalyzing.aiRisk || isAnalyzing.citations || isAnalyzing.grading || isAnalyzing.plagiarism || isAnalyzing.grammar;

  const [isQuickChecking, setIsQuickChecking] = useState(false);

  const buildRequestBody = () => {
    const uploadedOutline = moduleOutlines[selectedModule] || undefined;
    const fullText = currentPaper?.references
      ? `${currentPaper.plainText}\n\nReference List\n${currentPaper.references}`
      : currentPaper?.plainText ?? "";
    return {
      text: fullText,
      moduleCode: selectedModule,
      assignmentTitle: currentPaper?.title ?? "",
      uploadedOutline,
      apiKey,
      gradingScale,
      referencingStyle,
      language,
    };
  };

  const runQuickCheck = async () => {
    if (!currentPaper?.plainText) return;
    setIsQuickChecking(true);
    const body = buildRequestBody();

    setAnalyzing("grammar", true);
    setAnalyzing("citations", true);

    const quickPromises = [
      safeFetch("/api/check-grammar", body).then(v => { setGrammarResult(v as Parameters<typeof setGrammarResult>[0]); setAnalyzing("grammar", false); }),
      safeFetch("/api/check-citations", body).then(v => { setCitationResult(v as Parameters<typeof setCitationResult>[0]); setAnalyzing("citations", false); }),
    ];

    await Promise.allSettled(quickPromises.map(p => p.catch(() => {})));

    setAnalyzing("grammar", false);
    setAnalyzing("citations", false);
    setIsQuickChecking(false);
  };

  const runAllChecks = async () => {
    if (!currentPaper?.plainText) return;
    const body = buildRequestBody();

    setAnalyzing("aiRisk", true);
    setAnalyzing("citations", true);
    setAnalyzing("grading", true);
    setAnalyzing("plagiarism", true);
    setAnalyzing("grammar", true);

    // Fire all 6 checks simultaneously with staggered starts (500ms apart to avoid rate spikes)
    const checkPromises = [
      safeFetch("/api/analyze-ai-risk", body, { delay: 0 }).then(v => { setAIRiskResult(v as Parameters<typeof setAIRiskResult>[0]); setAnalyzing("aiRisk", false); }),
      safeFetch("/api/check-citations", body, { delay: 500 }).then(v => { setCitationResult(v as Parameters<typeof setCitationResult>[0]); setAnalyzing("citations", false); }),
      safeFetch("/api/grade-paper", body, { delay: 1000 }).then(v => { setGradingResult(v as Parameters<typeof setGradingResult>[0]); setAnalyzing("grading", false); }),
      safeFetch("/api/check-plagiarism", body, { delay: 1500 }).then(v => { setPlagiarismResult(v as Parameters<typeof setPlagiarismResult>[0]); setAnalyzing("plagiarism", false); }),
      safeFetch("/api/check-grammar", body, { delay: 2000 }).then(v => { setGrammarResult(v as Parameters<typeof setGrammarResult>[0]); setAnalyzing("grammar", false); }),
      safeFetch("/api/check-tone", body, { delay: 2500 }).then(v => { setToneResult(v as Parameters<typeof setToneResult>[0]); }),
    ];

    // Each check updates the UI as soon as it completes (no waiting for others)
    await Promise.allSettled(checkPromises.map(p => p.catch(() => {})));

    // Ensure all analyzing states are cleared
    setAnalyzing("aiRisk", false);
    setAnalyzing("citations", false);
    setAnalyzing("grading", false);
    setAnalyzing("plagiarism", false);
    setAnalyzing("grammar", false);

    // Auto-trigger advice after all checks complete
    const latestResults = usePaperStore.getState().analysisResults;
    if (currentPaper?.plainText && (latestResults.aiRisk || latestResults.grading)) {
      fetch("/api/get-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText.slice(0, 3000),
          moduleCode: selectedModule,
          assessmentName: "",
          results: {
            aiRisk: latestResults.aiRisk ? { overallScore: latestResults.aiRisk.overallScore, summary: latestResults.aiRisk.summary, topIssues: latestResults.aiRisk.topIssues } : null,
            citations: latestResults.citations ? { score: latestResults.citations.score, issues: latestResults.citations.issues } : null,
            grading: latestResults.grading ? { totalScore: latestResults.grading.totalScore, saGrade: latestResults.grading.saGrade, rubricScores: latestResults.grading.rubricScores, overallFeedback: latestResults.grading.overallFeedback } : null,
            plagiarism: latestResults.plagiarism ? { overallSimilarity: latestResults.plagiarism.overallSimilarity, summary: latestResults.plagiarism.summary, matches: latestResults.plagiarism.matches } : null,
          },
          verifiedData: {
            wordCount: currentPaper.wordCount,
            referenceCount: currentPaper.referenceCount,
          },
          apiKey,
        }),
      }).then(r => r.json()).then(data => {
        if (!data.error) {
          setAdviceResult(data);
        }
      }).catch(() => {});
    }

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

      // Save draft snapshot for progress tracking
      addSnapshot(selectedModule, {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        moduleCode: selectedModule,
        wordCount: currentPaper.wordCount,
        scores: {
          readability: updatedResults.tone?.formalityScore ?? 0,
          grammar: updatedResults.grammar?.score ?? 0,
          citations: updatedResults.citations?.score ?? 0,
          similarity: updatedResults.plagiarism?.overallSimilarity ?? 0,
          aiRisk: updatedResults.aiRisk?.overallScore ?? 0,
          grade: updatedResults.grading?.totalScore ?? 0,
          overall: updatedResults.overall ?? 0,
        },
      });

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
          <TTSButton />
          <Button
            variant="outline"
            onClick={runQuickCheck}
            disabled={!currentPaper?.plainText || anyLoading || isQuickChecking}
            size="sm"
          >
            {isQuickChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {isQuickChecking ? "Checking..." : "Quick Check"}
          </Button>
          <Button
            onClick={runAllChecks}
            disabled={!currentPaper?.plainText || anyLoading || isQuickChecking}
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
            <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-50">
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
        <div className="w-full lg:w-[60%] shrink-0 overflow-y-auto lg:border-r p-4">
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

      {/* Writing Coach Chat */}
      <ChatPanel />
    </div>
  );
}
