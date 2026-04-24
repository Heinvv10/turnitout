"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  SpellCheck,
  MessageSquare,
  BookOpen,
  Fingerprint,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Lazy imports for full panels
import { ReadabilityPanel } from "./readability-panel";
import { GrammarPanel } from "./grammar-panel";
import { TonePanel } from "./tone-panel";
import { CitationPanel } from "./citation-panel";
import { OriginalityPanel } from "./originality-panel";
import { AIRiskPanel } from "./ai-risk-panel";
import { GraderPanel } from "./grader-panel";

type TrafficColor = "green" | "yellow" | "red" | null;

interface ScoreCardData {
  key: string;
  label: string;
  icon: LucideIcon;
  score: number | null;
  traffic: TrafficColor;
  detail: string;
  panel: React.ComponentType;
}

function ScoreCard({
  data,
  expanded,
  onToggle,
}: {
  data: ScoreCardData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = data.icon;
  const dotColor =
    data.traffic === "green"
      ? "bg-green-500"
      : data.traffic === "yellow"
        ? "bg-yellow-500"
        : data.traffic === "red"
          ? "bg-red-500"
          : "bg-muted";

  const barColor =
    data.traffic === "green"
      ? "bg-green-500"
      : data.traffic === "yellow"
        ? "bg-yellow-500"
        : data.traffic === "red"
          ? "bg-red-500"
          : "bg-muted-foreground/20";

  const Panel = data.panel;

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 ${
        expanded ? "col-span-2" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 p-3 text-left transition-colors hover:bg-muted/50 cursor-pointer"
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">{data.label}</span>
        <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-sm font-bold tabular-nums">
          {data.score !== null ? `${data.score}%` : "—"}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Mini progress bar */}
      {!expanded && data.score !== null && (
        <div className="px-3 pb-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(100, data.score)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {data.detail}
          </p>
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t p-4 animate-fade-in-up">
          <Panel />
        </div>
      )}
    </Card>
  );
}

export function ScoreGrid() {
  const analysisResults = usePaperStore((s) => s.analysisResults);
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const cards: ScoreCardData[] = [
    {
      key: "readability",
      label: "Readability",
      icon: BarChart3,
      score: currentPaper?.plainText ? 100 : null,
      traffic: currentPaper?.plainText ? "green" : null,
      detail: "Auto-calculated — higher is better",
      panel: ReadabilityPanel,
    },
    {
      key: "grammar",
      label: "Grammar",
      icon: SpellCheck,
      score: analysisResults.grammar?.score ?? null,
      traffic: analysisResults.grammar?.trafficLight || null,
      detail: analysisResults.grammar
        ? `${analysisResults.grammar.issues?.length || 0} issues — higher % = fewer errors`
        : "Higher is better — aim for 80%+",
      panel: GrammarPanel,
    },
    {
      key: "tone",
      label: "Tone",
      icon: MessageSquare,
      score: analysisResults.tone?.formalityScore ?? null,
      traffic: analysisResults.tone?.trafficLight || null,
      detail: analysisResults.tone
        ? `${analysisResults.tone.formalityScore}% formal — higher = more academic`
        : "Higher is better — aim for 70%+",
      panel: TonePanel,
    },
    {
      key: "citations",
      label: "Citations",
      icon: BookOpen,
      score: analysisResults.citations?.score ?? null,
      traffic: analysisResults.citations?.trafficLight || null,
      detail: analysisResults.citations
        ? `${analysisResults.citations.issues?.length || 0} issues — higher % = better formatting`
        : "Higher is better — aim for 80%+",
      panel: CitationPanel,
    },
    {
      key: "originality",
      label: "Originality",
      icon: Fingerprint,
      score: analysisResults.plagiarism
        ? 100 - analysisResults.plagiarism.overallSimilarity
        : null,
      traffic: analysisResults.plagiarism?.trafficLight || null,
      detail: analysisResults.plagiarism
        ? `${analysisResults.plagiarism.overallSimilarity}% matched other texts — higher originality = better`
        : "Higher is better — shows your work is original",
      panel: OriginalityPanel,
    },
    {
      key: "ai-risk",
      label: "AI Risk",
      icon: ShieldCheck,
      score: analysisResults.aiRisk
        ? 100 - analysisResults.aiRisk.overallScore
        : null,
      traffic: analysisResults.aiRisk?.trafficLight || null,
      detail: analysisResults.aiRisk
        ? `${analysisResults.aiRisk.overallScore}% looks AI-written — lower AI risk = better`
        : "Lower AI risk is better — shows it's your own work",
      panel: AIRiskPanel,
    },
    {
      key: "grade",
      label: "Grade",
      icon: GraduationCap,
      score: analysisResults.grading?.totalScore ?? null,
      traffic: analysisResults.grading?.trafficLight || null,
      detail: analysisResults.grading
        ? `SA Grade: ${analysisResults.grading.saGrade || "—"} — higher = better mark`
        : "Higher is better — estimated mark",
      panel: GraderPanel,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((card) => (
        <ScoreCard
          key={card.key}
          data={card}
          expanded={expandedKey === card.key}
          onToggle={() =>
            setExpandedKey((k) => (k === card.key ? null : card.key))
          }
        />
      ))}
    </div>
  );
}
