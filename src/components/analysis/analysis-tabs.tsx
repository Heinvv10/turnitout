"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaperStore } from "@/store/paper-store";
import { AIRiskPanel } from "./ai-risk-panel";
import { CitationPanel } from "./citation-panel";
import { GraderPanel } from "./grader-panel";
import { ReadinessBadge } from "./readiness-badge";
import { PlagiarismPanel } from "./plagiarism-panel";
import { ReadabilityPanel } from "./readability-panel";
import { TonePanel } from "./tone-panel";
import { AdvicePanel } from "./advice-panel";
import { GrammarPanel } from "./grammar-panel";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Search,
  Lightbulb,
  BarChart3,
  MessageSquare,
  SpellCheck,
} from "lucide-react";

function TrafficDot({ color }: { color: "green" | "yellow" | "red" | null }) {
  if (!color) return null;
  const colorClass =
    color === "green"
      ? "bg-green-500"
      : color === "yellow"
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} />
  );
}

export function AnalysisTabs() {
  const { analysisResults } = usePaperStore();

  return (
    <Tabs defaultValue="ai-risk" className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="px-4 py-3">
          <ReadinessBadge />
        </div>
        <div className="overflow-x-auto border-t">
          <TabsList className="inline-flex w-max min-w-full justify-start rounded-none bg-transparent px-2">
            <TabsTrigger value="ai-risk" className="gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" />
              AI Risk
              <TrafficDot color={analysisResults.aiRisk?.trafficLight || null} />
            </TabsTrigger>
            <TabsTrigger value="plagiarism" className="gap-1 text-xs">
              <Search className="h-3 w-3" />
              Similarity
              <TrafficDot color={analysisResults.plagiarism?.trafficLight || null} />
            </TabsTrigger>
            <TabsTrigger value="citations" className="gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              Citations
              <TrafficDot color={analysisResults.citations?.trafficLight || null} />
            </TabsTrigger>
            <TabsTrigger value="grade" className="gap-1 text-xs">
              <GraduationCap className="h-3 w-3" />
              Grade
              <TrafficDot color={analysisResults.grading?.trafficLight || null} />
            </TabsTrigger>
            <TabsTrigger value="readability" className="gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Readability
            </TabsTrigger>
            <TabsTrigger value="tone" className="gap-1 text-xs">
              <MessageSquare className="h-3 w-3" />
              Tone
            </TabsTrigger>
            <TabsTrigger value="advice" className="gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              Advice
            </TabsTrigger>
            <TabsTrigger value="grammar" className="gap-1 text-xs">
              <SpellCheck className="h-3 w-3" />
              Grammar
              <TrafficDot color={analysisResults.grammar?.trafficLight || null} />
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="ai-risk" className="p-4">
          <AIRiskPanel />
        </TabsContent>
        <TabsContent value="plagiarism" className="p-4">
          <PlagiarismPanel />
        </TabsContent>
        <TabsContent value="citations" className="p-4">
          <CitationPanel />
        </TabsContent>
        <TabsContent value="grade" className="p-4">
          <GraderPanel />
        </TabsContent>
        <TabsContent value="readability" className="p-4">
          <ReadabilityPanel />
        </TabsContent>
        <TabsContent value="tone" className="p-4">
          <TonePanel />
        </TabsContent>
        <TabsContent value="advice" className="p-4">
          <AdvicePanel />
        </TabsContent>
        <TabsContent value="grammar" className="p-4">
          <GrammarPanel />
        </TabsContent>
      </div>
    </Tabs>
  );
}
