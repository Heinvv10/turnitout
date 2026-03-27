"use client";

import { useState, useMemo } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { detectAfrikaans } from "@/lib/afrikaans-patterns";
import { AIRiskPanel } from "./ai-risk-panel";
import { CitationPanel } from "./citation-panel";
import { GraderPanel } from "./grader-panel";
import { ReadinessBadge } from "./readiness-badge";
import { SubmissionChecklist } from "./submission-checklist";
import { OriginalityPanel } from "./originality-panel";
import { ReadabilityPanel } from "./readability-panel";
import { TonePanel } from "./tone-panel";
import { VocabularyPanel } from "./vocabulary-panel";
import { AdvicePanel } from "./advice-panel";
import { GrammarPanel } from "./grammar-panel";
import { ESLGrammarPanel } from "./esl-grammar-panel";
import { AfrikaansPanel } from "./afrikaans-panel";
import { SourcesPanel } from "./sources-panel";
import { PhrasebankPanel } from "./phrasebank-panel";
import { CitationGenerator } from "./citation-generator";
import { ProvenancePanel } from "./provenance-panel";
import { SelfPlagiarismPanel } from "./self-plagiarism-panel";
import { RubricBrowser } from "./rubric-browser";
import { PeerReviewPanel } from "./peer-review-panel";
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
  BookText,
  BookA,
  ChevronDown,
  PenLine,
  Scale,
  ClipboardCheck,
  Quote,
  History,
  FileScan,
  Languages,
  FileSpreadsheet,
  Users,
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
  vocabulary: VocabularyPanel,
  citations: CitationPanel,
  originality: OriginalityPanel,
  "ai-risk": AIRiskPanel,
  grade: GraderPanel,
  advice: AdvicePanel,
  sources: SourcesPanel,
  phrasebank: PhrasebankPanel,
  "citation-gen": CitationGenerator,
  provenance: ProvenancePanel,
  "self-plagiarism": SelfPlagiarismPanel,
  "esl-tips": ESLGrammarPanel,
  afrikaans: AfrikaansPanel,
  rubric: RubricBrowser,
  "peer-review": PeerReviewPanel,
};

export function AnalysisTabs() {
  const analysisResults = usePaperStore((s) => s.analysisResults);
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const language = useSettingsStore((s) => s.language);

  const showAfrikaans = useMemo(() => {
    if (language === "af" || language === "af-ZA") return true;
    if (currentPaper?.plainText) {
      return detectAfrikaans(currentPaper.plainText) >= 0.15;
    }
    return false;
  }, [language, currentPaper?.plainText]);

  const readabilityDot: TrafficColor = currentPaper?.plainText ? "green" : null;
  const toneDot = analysisResults.tone?.trafficLight || null;
  const adviceDot: TrafficColor = analysisResults.advice ? "green" : null;

  const writingItems: SubItem[] = [
    { key: "readability", label: "Readability", icon: BarChart3, color: readabilityDot },
    { key: "grammar", label: "Grammar", icon: SpellCheck, color: analysisResults.grammar?.trafficLight || null },
    { key: "tone", label: "Tone", icon: MessageSquare, color: toneDot },
    { key: "vocabulary", label: "Vocabulary", icon: BookA, color: null },
    { key: "esl-tips", label: "ESL Tips", icon: Languages, color: null },
  ];
  if (showAfrikaans) {
    writingItems.push({ key: "afrikaans", label: "Afrikaans", icon: Languages, color: null });
  }

  const groups: Group[] = [
    {
      key: "writing",
      label: "Writing Quality",
      icon: PenLine,
      items: writingItems,
    },
    {
      key: "integrity",
      label: "Academic Integrity",
      icon: Scale,
      items: [
        { key: "citations", label: "Citations", icon: BookOpen, color: analysisResults.citations?.trafficLight || null },
        { key: "originality", label: "Originality", icon: Fingerprint, color: analysisResults.plagiarism?.trafficLight || null },
        { key: "ai-risk", label: "AI Risk", icon: ShieldCheck, color: analysisResults.aiRisk?.trafficLight || null },
        { key: "citation-gen", label: "Cite Source", icon: Quote, color: null },
        { key: "self-plagiarism", label: "Self-Check", icon: FileScan, color: null },
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
        { key: "phrasebank", label: "Phrasebank", icon: BookText, color: null },
        { key: "provenance", label: "Writing Log", icon: History, color: null },
        { key: "rubric", label: "Rubric", icon: FileSpreadsheet, color: null },
        { key: "peer-review", label: "Peer Review", icon: Users, color: null },
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
      <div className="sticky top-0 z-10 bg-card border-b card-glow">
        <div className="px-4 py-3 space-y-3">
          <ReadinessBadge />
          <SubmissionChecklist />
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
                    ${isExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
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
        {PanelComponent ? (
          <div key={activePanel} className="animate-fade-in-up">
            <PanelComponent />
          </div>
        ) : null}
      </div>
    </div>
  );
}
