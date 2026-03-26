"use client";

import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Hash,
} from "lucide-react";

export function ReadinessBadge() {
  const { currentPaper, analysisResults, resultsStale } = usePaperStore();
  const { selectedModule, moduleOutlines } = useSettingsStore();
  const { overall, trafficLight, aiRisk, citations, grading, plagiarism } =
    analysisResults;

  const hasAnyResults = aiRisk || citations || grading || plagiarism;

  // Get word count requirement from outline
  const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
  const activeAssessment = outline?.assessments?.find(
    (a) => a.type !== "Summative",
  );
  const wordCountReq = activeAssessment?.wordCount || "";
  const wordCountMatch = wordCountReq.match(/(\d+)\s*[-–]\s*(\d+)/);
  const minWords = wordCountMatch ? parseInt(wordCountMatch[1]) : null;
  const maxWords = wordCountMatch ? parseInt(wordCountMatch[2]) : null;
  const currentWords = currentPaper?.wordCount || 0;

  const wordCountStatus =
    minWords && maxWords
      ? currentWords < minWords
        ? "under"
        : currentWords > maxWords
          ? "over"
          : "ok"
      : null;

  if (!hasAnyResults) {
    return (
      <div className="space-y-2">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium">No checks run yet</p>
          <p className="text-xs">
            Write or paste your paper, then run the checks below
          </p>
        </div>
        {wordCountStatus && currentWords > 0 && (
          <WordCountBar
            current={currentWords}
            min={minWords!}
            max={maxWords!}
            status={wordCountStatus}
          />
        )}
      </div>
    );
  }

  const Icon =
    trafficLight === "green"
      ? CheckCircle
      : trafficLight === "yellow"
        ? AlertTriangle
        : XCircle;
  const colorClass =
    trafficLight === "green"
      ? "text-green-600 dark:text-green-400"
      : trafficLight === "yellow"
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";
  const bgClass =
    trafficLight === "green"
      ? "bg-green-50 dark:bg-green-950/30"
      : trafficLight === "yellow"
        ? "bg-yellow-50 dark:bg-yellow-950/30"
        : "bg-red-50 dark:bg-red-950/30";

  return (
    <div className="space-y-2">
      <div className={`rounded-lg p-3 ${bgClass}`}>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${colorClass}`}>
              Submission Readiness: {overall}%
            </p>
            {resultsStale && (
              <p className="text-xs text-muted-foreground">
                Text changed since last check — re-run analysis
              </p>
            )}
          </div>
          <Badge
            variant={
              trafficLight === "green"
                ? "default"
                : trafficLight === "yellow"
                  ? "secondary"
                  : "destructive"
            }
          >
            {trafficLight === "green"
              ? "Ready"
              : trafficLight === "yellow"
                ? "Review"
                : "Not Ready"}
          </Badge>
        </div>

        {/* Quick stats row */}
        <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
          {aiRisk && (
            <span>
              AI Risk: <strong>{aiRisk.overallScore}%</strong>
            </span>
          )}
          {plagiarism && (
            <span>
              Originality: <strong>{100 - plagiarism.overallSimilarity}%</strong>
            </span>
          )}
          {citations && (
            <span>
              Citations: <strong>{citations.score}%</strong>
            </span>
          )}
          {grading && (
            <span>
              Grade: <strong>{grading.totalScore}%</strong>
            </span>
          )}
          {analysisResults.grammar && (
            <span>
              Grammar: <strong>{analysisResults.grammar.score}%</strong>
            </span>
          )}
          {analysisResults.tone && (
            <span>
              Tone: <strong>{analysisResults.tone.formalityScore}%</strong>
            </span>
          )}
        </div>
      </div>

      {wordCountStatus && currentWords > 0 && (
        <WordCountBar
          current={currentWords}
          min={minWords!}
          max={maxWords!}
          status={wordCountStatus}
        />
      )}
    </div>
  );
}

function WordCountBar({
  current,
  min,
  max,
  status,
}: {
  current: number;
  min: number;
  max: number;
  status: "under" | "over" | "ok";
}) {
  const range = max - min;
  const tolerance = Math.round(range * 0.1); // 10% tolerance
  const displayMin = min - tolerance;
  const displayMax = max + tolerance;
  const displayRange = displayMax - displayMin;
  const pct = Math.min(
    100,
    Math.max(0, ((current - displayMin) / displayRange) * 100),
  );

  const color =
    status === "ok"
      ? "text-green-600 dark:text-green-400"
      : status === "under"
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";
  const barColor =
    status === "ok"
      ? "bg-green-500"
      : status === "under"
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Hash className="h-2.5 w-2.5" />
          Word Count
        </span>
        <span className={`text-xs font-medium ${color}`}>
          {current} / {min}–{max}
          {status === "under" && ` (need ${min - current} more)`}
          {status === "over" && ` (${current - max} over)`}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        {/* Green zone markers */}
        <div
          className="absolute top-0 h-full w-px bg-green-600/50"
          style={{
            left: `${((min - displayMin) / displayRange) * 100}%`,
          }}
        />
        <div
          className="absolute top-0 h-full w-px bg-green-600/50"
          style={{
            left: `${((max - displayMin) / displayRange) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
