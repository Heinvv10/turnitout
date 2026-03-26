"use client";

import { useState, useCallback } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wand2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Editor } from "@tiptap/react";

interface OutlineSection {
  heading: string;
  wordTarget: number;
  keyPoints: string[];
  tips: string;
}

interface OutlineResult {
  title: string;
  sections: OutlineSection[];
  totalWords: number;
  estimatedSections: number;
  referencesNeeded: string;
}

const ASSIGNMENT_TYPES = [
  "Essay",
  "Reflective Essay",
  "Report",
  "Literature Review",
  "Case Study",
];

interface OutlineGeneratorProps {
  editor: Editor | null;
}

export function OutlineGenerator({ editor }: OutlineGeneratorProps) {
  const { apiKey, selectedModule, moduleOutlines, referencingStyle } =
    useSettingsStore();

  const outline =
    moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
  const firstAssessment = outline?.assessments?.find(
    (a) => a.type !== "Summative",
  );

  const defaultWordCount = firstAssessment?.wordCount
    ? parseInt(firstAssessment.wordCount.replace(/\D/g, ""), 10) || 1200
    : 1200;
  const defaultQuestion = firstAssessment?.question || "";

  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [wordCount, setWordCount] = useState(defaultWordCount);
  const [assignmentType, setAssignmentType] = useState("Essay");
  const [assessmentQuestion, setAssessmentQuestion] =
    useState(defaultQuestion);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OutlineResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    if (!apiKey) {
      setError("API key required. Set it in Settings.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          wordCount,
          assignmentType,
          moduleCode: selectedModule,
          assessmentQuestion: assessmentQuestion || undefined,
          apiKey,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data as OutlineResult);
      // Expand all sections by default
      const expanded: Record<number, boolean> = {};
      (data as OutlineResult).sections?.forEach(
        (_: OutlineSection, i: number) => {
          expanded[i] = true;
        },
      );
      setExpandedSections(expanded);
    } catch {
      setError("Failed to generate outline. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    topic,
    wordCount,
    assignmentType,
    selectedModule,
    assessmentQuestion,
    apiKey,
  ]);

  const handleApplyToEditor = useCallback(() => {
    if (!editor || !result) return;

    const htmlParts: string[] = [];

    for (const section of result.sections) {
      htmlParts.push(`<h2>${section.heading}</h2>`);
      htmlParts.push("<p></p>");
    }

    editor.commands.setContent(htmlParts.join(""));
    setOpen(false);
  }, [editor, result]);

  const handleCopyOutline = useCallback(() => {
    if (!result) return;

    let text = `${result.title}\n\n`;
    for (const section of result.sections) {
      text += `${section.heading} (~${section.wordTarget} words)\n`;
      for (const point of section.keyPoints) {
        text += `  - ${point}\n`;
      }
      if (section.tips) {
        text += `  Tip: ${section.tips}\n`;
      }
      text += "\n";
    }
    text += `Total: ${result.totalWords} words\n`;
    text += `${result.referencesNeeded}\n`;
    if (referencingStyle) {
      text += `Referencing style: ${referencingStyle}\n`;
    }

    navigator.clipboard.writeText(text);
  }, [result, referencingStyle]);

  const handleReset = () => {
    setResult(null);
    setError("");
    setExpandedSections({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 h-6 text-[10px] hover:bg-accent hover:text-accent-foreground">
        <Wand2 className="h-3 w-3" />
        Outline
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Essay Outline
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outline-topic">
                Topic <span className="text-destructive">*</span>
              </Label>
              <Input
                id="outline-topic"
                placeholder="e.g. The impact of positive psychology on student wellbeing"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="outline-wordcount">Word Count</Label>
                <Input
                  id="outline-wordcount"
                  type="number"
                  min={100}
                  max={10000}
                  value={wordCount}
                  onChange={(e) =>
                    setWordCount(parseInt(e.target.value, 10) || 1200)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select
                  value={assignmentType}
                  onValueChange={(v) => { if (v) setAssignmentType(v); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outline-question">
                Assessment Question{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <textarea
                id="outline-question"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Paste the assessment question here for a tailored outline..."
                value={assessmentQuestion}
                onChange={(e) => setAssessmentQuestion(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Outline
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Title */}
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm font-semibold">{result.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {result.totalWords} words
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {result.estimatedSections} sections
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {result.referencesNeeded}
                </Badge>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-1">
              {result.sections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-md border"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/30"
                    onClick={() => toggleSection(index)}
                  >
                    {expandedSections[index] ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 font-medium">
                      {section.heading}
                    </span>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px]"
                    >
                      ~{section.wordTarget}w
                    </Badge>
                  </button>

                  {expandedSections[index] && (
                    <div className="border-t px-3 py-2 text-xs">
                      <ul className="mb-2 space-y-1">
                        {section.keyPoints.map((point, pi) => (
                          <li
                            key={pi}
                            className="flex items-start gap-1.5 text-muted-foreground"
                          >
                            <span className="mt-0.5 shrink-0">&#8226;</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                      {section.tips && (
                        <p className="text-muted-foreground/70 italic">
                          {section.tips}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {referencingStyle && (
              <p className="text-xs text-muted-foreground">
                Use {referencingStyle} referencing style
              </p>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button onClick={handleApplyToEditor} className="flex-1">
                <ArrowRight className="mr-2 h-4 w-4" />
                Apply to Editor
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyOutline}
                title="Copy outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
