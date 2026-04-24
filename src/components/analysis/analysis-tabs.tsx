"use client";

import { useMemo } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { detectAfrikaans } from "@/lib/afrikaans-patterns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CompactStatusBar } from "./compact-status-bar";
import { ScoreGrid } from "./score-grid";
import { AdvicePanel } from "./advice-panel";
import { GrammarPanel } from "./grammar-panel";
import { TonePanel } from "./tone-panel";
import { AIRiskPanel } from "./ai-risk-panel";
import { CitationPanel } from "./citation-panel";
import { AcademizeButton } from "@/components/editor/academize-button";
import { TTSButton } from "@/components/editor/tts-button";
import { CitationGenerator } from "./citation-generator";
import { PhrasebankPanel } from "./phrasebank-panel";
import { PeerReviewPanel } from "./peer-review-panel";
import { RubricBrowser } from "./rubric-browser";
import { ESLGrammarPanel } from "./esl-grammar-panel";
import { VocabularyPanel } from "./vocabulary-panel";
import { ProvenancePanel } from "./provenance-panel";
import { SourcesPanel } from "./sources-panel";
import { SelfPlagiarismPanel } from "./self-plagiarism-panel";
import { AfrikaansPanel } from "./afrikaans-panel";
import {
  AlertTriangle,
  BarChart3,
  Wrench,
  BookOpen,
} from "lucide-react";

interface AnalysisTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AnalysisTabs({ activeTab, onTabChange }: AnalysisTabsProps) {
  const analysisResults = usePaperStore((s) => s.analysisResults);
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const language = useSettingsStore((s) => s.language);

  const showAfrikaans = useMemo(() => {
    if (language === "af" || language === "af-ZA") return true;
    if (currentPaper?.plainText) {
      return detectAfrikaans(currentPaper.plainText) >= 0.15;
    }
    return false;
  }, [language, currentPaper?.plainText]);

  // Count issues needing attention for the Fix tab badge
  const issueCount = useMemo(() => {
    let count = 0;
    if (analysisResults.grammar?.issues) count += analysisResults.grammar.issues.length;
    if (analysisResults.citations?.issues) count += analysisResults.citations.issues.length;
    if (analysisResults.aiRisk && analysisResults.aiRisk.overallScore >= 30) count += 1;
    if (analysisResults.tone && analysisResults.tone.formalityScore < 70) count += 1;
    return count;
  }, [analysisResults]);

  const hasResults = !!(
    analysisResults.aiRisk ||
    analysisResults.citations ||
    analysisResults.grading ||
    analysisResults.plagiarism ||
    analysisResults.grammar ||
    analysisResults.tone
  );

  return (
    <div className="flex h-full flex-col">
      <CompactStatusBar />

      <Tabs
        value={activeTab || "scores"}
        onValueChange={(value) => onTabChange?.(value as string)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="sticky top-0 z-10 bg-card border-b px-2 pt-2">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="fix" className="flex-1 gap-1 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fix</span>
              {issueCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {issueCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="scores" className="flex-1 gap-1 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Scores</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex-1 gap-1 text-xs">
              <Wrench className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex-1 gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Fix Tab — "What do I need to fix?" */}
          <TabsContent value="fix" className="p-4 space-y-4">
            {!hasResults && !analysisResults.advice ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <AlertTriangle className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Run your checks first to see what needs fixing.
                </p>
              </div>
            ) : (
              <>
                <AdvicePanel />
                {/* Show individual issue panels below advice if they have issues */}
                {analysisResults.grammar &&
                  analysisResults.grammar.issues?.length > 0 && (
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium hover:bg-secondary">
                        Grammar Issues ({analysisResults.grammar.issues.length})
                      </summary>
                      <div className="mt-2 animate-fade-in-up">
                        <GrammarPanel />
                      </div>
                    </details>
                  )}
                {analysisResults.tone &&
                  analysisResults.tone.formalityScore < 70 && (
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium hover:bg-secondary">
                        Tone Issues (formality {analysisResults.tone.formalityScore}%)
                      </summary>
                      <div className="mt-2 animate-fade-in-up">
                        <TonePanel />
                      </div>
                    </details>
                  )}
                {analysisResults.aiRisk &&
                  analysisResults.aiRisk.overallScore >= 30 && (
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium hover:bg-secondary">
                        AI Risk Flags ({analysisResults.aiRisk.overallScore}%)
                      </summary>
                      <div className="mt-2 animate-fade-in-up">
                        <AIRiskPanel />
                      </div>
                    </details>
                  )}
                {analysisResults.citations &&
                  analysisResults.citations.issues?.length > 0 && (
                    <details className="group">
                      <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-medium hover:bg-secondary">
                        Citation Issues ({analysisResults.citations.issues.length})
                      </summary>
                      <div className="mt-2 animate-fade-in-up">
                        <CitationPanel />
                      </div>
                    </details>
                  )}
              </>
            )}
          </TabsContent>

          {/* Scores Tab — "How did I do?" */}
          <TabsContent value="scores" className="p-4">
            <ScoreGrid />
          </TabsContent>

          {/* Tools Tab — "I need to do something" */}
          <TabsContent value="tools" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center">
                <AcademizeButton />
                <span className="text-[10px] text-muted-foreground">
                  Improve tone
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center">
                <TTSButton />
                <span className="text-[10px] text-muted-foreground">
                  Listen to essay
                </span>
              </div>
            </div>
            <ToolSection title="Cite a Source">
              <CitationGenerator />
            </ToolSection>
            <ToolSection title="Academic Phrasebank">
              <PhrasebankPanel />
            </ToolSection>
            <ToolSection title="Peer Review">
              <PeerReviewPanel />
            </ToolSection>
          </TabsContent>

          {/* Learn Tab — "I need to look something up" */}
          <TabsContent value="learn" className="p-4 space-y-4">
            <LearnSection title="Module Rubric">
              <RubricBrowser />
            </LearnSection>
            <LearnSection title="ESL Tips">
              <ESLGrammarPanel />
            </LearnSection>
            <LearnSection title="Vocabulary Analysis">
              <VocabularyPanel />
            </LearnSection>
            <LearnSection title="Suggested Sources">
              <SourcesPanel />
            </LearnSection>
            <LearnSection title="Writing Log">
              <ProvenancePanel />
            </LearnSection>
            <LearnSection title="Self-Plagiarism Check">
              <SelfPlagiarismPanel />
            </LearnSection>
            {showAfrikaans && (
              <LearnSection title="Afrikaans Patterns">
                <AfrikaansPanel />
              </LearnSection>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/** Collapsible section for Tools tab */
function ToolSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group" open>
      <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm font-semibold hover:bg-secondary">
        {title}
      </summary>
      <div className="mt-2 animate-fade-in-up">{children}</div>
    </details>
  );
}

/** Collapsible section for Learn tab */
function LearnSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm font-semibold hover:bg-secondary">
        {title}
      </summary>
      <div className="mt-2 animate-fade-in-up">{children}</div>
    </details>
  );
}
