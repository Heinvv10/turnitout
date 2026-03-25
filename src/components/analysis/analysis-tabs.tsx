"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaperStore } from "@/store/paper-store";
import { AIRiskPanel } from "./ai-risk-panel";
import { CitationPanel } from "./citation-panel";
import { GraderPanel } from "./grader-panel";
import { ReadinessBadge } from "./readiness-badge";
import { PlagiarismPanel } from "./plagiarism-panel";
import { AdvicePanel } from "./advice-panel";
import { TemplateExport } from "@/components/template/template-export";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  FileOutput,
  Search,
  Lightbulb,
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
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <ReadinessBadge />
      </div>
      <Tabs defaultValue="ai-risk" className="flex flex-1 flex-col">
        <div className="overflow-x-auto border-b">
          <TabsList className="inline-flex w-max min-w-full justify-start rounded-none bg-transparent px-2">
            <TabsTrigger value="ai-risk" className="gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" />
              AI Risk
              <TrafficDot
                color={analysisResults.aiRisk?.trafficLight || null}
              />
            </TabsTrigger>
            <TabsTrigger value="plagiarism" className="gap-1 text-xs">
              <Search className="h-3 w-3" />
              Similarity
              <TrafficDot
                color={analysisResults.plagiarism?.trafficLight || null}
              />
            </TabsTrigger>
            <TabsTrigger value="citations" className="gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              Citations
              <TrafficDot
                color={analysisResults.citations?.trafficLight || null}
              />
            </TabsTrigger>
            <TabsTrigger value="grade" className="gap-1 text-xs">
              <GraduationCap className="h-3 w-3" />
              Grade
              <TrafficDot
                color={analysisResults.grading?.trafficLight || null}
              />
            </TabsTrigger>
            <TabsTrigger value="advice" className="gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              Advice
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="gap-1 text-xs bg-primary/5 font-medium"
            >
              <FileOutput className="h-3 w-3" />
              Export .docx
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="ai-risk" className="flex-1 overflow-y-auto p-4">
          <AIRiskPanel />
        </TabsContent>
        <TabsContent
          value="plagiarism"
          className="flex-1 overflow-y-auto p-4"
        >
          <PlagiarismPanel />
        </TabsContent>
        <TabsContent value="citations" className="flex-1 overflow-y-auto p-4">
          <CitationPanel />
        </TabsContent>
        <TabsContent value="grade" className="flex-1 overflow-y-auto p-4">
          <GraderPanel />
        </TabsContent>
        <TabsContent value="advice" className="flex-1 overflow-y-auto p-4">
          <AdvicePanel />
        </TabsContent>
        <TabsContent value="export" className="flex-1 overflow-y-auto">
          <TemplateExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
