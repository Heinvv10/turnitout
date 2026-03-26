"use client";

import { useState, useRef, useCallback } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { MODULES } from "@/lib/constants";
import { MODULE_RUBRICS, type ModuleRubric } from "@/lib/module-rubrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Loader2,
  Star,
  TrendingUp,
  BookOpenCheck,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export function GraderPanel() {
  const {
    currentPaper,
    analysisResults,
    isAnalyzing,
    setAnalyzing,
    setGradingResult,
  } = usePaperStore();
  const { selectedModule, moduleOutlines, setModuleOutline, apiKey } =
    useSettingsStore();
  const result = analysisResults.grading;
  const loading = isAnalyzing.grading;

  const moduleName =
    MODULES.find((m) => m.code === selectedModule)?.name || selectedModule;

  // Check for uploaded outline or hardcoded rubric
  const uploadedOutline = moduleOutlines[selectedModule];
  const hardcodedRubric = MODULE_RUBRICS[selectedModule];
  const activeRubric: ModuleRubric | null =
    uploadedOutline || hardcodedRubric || null;

  const assessmentNames = activeRubric?.assessments
    ? activeRubric.assessments
        .filter((a) => a.type !== "Summative")
        .map((a) => a.name)
    : [];

  const [selectedAssessment, setSelectedAssessment] = useState(
    assessmentNames[0] || "",
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBrief = activeRubric?.assessments.find(
    (a) => a.name === selectedAssessment,
  );

  const handleOutlineUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setUploadError("");

      try {
        let text = "";

        if (file.name.endsWith(".pdf")) {
          // Read PDF as text via mammoth won't work - send to API for parsing
          const formData = new FormData();
          formData.append("file", file);

          // Read file as text (basic extraction)
          const arrayBuffer = await file.arrayBuffer();
          // For PDF we need to extract text - use a simple approach
          const bytes = new Uint8Array(arrayBuffer);
          // Try to extract readable text from PDF
          const decoder = new TextDecoder("utf-8", { fatal: false });
          const raw = decoder.decode(bytes);
          // Extract text between stream markers (basic PDF text extraction)
          const textParts: string[] = [];
          const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
          let match;
          while ((match = streamRegex.exec(raw)) !== null) {
            const cleaned = match[1].replace(/[^\x20-\x7E\n\r]/g, " ").trim();
            if (cleaned.length > 20) textParts.push(cleaned);
          }
          text = textParts.join("\n");

          // If PDF extraction failed, try reading as plain text
          if (text.length < 100) {
            text = raw.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s+/g, " ");
          }
        } else {
          // .txt or .docx
          if (file.name.endsWith(".docx")) {
            const mammoth = await import("mammoth");
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            text = result.value;
          } else {
            text = await file.text();
          }
        }

        if (text.length < 100) {
          setUploadError(
            "Could not extract enough text from the file. Try uploading as .docx or .txt instead.",
          );
          return;
        }

        // Send to API to parse the outline
        const res = await fetch("/api/parse-outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, moduleCode: selectedModule, apiKey }),
        });

        if (!res.ok) throw new Error("Failed to parse outline");
        const parsed = await res.json();

        setModuleOutline(selectedModule, parsed as ModuleRubric);

        // Auto-select first written assessment
        const writtenAssessments = (parsed as ModuleRubric).assessments?.filter(
          (a: { type: string }) => a.type !== "Summative",
        );
        if (writtenAssessments?.length > 0) {
          setSelectedAssessment(writtenAssessments[0].name);
        }
      } catch (err) {
        console.error("Outline upload failed:", err);
        setUploadError("Failed to parse the module outline. Please try again.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [selectedModule, setModuleOutline],
  );

  const runCheck = async () => {
    if (!currentPaper?.plainText || !activeRubric) return;
    setAnalyzing("grading", true);
    try {
      const res = await fetch("/api/grade-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText,
          moduleCode: selectedModule,
          assignmentTitle: currentPaper.title,
          assessmentName: selectedAssessment || undefined,
          uploadedOutline: uploadedOutline || undefined,
          apiKey,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGradingResult(data);
    } catch (err) {
      console.error("Grading failed:", err);
    } finally {
      setAnalyzing("grading", false);
    }
  };

  // === NO OUTLINE UPLOADED - SHOW UPLOAD PROMPT ===
  if (!activeRubric && !loading && !result) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <FileText className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Upload Module Outline First</p>
          <p className="text-sm text-muted-foreground">
            Upload the module outline PDF for <strong>{moduleName}</strong> so
            the grader can use the <strong>exact rubric</strong> your lecturer
            uses.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleOutlineUpload}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? "Parsing outline..." : "Upload Module Outline"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Accepts .pdf, .docx, or .txt files
        </p>

        {uploadError && (
          <div className="flex items-center gap-2 rounded bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {uploadError}
          </div>
        )}
      </div>
    );
  }

  // === OUTLINE LOADED, READY TO GRADE ===
  if (!result && !loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <GraduationCap className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Academic Grader</p>
          <p className="text-sm text-muted-foreground">
            Using the <strong>official Cornerstone rubric</strong> for{" "}
            <strong>{activeRubric?.moduleName || moduleName}</strong>
          </p>
        </div>

        {assessmentNames.length > 0 && (
          <div className="w-full max-w-xs">
            <Select
              value={selectedAssessment}
              onValueChange={(v) => v && setSelectedAssessment(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessmentNames.map((name) => {
                  const brief = activeRubric?.assessments.find(
                    (a) => a.name === name,
                  );
                  return (
                    <SelectItem key={name} value={name}>
                      {name}{" "}
                      {brief && (
                        <span className="text-muted-foreground">
                          ({brief.weighting}%, {brief.wordCount})
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedBrief && (
          <Card className="w-full p-4 shadow-sm text-left text-xs">
            <p className="mb-1 font-medium">{selectedBrief.name}</p>
            <p className="text-muted-foreground line-clamp-3">
              {selectedBrief.question}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{selectedBrief.wordCount} words</Badge>
              <Badge variant="outline">Week {selectedBrief.dueWeek}</Badge>
              <Badge variant="outline">{selectedBrief.referencing} ref.</Badge>
            </div>
          </Card>
        )}

        <Button onClick={runCheck} disabled={!currentPaper?.plainText}>
          <GraduationCap className="mr-2 h-4 w-4" />
          Grade Paper
        </Button>

        <div className="flex items-center gap-2">
          <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <BookOpenCheck className="h-3.5 w-3.5" />
            Official rubric loaded
            {activeRubric?.lecturer && ` (${activeRubric.lecturer})`}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-primary hover:underline"
          >
            Re-upload
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleOutlineUpload}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Grading your paper...</p>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor =
    result.trafficLight === "green"
      ? "text-green-600"
      : result.trafficLight === "yellow"
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Predicted Grade</p>
          <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {result.saGrade}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runCheck}>
          Re-grade
        </Button>
      </div>

      <div className="space-y-3">
        {result.rubricScores.map((rubric, i) => (
          <Card key={i} className="p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium">{rubric.category}</p>
              <span className="text-sm font-mono">
                {rubric.score}/{rubric.maxScore}
              </span>
            </div>
            <Progress
              value={(rubric.score / rubric.maxScore) * 100}
              className="mb-2 h-2"
            />
            <p className="text-xs text-muted-foreground">{rubric.feedback}</p>
            {rubric.improvements.length > 0 && (
              <div className="mt-2 space-y-1">
                {rubric.improvements.map((imp, ii) => (
                  <div
                    key={ii}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground"
                  >
                    <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    {imp}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {result.strengths && result.strengths.length > 0 && (
        <Card className="bg-green-50 p-4 shadow-sm dark:bg-green-950/30">
          <p className="mb-1 text-xs font-medium uppercase text-green-700 dark:text-green-400">
            Strengths
          </p>
          {result.strengths.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 text-xs text-green-700 dark:text-green-400"
            >
              <Star className="mt-0.5 h-3 w-3 shrink-0" />
              {s}
            </div>
          ))}
        </Card>
      )}

      <Card className="p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Overall Feedback
        </p>
        <p className="mt-1 text-sm">{result.overallFeedback}</p>
      </Card>
    </div>
  );
}
