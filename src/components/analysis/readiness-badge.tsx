"use client";

import { usePaperStore } from "@/store/paper-store";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function ReadinessBadge() {
  const { analysisResults, resultsStale } = usePaperStore();
  const { overall, trafficLight, aiRisk, citations, grading } =
    analysisResults;

  const hasAnyResults = aiRisk || citations || grading;

  if (!hasAnyResults) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        <p className="font-medium">No checks run yet</p>
        <p className="text-xs">
          Write or paste your paper, then run the checks below
        </p>
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
    <div className={`rounded-lg p-3 ${bgClass}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${colorClass}`}>
            Submission Readiness: {overall}%
          </p>
          {resultsStale && (
            <p className="text-xs text-muted-foreground">
              Text changed since last check - re-run analysis
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
    </div>
  );
}
