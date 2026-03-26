"use client";

import { useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { AIRiskPanel } from "./ai-risk-panel";
import { CitationPanel } from "./citation-panel";
import { GraderPanel } from "./grader-panel";
import { ReadinessBadge } from "./readiness-badge";
import { OriginalityPanel } from "./originality-panel";
import { ReadabilityPanel } from "./readability-panel";
import { TonePanel } from "./tone-panel";
import { AdvicePanel } from "./advice-panel";
import { GrammarPanel } from "./grammar-panel";
import { SourcesPanel } from "./sources-panel";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Fingerprint,
  Lightbulb,
  BarChart3,
  MessageSquare,
  SpellCheck,
  BookMarked,
  ChevronDown,
  PenLine,
  Scale,
  ClipboardCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TrafficColor = "green" | "yellow" | "red" | null;

function TrafficDot({ color }: { color: TrafficColor }) {
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

/** Return the worst traffic color among children: red > yellow > green > null */
function worstColor(colors: TrafficColor[]): TrafficColor {
  if (colors.includes("red")) return "red";
  if (colors.includes("yellow")) return "yellow";
  if (colors.includes("green")) return "green";
  return null;
}

interface SubItem {
  key: string;
  label: string;
  icon: LucideIcon;
  color: TrafficColor;
}

interface Group {
  key: string;
  label: string;
  icon: LucideIcon;
  items: SubItem[];
}

const PANELS: Record<string, React.ComponentType> = {
  readability: ReadabilityPanel,
  grammar: GrammarPanel,
  tone: TonePanel,
  citations: CitationPanel,
  originality: OriginalityPanel,
  "ai-risk": AIRiskPanel,
  grade: GraderPanel,
  advice: AdvicePanel,
  sources: SourcesPanel,
};

export function AnalysisTabs() {
  const { analysisResults, currentPaper } = usePaperStore();

  const readabilityDot: TrafficColor = currentPaper?.plainText ? "green" : null;
  const toneDot = analysisResults.tone?.trafficLight || null;
  const adviceDot: TrafficColor = analysisResults.advice ? "green" : null;

  const groups: Group[] = [
    {
      key: "writing",
      label: "Writing Quality",
      icon: PenLine,
      items: [
        { key: "readability", label: "Readability", icon: BarChart3, color: readabilityDot },
        { key: "grammar", label: "Grammar", icon: SpellCheck, color: analysisResults.grammar?.trafficLight || null },
        { key: "tone", label: "Tone", icon: MessageSquare, color: toneDot },
      ],
    },
    {
      key: "integrity",
      label: "Academic Integrity",
      icon: Scale,
      items: [
        { key: "citations", label: "Citations", icon: BookOpen, color: analysisResults.citations?.trafficLight || null },
        { key: "originality", label: "Originality", icon: Fingerprint, color: analysisResults.plagiarism?.trafficLight || null },
        { key: "ai-risk", label: "AI Risk", icon: ShieldCheck, color: analysisResults.aiRisk?.trafficLight || null },
      ],
    },
    {
      key: "assessment",
      label: "Assessment",
      icon: ClipboardCheck,
      items: [
        { key: "grade", label: "Grade", icon: GraduationCap, color: analysisResults.grading?.trafficLight || null },
        { key: "advice", label: "Advice", icon: Lightbulb, color: adviceDot },
        { key: "sources", label: "Sources", icon: BookMarked, color: null },
      ],
    },
  ];

  const [activeGroup, setActiveGroup] = useState<string | null>(groups[0].key);
  const [activePanel, setActivePanel] = useState<string>(groups[0].items[0].key);

  function handleGroupClick(groupKey: string) {
    if (activeGroup === groupKey) {
      setActiveGroup(null);
    } else {
      setActiveGroup(groupKey);
      // Auto-select first sub-item if the active panel isn't in this group
      const group = groups.find((g) => g.key === groupKey);
      if (group && !group.items.some((i) => i.key === activePanel)) {
        setActivePanel(group.items[0].key);
      }
    }
  }

  const PanelComponent = PANELS[activePanel];

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header with readiness badge + accordion nav */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="px-4 py-3">
          <ReadinessBadge />
        </div>

        <div className="space-y-1 px-3 pb-3">
          {groups.map((group) => {
            const groupColors = group.items.map((i) => i.color);
            const groupColor = worstColor(groupColors);
            const isExpanded = activeGroup === group.key;
            const GroupIcon = group.icon;

            return (
              <div key={group.key}>
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => handleGroupClick(group.key)}
                  className="flex w-full items-center justify-between rounded-xl p-3 cursor-pointer
                    bg-secondary/50 hover:bg-secondary transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{group.label}</span>
                    <TrafficDot color={groupColor} />
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200
                      ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Sub-items with smooth expand */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out
                    ${isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="flex flex-col gap-0.5 py-1 pl-4 pr-1">
                    {group.items.map((item) => {
                      const active = activePanel === item.key;
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setActivePanel(item.key)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                            transition-colors duration-150 cursor-pointer
                            ${active ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}
                        >
                          <ItemIcon className="h-3.5 w-3.5" />
                          {item.label}
                          <TrafficDot color={item.color} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {PanelComponent ? <PanelComponent /> : null}
      </div>
    </div>
  );
}
