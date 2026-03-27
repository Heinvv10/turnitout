"use client";

import { useMemo } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import { calculateReadability } from "@/lib/readability";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";

interface ChecklistItem {
  label: string;
  passed: boolean;
  value: string;
  available: boolean;
}

function buildChecklist(
  currentPaper: ReturnType<typeof usePaperStore.getState>["currentPaper"],
  analysisResults: ReturnType<typeof usePaperStore.getState>["analysisResults"],
  selectedModule: string,
  moduleOutlines: Record<string, { assessments?: { type: string; wordCount: string }[] }>,
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // 1. Word count meets target
  const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
  const activeAssessment = outline?.assessments?.find(
    (a: { type: string }) => a.type !== "Summative",
  );
  const wordCountReq = activeAssessment?.wordCount || "";
  const wordCountMatch = wordCountReq.match(/(\d+)\s*[-–]\s*(\d+)/);
  const minWords = wordCountMatch ? parseInt(wordCountMatch[1]) : null;
  const maxWords = wordCountMatch ? parseInt(wordCountMatch[2]) : null;
  const currentWords = currentPaper?.wordCount || 0;

  if (minWords && maxWords) {
    const inRange = currentWords >= minWords && currentWords <= maxWords;
    items.push({
      label: "Word count meets target",
      passed: inRange,
      value: `${currentWords} / ${minWords}–${maxWords}`,
      available: true,
    });
  } else {
    items.push({
      label: "Word count meets target",
      passed: false,
      value: "No target set",
      available: false,
    });
  }

  // 2. Readability score is academic level (FK > 12)
  const text = currentPaper?.plainText || "";
  if (text.length > 50) {
    const readability = calculateReadability(text);
    const fkGood = readability.fleschKincaid >= 12;
    items.push({
      label: "Readability is academic level (FK > 12)",
      passed: fkGood,
      value: `FK ${readability.fleschKincaid}`,
      available: true,
    });
  } else {
    items.push({
      label: "Readability is academic level (FK > 12)",
      passed: false,
      value: "No text",
      available: false,
    });
  }

  // 3. Grammar score above 70%
  if (analysisResults.grammar) {
    items.push({
      label: "Grammar score above 70%",
      passed: analysisResults.grammar.score >= 70,
      value: `${analysisResults.grammar.score}%`,
      available: true,
    });
  } else {
    items.push({
      label: "Grammar score above 70%",
      passed: false,
      value: "Not checked",
      available: false,
    });
  }

  // 4. Citations score above 70%
  if (analysisResults.citations) {
    items.push({
      label: "Citations score above 70%",
      passed: analysisResults.citations.score >= 70,
      value: `${analysisResults.citations.score}%`,
      available: true,
    });
  } else {
    items.push({
      label: "Citations score above 70%",
      passed: false,
      value: "Not checked",
      available: false,
    });
  }

  // 5. Originality score above 70% (if checked)
  if (analysisResults.plagiarism) {
    const originality = 100 - analysisResults.plagiarism.overallSimilarity;
    items.push({
      label: "Originality score above 70%",
      passed: originality >= 70,
      value: `${originality}%`,
      available: true,
    });
  }

  // 6. AI risk below 30% (if checked)
  if (analysisResults.aiRisk) {
    items.push({
      label: "AI risk below 30%",
      passed: analysisResults.aiRisk.overallScore < 30,
      value: `${analysisResults.aiRisk.overallScore}%`,
      available: true,
    });
  }

  // 7. Tone is academic (if checked)
  if (analysisResults.tone) {
    items.push({
      label: "Tone is academic",
      passed: analysisResults.tone.formalityScore >= 70,
      value: `${analysisResults.tone.formalityScore}%`,
      available: true,
    });
  }

  // 8. All in-text citations have matching references (if cross-check ran)
  if (analysisResults.citations) {
    const orphans = analysisResults.citations.issues.filter(
      (i) => i.type === "orphan_citation" || i.type === "orphan_reference",
    );
    items.push({
      label: "All citations match references",
      passed: orphans.length === 0,
      value: orphans.length === 0 ? "All matched" : `${orphans.length} unmatched`,
      available: true,
    });
  }

  return items;
}

export function SubmissionChecklist() {
  const { currentPaper, analysisResults } = usePaperStore();
  const { selectedModule, moduleOutlines } = useSettingsStore();

  const items = useMemo(
    () => buildChecklist(
      currentPaper,
      analysisResults,
      selectedModule,
      moduleOutlines as Record<string, { assessments?: { type: string; wordCount: string }[] }>,
    ),
    [currentPaper, analysisResults, selectedModule, moduleOutlines],
  );

  const availableItems = items.filter((i) => i.available);
  const passedCount = availableItems.filter((i) => i.passed).length;
  const failedCount = availableItems.filter((i) => !i.passed).length;
  const allPassed = failedCount === 0 && availableItems.length > 0;

  return (
    <div className="space-y-3">
      {/* Verdict header */}
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Submission Checklist</span>
        {availableItems.length > 0 && (
          <Badge
            variant={allPassed ? "default" : "destructive"}
            className="ml-auto text-xs"
          >
            {allPassed
              ? "Ready to Submit"
              : `${failedCount} item${failedCount !== 1 ? "s" : ""} need${failedCount === 1 ? "s" : ""} attention`}
          </Badge>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-1.5">
        {items.map((item) => {
          const StatusIcon = !item.available
            ? AlertCircle
            : item.passed
              ? CheckCircle
              : XCircle;
          const iconColor = !item.available
            ? "text-muted-foreground"
            : item.passed
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400";

          return (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-secondary/30"
            >
              <StatusIcon className={`h-4 w-4 shrink-0 ${iconColor}`} />
              <span className="flex-1 text-sm">{item.label}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      {availableItems.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {passedCount}/{availableItems.length} checks passed
        </p>
      )}
    </div>
  );
}
