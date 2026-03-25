"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { usePaperStore } from "@/store/paper-store";
import { MODULES } from "@/lib/constants";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import { populateTemplate, docxToBase64 } from "@/lib/docx-handler";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Download,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

function countSectionWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export function TemplateExport() {
  const {
    studentName,
    studentNumber,
    selectedModule,
    template,
    lecturers,
    setStudentName,
    setStudentNumber,
    setTemplate,
  } = useSettingsStore();
  const { currentPaper, sections } = usePaperStore();
  const module = MODULES.find((m) => m.code === selectedModule);
  const { moduleOutlines } = useSettingsStore();
  const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
  const firstAssessment = outline?.assessments?.find(
    (a) => a.type !== "Summative",
  );

  const paperTitle = currentPaper?.title || "";
  const defaultTitle = paperTitle || firstAssessment?.name || "";
  const defaultLecturer = lecturers[selectedModule] || outline?.lecturer || "";

  const [assignmentTitle, setAssignmentTitle] = useState(defaultTitle);
  const [lecturer, setLecturer] = useState(defaultLecturer);

  // Sync when paper title or outline changes
  useEffect(() => {
    if (currentPaper?.title) {
      setAssignmentTitle(currentPaper.title);
    } else if (firstAssessment?.name) {
      setAssignmentTitle(firstAssessment.name);
    }
  }, [currentPaper?.title, firstAssessment?.name]);

  useEffect(() => {
    const lec = lecturers[selectedModule] || outline?.lecturer || "";
    if (lec) setLecturer(lec);
  }, [outline?.lecturer, lecturers, selectedModule]);
  const [exporting, setExporting] = useState(false);

  const sectionData = {
    introduction: sections?.introduction || "",
    body: sections?.body || "",
    conclusion: sections?.conclusion || "",
    references:
      sections?.references || currentPaper?.references || "",
  };

  const totalWords =
    countSectionWords(sectionData.introduction) +
    countSectionWords(sectionData.body) +
    countSectionWords(sectionData.conclusion);

  const missingFields: string[] = [];
  if (!studentName) missingFields.push("Name");
  if (!studentNumber) missingFields.push("Student Number");
  if (!assignmentTitle) missingFields.push("Title");
  if (!template) missingFields.push("Word Template");
  if (!sectionData.introduction && !sectionData.body)
    missingFields.push("Essay text");

  const handleTemplateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".docx")) return;
    const base64 = await docxToBase64(file);
    setTemplate({
      fileName: file.name,
      base64,
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleExport = async () => {
    if (!template) return;
    setExporting(true);
    try {
      const blob = await populateTemplate(
        template.base64,
        {
          studentName,
          studentNumber,
          moduleCode: selectedModule,
          moduleName: module?.name || selectedModule,
          lecturer,
          assignmentTitle: assignmentTitle || "Untitled",
          date: new Date().toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          wordCount: totalWords,
        },
        sectionData,
      );

      const fileName =
        `${studentNumber || "student"}_${selectedModule}_${assignmentTitle || "paper"}.docx`
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "");
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Template */}
      {template ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-950/30">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="flex-1 text-xs">{template.fileName}</span>
          <label className="cursor-pointer text-xs text-primary hover:underline">
            Change
            <input
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleTemplateUpload}
            />
          </label>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 hover:border-primary/50">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs">Upload Cornerstone Template (.docx)</span>
          <input
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleTemplateUpload}
          />
        </label>
      )}

      {/* Student Details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[10px]">Full Name</Label>
          <Input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Name Surname"
            className="mt-0.5 h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px]">Student Number</Label>
          <Input
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            placeholder="e.g. 113077"
            className="mt-0.5 h-8 text-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[10px]">Assignment Title</Label>
          <Input
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            placeholder="e.g. PERMA Reflective Essay"
            className="mt-0.5 h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-[10px]">Lecturer</Label>
          <Input
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            placeholder="e.g. Michaela Moodley"
            className="mt-0.5 h-8 text-xs"
          />
        </div>
      </div>

      <Separator />

      {/* Section Preview */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase text-muted-foreground">
          Document Structure
        </p>

        {[
          { label: "Introduction", text: sectionData.introduction },
          { label: "Body", text: sectionData.body },
          { label: "Conclusion", text: sectionData.conclusion },
          { label: "References", text: sectionData.references },
        ].map(({ label, text }) => (
          <div
            key={label}
            className="flex items-start gap-2 rounded bg-muted/30 px-3 py-1.5"
          >
            <span className="w-20 shrink-0 text-[10px] font-medium text-muted-foreground">
              {label}
            </span>
            {text ? (
              <div className="flex-1 min-w-0">
                <p className="truncate text-[10px] text-muted-foreground">
                  {text.slice(0, 100)}...
                </p>
                <span className="text-[9px] text-muted-foreground/60">
                  {countSectionWords(text)} words
                </span>
              </div>
            ) : (
              <span className="text-[10px] italic text-muted-foreground/50">
                Not detected
              </span>
            )}
          </div>
        ))}

        <p className="text-right text-[10px] text-muted-foreground">
          Total: {totalWords} words (excl. references)
        </p>
      </div>

      {/* Warnings */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 rounded bg-yellow-50 p-2 text-xs text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Missing: {missingFields.join(", ")}</span>
        </div>
      )}

      {/* Export */}
      <Button
        onClick={handleExport}
        disabled={!template || !currentPaper?.plainText || exporting}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {exporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export .docx
      </Button>

      <p className="text-center text-[9px] text-muted-foreground">
        {studentNumber || "student"}_{selectedModule}_
        {(assignmentTitle || "paper").replace(/\s+/g, "_")}.docx
      </p>
    </div>
  );
}
