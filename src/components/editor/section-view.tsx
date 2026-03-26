"use client";

import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { Badge } from "@/components/ui/badge";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/** Parse word count string like "1000-1200" into [min, max] */
function parseWordCountRange(wc: string): [number, number] | null {
  const match = wc.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return [parseInt(match[1], 10), parseInt(match[2], 10)];
  const single = wc.match(/^(\d+)$/);
  if (single) {
    const n = parseInt(single[1], 10);
    return [n, n];
  }
  return null;
}

interface SectionTarget {
  min: number;
  max: number;
}

/** Calculate section word targets based on academic conventions */
function getSectionTargets(totalMin: number, totalMax: number): Record<string, SectionTarget> {
  return {
    Introduction: { min: Math.round(totalMin * 0.10), max: Math.round(totalMax * 0.15) },
    Body: { min: Math.round(totalMin * 0.70), max: Math.round(totalMax * 0.80) },
    Conclusion: { min: Math.round(totalMin * 0.10), max: Math.round(totalMax * 0.15) },
  };
}

function getProgressColor(wordCount: number, target: SectionTarget): "green" | "yellow" | "red" {
  if (wordCount >= target.min && wordCount <= target.max) return "green";
  const range = target.max - target.min;
  const tolerance = Math.max(range * 0.2, target.min * 0.2);
  if (wordCount < target.min && target.min - wordCount <= tolerance) return "yellow";
  if (wordCount > target.max && wordCount - target.max <= tolerance) return "yellow";
  return "red";
}

function getStatusText(wordCount: number, target: SectionTarget): string {
  if (wordCount >= target.min && wordCount <= target.max) return "On target";
  if (wordCount < target.min) return `${target.min - wordCount}w short`;
  return `${wordCount - target.max}w over`;
}

const progressBarColors = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
} as const;

export function SectionView() {
  const { sections, isSplitting, currentPaper } = usePaperStore();
  const { selectedModule, moduleOutlines } = useSettingsStore();

  if (isSplitting || !sections) return null;

  // Determine total word count target from module outline or rubric
  let totalRange: [number, number] | null = null;

  // Try uploaded module outline first
  const outline = moduleOutlines[selectedModule];
  if (outline?.assessments?.[0]?.wordCount) {
    totalRange = parseWordCountRange(outline.assessments[0].wordCount);
  }
  // Fall back to MODULE_RUBRICS
  if (!totalRange) {
    const rubric = MODULE_RUBRICS[selectedModule];
    if (rubric?.assessments?.[0]?.wordCount) {
      totalRange = parseWordCountRange(rubric.assessments[0].wordCount);
    }
  }

  const sectionTargets = totalRange ? getSectionTargets(totalRange[0], totalRange[1]) : null;

  const secs = [
    {
      label: "Introduction",
      text: sections.introduction,
      color: "border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/10",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      label: "Body",
      text: sections.body,
      color: "border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10",
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    },
    {
      label: "Conclusion",
      text: sections.conclusion,
      color: "border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/10",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
  ].filter((s) => s.text.trim().length > 0);

  if (secs.length === 0) return null;

  return (
    <div className="space-y-1 border-t bg-muted/20 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Detected Sections
      </p>
      {secs.map(({ label, text, color, badge }) => {
        const wc = countWords(text);
        const target = sectionTargets?.[label] ?? null;
        const progressColor = target ? getProgressColor(wc, target) : null;
        const statusText = target ? getStatusText(wc, target) : null;
        const progressPct = target
          ? Math.min(100, Math.round((wc / target.max) * 100))
          : null;
        // Marker position for the min target on the progress bar
        const minMarkerPct = target
          ? Math.min(100, Math.round((target.min / target.max) * 100))
          : null;

        return (
          <div
            key={label}
            className={`rounded border-l-[3px] px-3 py-2 ${color}`}
          >
            <div className="mb-1 flex items-center justify-between">
              <Badge className={`text-[11px] px-1.5 py-0 ${badge}`}>
                {label}
              </Badge>
              <div className="flex items-center gap-2">
                {target && (
                  <span className="text-[11px] text-muted-foreground/70">
                    {target.min}-{target.max}w
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {wc} words
                </span>
              </div>
            </div>

            {/* Progress bar with target */}
            {target && progressColor && progressPct !== null && (
              <div className="mb-1.5">
                <div className="relative h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${progressBarColors[progressColor]}`}
                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                  />
                  {/* Min target marker */}
                  {minMarkerPct !== null && (
                    <div
                      className="absolute inset-y-0 w-px bg-foreground/30"
                      style={{ left: `${minMarkerPct}%` }}
                    />
                  )}
                </div>
                <div className="mt-0.5 flex justify-end">
                  <span
                    className={`text-[11px] font-medium ${
                      progressColor === "green"
                        ? "text-green-600 dark:text-green-400"
                        : progressColor === "yellow"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-foreground/80 line-clamp-3">
              {text.slice(0, 250)}
              {text.length > 250 && "..."}
            </p>
          </div>
        );
      })}
    </div>
  );
}
