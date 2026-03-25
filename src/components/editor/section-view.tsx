"use client";

import { usePaperStore } from "@/store/paper-store";
import { Badge } from "@/components/ui/badge";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export function SectionView() {
  const { sections, isSplitting } = usePaperStore();

  if (isSplitting || !sections) return null;

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
      <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        Detected Sections
      </p>
      {secs.map(({ label, text, color, badge }) => (
        <div
          key={label}
          className={`rounded border-l-[3px] px-3 py-2 ${color}`}
        >
          <div className="mb-1 flex items-center justify-between">
            <Badge className={`text-[9px] px-1.5 py-0 ${badge}`}>
              {label}
            </Badge>
            <span className="text-[9px] text-muted-foreground">
              {countWords(text)} words
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-foreground/80 line-clamp-3">
            {text.slice(0, 250)}
            {text.length > 250 && "..."}
          </p>
        </div>
      ))}
    </div>
  );
}
