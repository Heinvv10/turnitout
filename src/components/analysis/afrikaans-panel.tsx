"use client";

import { useMemo, useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages, AlertCircle, Lightbulb, ChevronDown, CheckCircle, BookOpen, Info } from "lucide-react";
import {
  analyzeAfrikaansPatterns,
  ACADEMIC_PHRASES,
  type AfrikaansCategory,
  type AfrikaasFinding,
} from "@/lib/afrikaans-patterns";

const CATEGORY_COLORS: Record<AfrikaansCategory, string> = {
  "Dubbele Ontkenning": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  Woordorde: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Spelling: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  Anglisismes: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Register: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Tyd: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Passief: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
};

function FindingCard({ finding }: { finding: AfrikaasFinding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-primary/40 p-3 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-2 text-left cursor-pointer"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] ${CATEGORY_COLORS[finding.pattern.category]}`}>
              {finding.pattern.category}
            </Badge>
            <span className="text-xs font-medium text-foreground">
              {finding.pattern.name}
            </span>
          </div>
          <p className="text-xs">
            <span className="rounded bg-red-100 px-1 py-0.5 font-mono text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {finding.matchedText}
            </span>
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200
            ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 pl-6 animate-fade-in-up">
          <div className="flex items-start gap-1.5">
            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              {finding.pattern.explanation}
            </p>
          </div>
          <div className="rounded-md bg-green-50 p-2 dark:bg-green-950/30">
            <p className="text-[11px] font-medium text-green-700 dark:text-green-400">
              {finding.pattern.fix}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

function PhraseSuggestions() {
  const [open, setOpen] = useState(false);
  const grouped = new Map<string, { context: string; phrase: string }[]>();
  for (const p of ACADEMIC_PHRASES) {
    if (!grouped.has(p.context)) grouped.set(p.context, []);
    grouped.get(p.context)!.push(p);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg bg-primary/5
          px-3 py-2 hover:bg-primary/10 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Akademiese frases</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200
            ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-2 space-y-3 animate-fade-in-up">
          {Array.from(grouped.entries()).map(([context, phrases]) => (
            <div key={context} className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide pl-1">
                {context}
              </p>
              {phrases.map((p, i) => (
                <div
                  key={`${context}-${i}`}
                  className="rounded-md bg-secondary/50 px-3 py-1.5"
                >
                  <p className="text-xs text-foreground font-mono">{p.phrase}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AfrikaansPanel() {
  const { currentPaper } = usePaperStore();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const result = useMemo(() => {
    if (!currentPaper?.plainText) return null;
    return analyzeAfrikaansPatterns(currentPaper.plainText);
  }, [currentPaper?.plainText]);

  function toggleCategory(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  if (!currentPaper?.plainText) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Languages className="h-12 w-12 text-primary/30" />
        <p className="text-sm text-muted-foreground">
          Laai jou werkstuk op om Afrikaanse skryfpatrone na te gaan.
        </p>
        <p className="text-xs text-muted-foreground">
          Upload your paper to check Afrikaans writing patterns.
        </p>
      </div>
    );
  }

  if (!result) return null;

  if (!result.isAfrikaans) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Nie Afrikaans nie?
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400/80">
                Hierdie teks lyk nie na Afrikaans nie. As jou werkstuk in Afrikaans is,
                maak seker dat die teks korrek gelaai is. Jy kan ook jou taalinstelling na
                &quot;Afrikaans&quot; verander in die instellings.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This text does not appear to be Afrikaans. If your paper is in Afrikaans,
                ensure the text loaded correctly or set your language to Afrikaans in settings.
              </p>
            </div>
          </div>
        </div>
        <PhraseSuggestions />
      </div>
    );
  }

  if (result.totalCount === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-950/30">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Geen algemene foute opgespoor nie — uitstekend!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No common Afrikaans writing patterns detected — well done!
          </p>
        </div>
        <PhraseSuggestions />
      </div>
    );
  }

  const grouped = new Map<AfrikaansCategory, AfrikaasFinding[]>();
  for (const f of result.findings) {
    const cat = f.pattern.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(f);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Languages className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">Afrikaans Skryfhulp</p>
          <p className="text-xs text-muted-foreground">
            {result.totalCount} {result.totalCount === 1 ? "patroon" : "patrone"} gevind
            {" "}in {result.categoryCount}{" "}
            {result.categoryCount === 1 ? "kategorie" : "kategoriee"}
          </p>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([category, findings]) => {
        const isOpen = expandedCats.has(category);
        return (
          <div key={category}>
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center justify-between rounded-lg bg-secondary/50
                px-3 py-2 hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${CATEGORY_COLORS[category]}`}>
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {findings.length} {findings.length === 1 ? "fout" : "foute"}
                </span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-200
                ${isOpen ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}
            >
              <div className="space-y-2">
                {findings.map((finding, i) => (
                  <FindingCard key={`${category}-${i}`} finding={finding} />
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <PhraseSuggestions />
    </div>
  );
}
