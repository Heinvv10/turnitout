"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import { Badge } from "@/components/ui/badge";
import { SubmissionChecklist } from "./submission-checklist";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Hash,
  FileDown,
} from "lucide-react";
import { MODULES } from "@/lib/constants";
import { generateReportPDF } from "@/lib/generate-report-pdf";

export function CompactStatusBar() {
  const [expanded, setExpanded] = useState(false);
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const analysisResults = usePaperStore((s) => s.analysisResults);
  const resultsStale = usePaperStore((s) => s.resultsStale);
  const selectedModule = useSettingsStore((s) => s.selectedModule);
  const selectedAssessment = useSettingsStore((s) => s.selectedAssessment);
  const moduleOutlines = useSettingsStore((s) => s.moduleOutlines);

  const { overall, trafficLight, aiRisk, citations, grading, plagiarism } =
    analysisResults;
  const hasAnyResults = !!(aiRisk || citations || grading || plagiarism);

  // Word count from outline
  const outline =
    moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
  const activeAssessment = selectedAssessment
    ? outline?.assessments?.find((a: { name: string }) => a.name === selectedAssessment)
    : outline?.assessments?.find((a: { type: string }) => a.type !== "Summative");
  const wordCountReq = activeAssessment?.wordCount || "";
  const wordCountMatch = wordCountReq.match(/(\d+)\s*[-–]\s*(\d+)/);
  const minWords = wordCountMatch ? parseInt(wordCountMatch[1]) : null;
  const maxWords = wordCountMatch ? parseInt(wordCountMatch[2]) : null;
  const currentWords = currentPaper?.wordCount || 0;

  const wordCountOk =
    minWords && maxWords
      ? currentWords >= minWords && currentWords <= maxWords
      : null;

  // Count completed checks
  const checkCount = [
    analysisResults.grammar,
    analysisResults.tone,
    analysisResults.citations,
    analysisResults.plagiarism,
    analysisResults.aiRisk,
    analysisResults.grading,
  ].filter(Boolean).length;

  // Readiness circle color
  const circleColor = !hasAnyResults
    ? "bg-muted text-muted-foreground"
    : trafficLight === "green"
      ? "bg-green-500 text-white"
      : trafficLight === "yellow"
        ? "bg-yellow-500 text-white"
        : "bg-red-500 text-white";

  const StatusIcon = !hasAnyResults
    ? Hash
    : trafficLight === "green"
      ? CheckCircle
      : trafficLight === "yellow"
        ? AlertTriangle
        : XCircle;

  const studentName = useSettingsStore((s) => s.studentName);
  const studentNumber = useSettingsStore((s) => s.studentNumber);
  const moduleName = MODULES.find((m) => m.code === selectedModule)?.name || selectedModule;

  const handleExportPDF = () => {
    generateReportPDF({
      studentName,
      studentNumber,
      moduleName,
      moduleCode: selectedModule,
      assessmentName: selectedAssessment || "—",
      essayTitle: currentPaper?.title || "Untitled",
      wordCount: currentWords,
      date: new Date().toLocaleDateString("en-ZA"),
      results: analysisResults,
    });
  };

  const label = !hasAnyResults
    ? "No checks yet"
    : trafficLight === "green"
      ? "Ready"
      : trafficLight === "yellow"
        ? "Review"
        : "Not Ready";

  return (
    <div className="border-b bg-card">
      {/* Compact bar */}
      <div className="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-3 cursor-pointer text-left"
          aria-expanded={expanded}
        >
          {/* Readiness circle */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${circleColor}`}
          >
            {hasAnyResults ? `${overall}%` : "—"}
          </div>

          {/* Status label + stale warning */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <StatusIcon className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{label}</span>
              {resultsStale && hasAnyResults && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Stale
                </Badge>
              )}
            </div>
            {hasAnyResults && (
              <p className="text-[11px] text-muted-foreground">
                {checkCount}/6 checks complete
              </p>
            )}
          </div>

          {/* Word count pill */}
          <div
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              wordCountOk === true
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                : wordCountOk === false
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {currentWords} words
          </div>
        </button>

        {/* PDF export — sibling of toggle, not nested */}
        {hasAnyResults && (
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
            title="Download PDF Report"
          >
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </button>
        )}

        {/* Expand chevron — also a sibling so clicking it still toggles */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expandable checklist */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t px-4 py-3">
          <SubmissionChecklist />
        </div>
      </div>
    </div>
  );
}
