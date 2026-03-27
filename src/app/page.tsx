"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { OnboardingModal } from "@/components/layout/onboarding-modal";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { OutlineGate } from "@/components/analysis/outline-gate";
import { FreeTierBanner } from "@/components/auth/free-tier-banner";
import { AuthGate } from "@/components/auth/auth-gate";
import { LockedPanel } from "@/components/auth/locked-panel";
import { PaperEditor } from "@/components/editor/paper-editor";
import { AnalysisTabs } from "@/components/analysis/analysis-tabs";
import { OfflineToast } from "@/components/ui/offline-toast";
import { useShallow } from "zustand/react/shallow";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { useHistoryStore } from "@/store/history-store";
import { useDraftHistoryStore } from "@/store/draft-history-store";
import { useOfflineQueueStore } from "@/store/offline-queue-store";
import { useOnlineStatus } from "@/hooks/use-online-status";
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
import { AcademizeButton } from "@/components/editor/academize-button";
import { safeFetch } from "@/lib/safe-fetch";
import { Loader2, PlayCircle, PanelRightOpen, Download, Eye, Settings2, Zap } from "lucide-react";

/** API check endpoint mappings for offline queue replay */
const API_CHECKS = [
  { type: "analyze-ai-risk", endpoint: "/api/analyze-ai-risk", key: "aiRisk" },
  { type: "check-citations", endpoint: "/api/check-citations", key: "citations" },
  { type: "grade-paper", endpoint: "/api/grade-paper", key: "grading" },
  { type: "check-plagiarism", endpoint: "/api/check-plagiarism", key: "plagiarism" },
  { type: "check-grammar", endpoint: "/api/check-grammar", key: "grammar" },
  { type: "check-tone", endpoint: "/api/check-tone", key: "tone" },
] as const;

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { currentPaper, analysisResults, isAnalyzing, sections } = usePaperStore(
    useShallow((s) => ({
      currentPaper: s.currentPaper,
      analysisResults: s.analysisResults,
      isAnalyzing: s.isAnalyzing,
      sections: s.sections,
    })),
  );
  const setAnalyzing = usePaperStore((s) => s.setAnalyzing);
  const setAIRiskResult = usePaperStore((s) => s.setAIRiskResult);
  const setCitationResult = usePaperStore((s) => s.setCitationResult);
  const setGradingResult = usePaperStore((s) => s.setGradingResult);
  const setPlagiarismResult = usePaperStore((s) => s.setPlagiarismResult);
  const setGrammarResult = usePaperStore((s) => s.setGrammarResult);
  const setToneResult = usePaperStore((s) => s.setToneResult);
  const setAdviceResult = usePaperStore((s) => s.setAdviceResult);
  const setPaper = usePaperStore((s) => s.setPaper);
  const setSections = usePaperStore((s) => s.setSections);
  const clearResults = usePaperStore((s) => s.clearResults);
  const { selectedModule, moduleOutlines, apiKey, gradingScale, referencingStyle, language, lowDataMode } = useSettingsStore(
    useShallow((s) => ({
      selectedModule: s.selectedModule,
      moduleOutlines: s.moduleOutlines,
      apiKey: s.apiKey,
      gradingScale: s.gradingScale,
      referencingStyle: s.referencingStyle,
      language: s.language,
      lowDataMode: s.lowDataMode,
    })),
  );
  const setSelectedModule = useSettingsStore((s) => s.setSelectedModule);
  const saveModulePaper = useSettingsStore((s) => s.saveModulePaper);
  const getModulePaper = useSettingsStore((s) => s.getModulePaper);
  const addEntry = useHistoryStore((s) => s.addEntry);
  const addSnapshot = useDraftHistoryStore((s) => s.addSnapshot);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const getQueue = useOfflineQueueStore((s) => s.getQueue);
  const clearQueue = useOfflineQueueStore((s) => s.clearQueue);
  const { isOnline } = useOnlineStatus();
  const searchParams = useSearchParams();
  const prevModuleRef = useRef(selectedModule);
  const wasOfflineRef = useRef(false);

  // Toast state for offline notifications
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "queued" | "reconnected" } | null>(null);

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

  /** Map a queued check type to the correct store setter */
  const applyCheckResult = useCallback((checkType: string, result: unknown) => {
    switch (checkType) {
      case "analyze-ai-risk":
        setAIRiskResult(result as Parameters<typeof setAIRiskResult>[0]);
        setAnalyzing("aiRisk", false);
        break;
      case "check-citations":
        setCitationResult(result as Parameters<typeof setCitationResult>[0]);
        setAnalyzing("citations", false);
        break;
      case "grade-paper":
        setGradingResult(result as Parameters<typeof setGradingResult>[0]);
        setAnalyzing("grading", false);
        break;
      case "check-plagiarism":
        setPlagiarismResult(result as Parameters<typeof setPlagiarismResult>[0]);
        setAnalyzing("plagiarism", false);
        break;
      case "check-grammar":
        setGrammarResult(result as Parameters<typeof setGrammarResult>[0]);
        setAnalyzing("grammar", false);
        break;
      case "check-tone":
        setToneResult(result as Parameters<typeof setToneResult>[0]);
        break;
    }
  }, [setAIRiskResult, setCitationResult, setGradingResult, setPlagiarismResult, setGrammarResult, setToneResult, setAnalyzing]);

  /** Replay all queued checks when back online */
  const processQueue = useCallback(async () => {
    const pending = getQueue();
    if (pending.length === 0) return;

    setToastMsg({ message: "Back online! Running queued checks...", type: "reconnected" });

    const analyzeKeys = ["aiRisk", "citations", "grading", "plagiarism", "grammar"] as const;
    type AnalyzeKey = typeof analyzeKeys[number];

    for (const item of pending) {
      const check = API_CHECKS.find(c => c.type === item.type);
      if (!check) continue;
      const isAnalyzable = analyzeKeys.includes(check.key as AnalyzeKey);
      if (isAnalyzable) setAnalyzing(check.key as AnalyzeKey, true);
      try {
        const result = await safeFetch(check.endpoint, item.payload as Record<string, unknown>);
        applyCheckResult(item.type, result);
      } catch {
        if (isAnalyzable) setAnalyzing(check.key as AnalyzeKey, false);
      }
    }

    clearQueue();
  }, [getQueue, clearQueue, applyCheckResult, setAnalyzing]);

  // Auto-process queue when coming back online
  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }
    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      processQueue();
    }
  }, [isOnline, processQueue]);

  const anyLoading =
    isAnalyzing.aiRisk || isAnalyzing.citations || isAnalyzing.grading || isAnalyzing.plagiarism || isAnalyzing.grammar;

  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateFeature, setAuthGateFeature] = useState("");

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

    // Quick check requires network — queue if offline
    if (!isOnline) {
      const body = buildRequestBody();
      enqueue("check-grammar", body);
      enqueue("check-citations", body);
      setToastMsg({ message: "Local checks complete. API checks queued for when you're back online.", type: "queued" });
      return;
    }

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

    // Offline: queue all API checks, local panels auto-update from store
    if (!isOnline) {
      for (const check of API_CHECKS) {
        enqueue(check.type, body);
      }
      setToastMsg({ message: "Local checks complete. API checks queued for when you're back online.", type: "queued" });
      return;
    }

    // In low-data mode, only run grammar + citations (no AI API calls)
    if (lowDataMode) {
      setAnalyzing("grammar", true);
      setAnalyzing("citations", true);

      const lightPromises = [
        safeFetch("/api/check-grammar", body).then(v => { setGrammarResult(v as Parameters<typeof setGrammarResult>[0]); setAnalyzing("grammar", false); }),
        safeFetch("/api/check-citations", body).then(v => { setCitationResult(v as Parameters<typeof setCitationResult>[0]); setAnalyzing("citations", false); }),
      ];

      await Promise.allSettled(lightPromises.map(p => p.catch(() => {})));
      setAnalyzing("grammar", false);
      setAnalyzing("citations", false);
    } else {
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
        }).catch(() => {});
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
      <OfflineBanner isOnline={isOnline} />
      {!isAuthenticated && <FreeTierBanner />}
      <AuthGate
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        feature={authGateFeature}
      />
      <OutlineGate />

      <div className="flex items-center justify-between border-b px-4 py-2">
        <p className="text-sm text-muted-foreground">
          {currentPaper
            ? `${currentPaper.wordCount} words`
            : "Start writing to begin"}
        </p>
        <div className="flex items-center gap-2">
          <TTSButton />
          <AcademizeButton />
          <Button
            variant="outline"
            onClick={() => {
              if (!isAuthenticated) {
                setAuthGateFeature("Quick Check");
                setAuthGateOpen(true);
                return;
              }
              runQuickCheck();
            }}
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
            onClick={() => {
              if (!isAuthenticated) {
                setAuthGateFeature("Run All Checks");
                setAuthGateOpen(true);
                return;
              }
              runAllChecks();
            }}
            disabled={!currentPaper?.plainText || anyLoading || isQuickChecking}
            size="sm"
          >
            {anyLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {lowDataMode ? "Run Light Checks" : "Run All Checks"}
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
          {isAuthenticated ? <AnalysisTabs /> : <LockedPanel />}
        </div>

        {/* Analysis Panel - Mobile (Sheet) */}
        <div className="fixed bottom-4 right-4 lg:hidden z-50">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <PanelRightOpen className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto p-0">
              {isAuthenticated ? <AnalysisTabs /> : <LockedPanel />}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Writing Coach Chat */}
      <ChatPanel />

      {/* Offline toast notifications */}
      {toastMsg && (
        <OfflineToast
          message={toastMsg.message}
          type={toastMsg.type}
          onDismiss={() => setToastMsg(null)}
        />
      )}
    </div>
  );
}
