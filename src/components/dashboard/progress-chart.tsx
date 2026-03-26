"use client";

import { useDraftHistoryStore } from "@/store/draft-history-store";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const SCORE_KEYS = [
  { key: "overall", label: "Overall", color: "bg-blue-500", inverted: false },
  { key: "grade", label: "Grade", color: "bg-purple-500", inverted: false },
  { key: "grammar", label: "Grammar", color: "bg-emerald-500", inverted: false },
  { key: "citations", label: "Citations", color: "bg-amber-500", inverted: false },
  { key: "aiRisk", label: "AI Risk", color: "bg-red-400", inverted: true },
  { key: "similarity", label: "Similarity", color: "bg-orange-400", inverted: true },
] as const;

export function ProgressChart({ moduleCode }: { moduleCode: string }) {
  const snapshots = useDraftHistoryStore((s) => s.getSnapshots(moduleCode));

  if (snapshots.length < 1) return null;

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const gradeFirst = first.scores.grade;
  const gradeLast = last.scores.grade;
  const gradeDiff = gradeLast - gradeFirst;

  const motivationalMessage =
    snapshots.length >= 2
      ? gradeDiff > 0
        ? `Your grade improved from ${gradeFirst}% to ${gradeLast}% across ${snapshots.length} drafts!`
        : gradeDiff === 0
          ? `Consistent at ${gradeLast}% across ${snapshots.length} drafts. Keep refining!`
          : `Grade went from ${gradeFirst}% to ${gradeLast}% across ${snapshots.length} drafts. Review the feedback.`
      : `First draft recorded at ${gradeLast}%. Run checks again after revisions to track progress.`;

  const TrendIcon =
    gradeDiff > 0 ? TrendingUp : gradeDiff < 0 ? TrendingDown : Minus;
  const trendColor =
    gradeDiff > 0
      ? "text-green-600 dark:text-green-400"
      : gradeDiff < 0
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Draft Progress</h4>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {snapshots.length} {snapshots.length === 1 ? "draft" : "drafts"}
        </div>
      </div>

      {/* Motivational message */}
      <p className="mb-4 text-xs text-muted-foreground">{motivationalMessage}</p>

      {/* Score bars per draft */}
      <div className="space-y-3">
        {SCORE_KEYS.map(({ key, label, color, inverted }) => {
          const values = snapshots.map((s) => s.scores[key as keyof typeof s.scores]);
          const maxVal = 100;

          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                  {inverted ? " (lower is better)" : ""}
                </span>
                {values.length >= 2 && (
                  <DiffBadge
                    from={values[0]}
                    to={values[values.length - 1]}
                    inverted={!!inverted}
                  />
                )}
              </div>
              <div className="flex items-end gap-[2px]" style={{ height: 24 }}>
                {values.map((val, i) => {
                  const pct = Math.max(2, Math.round((val / maxVal) * 100));
                  const isLast = i === values.length - 1;
                  return (
                    <div
                      key={`${key}-${i}`}
                      className="group relative flex-1"
                      style={{ height: "100%" }}
                    >
                      <div
                        className={`absolute bottom-0 w-full rounded-t-sm transition-all ${
                          isLast ? color : `${color} opacity-40`
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                      {/* Tooltip on hover */}
                      <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-1 py-0.5 text-[11px] text-popover-foreground opacity-0 shadow-sm group-hover:opacity-100">
                        D{i + 1}: {val}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Draft timeline */}
      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground/60">
        {snapshots.map((s, i) => (
          <span key={s.id}>D{i + 1}</span>
        ))}
      </div>
    </Card>
  );
}

function DiffBadge({
  from,
  to,
  inverted,
}: {
  from: number;
  to: number;
  inverted: boolean;
}) {
  const diff = to - from;
  if (diff === 0) return null;

  const improved = inverted ? diff < 0 : diff > 0;
  const color = improved
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <span className={`text-[11px] font-medium ${color}`}>
      {diff > 0 ? "+" : ""}
      {diff}%
    </span>
  );
}
