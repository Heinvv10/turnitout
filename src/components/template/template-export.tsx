"use client";

import { useState, useMemo } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { usePaperStore } from "@/store/paper-store";
import { MODULES } from "@/lib/constants";
import { populateTemplate, docxToBase64 } from "@/lib/docx-handler";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  Loader2,
  Eye,
  Edit3,
  AlertTriangle,
} from "lucide-react";

/**
 * Parse editor text into structured sections by detecting headings.
 */
function parseSections(text: string): {
  introduction: string;
  body: string;
  conclusion: string;
  references: string;
} {
  const lines = text.split("\n");
  let currentSection = "preamble";
  const sections: Record<string, string[]> = {
    preamble: [],
    introduction: [],
    body: [],
    conclusion: [],
    references: [],
  };

  for (const line of lines) {
    const lower = line.trim().toLowerCase();

    if (
      lower.match(
        /^(1\.?\s*)?introduction\s*$/,
      )
    ) {
      currentSection = "introduction";
      continue;
    }
    if (
      lower.match(
        /^(2\.?\s*)?body\s*$/,
      )
    ) {
      currentSection = "body";
      continue;
    }
    if (
      lower.match(
        /^(3\.?\s*)?(conclusion|summary)\s*$/,
      )
    ) {
      currentSection = "conclusion";
      continue;
    }
    if (
      lower.match(
        /^(3\.?\s*|4\.?\s*)?(reference\s*list|references|bibliography)\s*$/,
      )
    ) {
      currentSection = "references";
      continue;
    }

    // Sub-headings within body stay in body
    sections[currentSection].push(line);
  }

  // If no introduction detected, treat preamble as introduction
  if (
    sections.introduction.length === 0 &&
    sections.preamble.length > 0
  ) {
    sections.introduction = sections.preamble;
  }

  // If no body detected, everything after intro is body
  if (sections.body.length === 0) {
    const allText = text;
    const introEnd = sections.introduction.join("\n").length;
    const concStart = sections.conclusion.join("\n").length;
    if (introEnd > 0 && sections.conclusion.length > 0) {
      // Body is between intro and conclusion
      sections.body = [allText.slice(introEnd, allText.length - concStart)];
    }
  }

  return {
    introduction: sections.introduction.join("\n").trim(),
    body: sections.body.join("\n").trim(),
    conclusion: sections.conclusion.join("\n").trim(),
    references: sections.references.join("\n").trim(),
  };
}

function countSectionWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
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
  const { currentPaper } = usePaperStore();

  const module = MODULES.find((m) => m.code === selectedModule);

  const [assignmentTitle, setAssignmentTitle] = useState(
    currentPaper?.title || "PERMA REFLECTIVE ESSAY",
  );
  const [assignmentType, setAssignmentType] = useState("Academic Essay");
  const [lecturer, setLecturer] = useState(
    lecturers[selectedModule] || "",
  );
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Auto-parse sections from editor content
  const autoSections = useMemo(() => {
    if (!currentPaper?.plainText) {
      return { introduction: "", body: "", conclusion: "", references: "" };
    }
    return parseSections(currentPaper.plainText);
  }, [currentPaper?.plainText]);

  // Editable overrides
  const [introOverride, setIntroOverride] = useState("");
  const [bodyOverride, setBodyOverride] = useState("");
  const [conclusionOverride, setConclusionOverride] = useState("");
  const [referencesOverride, setReferencesOverride] = useState("");

  const sections = {
    introduction: introOverride || autoSections.introduction,
    body: bodyOverride || autoSections.body,
    conclusion: conclusionOverride || autoSections.conclusion,
    references: referencesOverride || autoSections.references,
  };

  const totalWords =
    countSectionWords(sections.introduction) +
    countSectionWords(sections.body) +
    countSectionWords(sections.conclusion);

  const missingFields: string[] = [];
  if (!studentName) missingFields.push("Student Name");
  if (!studentNumber) missingFields.push("Student Number");
  if (!assignmentTitle) missingFields.push("Assignment Title");
  if (!sections.introduction) missingFields.push("Introduction");
  if (!sections.body) missingFields.push("Body");
  if (!sections.conclusion) missingFields.push("Conclusion");

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
          assignmentTitle: assignmentTitle || "Untitled Assignment",
          date: new Date().toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          wordCount: totalWords,
        },
        sections,
      );

      const fileName =
        `${studentNumber || "student"}_${selectedModule}_${assignmentTitle || "assignment"}.docx`
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
    <div className="space-y-3 p-4">
      <h3 className="text-sm font-semibold">Export to Cornerstone Template</h3>

      {/* Template Upload */}
      <Card className="p-3">
        {template ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs">{template.fileName}</span>
            <label className="ml-auto cursor-pointer text-xs text-primary hover:underline">
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
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-primary/50">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs font-medium">
              Upload Cornerstone Template (.docx)
            </span>
            <input
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleTemplateUpload}
            />
          </label>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1 gap-1 text-xs">
            <Edit3 className="h-3 w-3" />
            Details
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 gap-1 text-xs">
            <FileText className="h-3 w-3" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 gap-1 text-xs">
            <Eye className="h-3 w-3" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">
                Full Name
              </Label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Name Surname"
                className="mt-0.5 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">
                Student Number
              </Label>
              <Input
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="e.g. 113077"
                className="mt-0.5 h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground">
              Assignment Title
            </Label>
            <Input
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="e.g. PERMA REFLECTIVE ESSAY"
              className="mt-0.5 h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">
                Type of Paper
              </Label>
              <Input
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                placeholder="Academic Essay"
                className="mt-0.5 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">
                Lecturer
              </Label>
              <Input
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="e.g. Michaela Moodley"
                className="mt-0.5 h-8 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">
                Module
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {module?.code} - {module?.name}
              </p>
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">
                Date
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* SECTIONS TAB */}
        <TabsContent value="sections" className="space-y-3 pt-2">
          <p className="text-[10px] text-muted-foreground">
            Sections auto-detected from your essay. Edit below to override.
          </p>

          {[
            {
              label: "Introduction",
              value: sections.introduction,
              setter: setIntroOverride,
              auto: autoSections.introduction,
            },
            {
              label: "Body",
              value: sections.body,
              setter: setBodyOverride,
              auto: autoSections.body,
            },
            {
              label: "Conclusion",
              value: sections.conclusion,
              setter: setConclusionOverride,
              auto: autoSections.conclusion,
            },
            {
              label: "Reference List",
              value: sections.references,
              setter: setReferencesOverride,
              auto: autoSections.references,
            },
          ].map(({ label, value, setter, auto }) => (
            <div key={label}>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-muted-foreground">
                  {label}
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {countSectionWords(value)} words
                  {value === auto && value.length > 0 && (
                    <span className="ml-1 text-green-600">(auto)</span>
                  )}
                </span>
              </div>
              <Textarea
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={`${label} will appear here when detected from your essay...`}
                rows={label === "Body" ? 6 : 3}
                className="mt-0.5 text-[11px] font-mono leading-relaxed"
              />
            </div>
          ))}
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview" className="pt-2">
          <Card className="max-h-[400px] overflow-y-auto bg-white p-5 text-black dark:bg-white">
            {/* Cover Page Preview */}
            <div className="mb-6 border-b pb-6 text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-wide">
                {assignmentTitle || "ASSIGNMENT TITLE"}
              </p>
              <Separator className="mx-auto mb-4 w-3/4" />
              <p className="text-xs">{assignmentType || "Academic Essay"}</p>
              <Separator className="mx-auto my-4 w-3/4" />
              <p className="text-xs">In partial fulfilment</p>
              <p className="text-xs">
                of the requirement in{" "}
                {module?.name || "Module Name"}
              </p>
              <p className="text-xs">at</p>
              <p className="text-xs font-medium">Cornerstone Institute</p>
              <Separator className="mx-auto my-4 w-3/4" />
              <p className="text-xs">by</p>
              <p className="text-xs font-medium">
                {studentName || "Name Surname"} (
                {studentNumber || "Student Number"})
              </p>
              <p className="mt-2 text-xs">
                Date:{" "}
                {new Date().toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Table of Contents Preview */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-bold uppercase">
                Table of Contents
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-dotted">
                  <span>1. Introduction</span>
                  <span className="text-muted-foreground">1</span>
                </div>
                <div className="flex justify-between border-b border-dotted">
                  <span>2. Body</span>
                  <span className="text-muted-foreground">1</span>
                </div>
                <div className="flex justify-between border-b border-dotted">
                  <span>3. Conclusion</span>
                  <span className="text-muted-foreground">...</span>
                </div>
                <div className="flex justify-between border-b border-dotted">
                  <span>Reference List</span>
                  <span className="text-muted-foreground">...</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Introduction */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold">1. Introduction</p>
              {sections.introduction ? (
                <p className="text-[11px] leading-relaxed text-gray-800">
                  {sections.introduction.slice(0, 300)}
                  {sections.introduction.length > 300 && "..."}
                </p>
              ) : (
                <p className="text-[11px] italic text-gray-400">
                  No introduction detected
                </p>
              )}
            </div>

            {/* Body */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold">2. Body</p>
              {sections.body ? (
                <p className="text-[11px] leading-relaxed text-gray-800">
                  {sections.body.slice(0, 400)}
                  {sections.body.length > 400 && "..."}
                </p>
              ) : (
                <p className="text-[11px] italic text-gray-400">
                  No body detected
                </p>
              )}
            </div>

            {/* Conclusion */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold">Conclusion</p>
              {sections.conclusion ? (
                <p className="text-[11px] leading-relaxed text-gray-800">
                  {sections.conclusion.slice(0, 300)}
                  {sections.conclusion.length > 300 && "..."}
                </p>
              ) : (
                <p className="text-[11px] italic text-gray-400">
                  No conclusion detected
                </p>
              )}
            </div>

            {/* References */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold">Reference List</p>
              {sections.references ? (
                <div className="text-[11px] leading-relaxed text-gray-800">
                  {sections.references
                    .split("\n")
                    .filter((l) => l.trim())
                    .slice(0, 8)
                    .map((ref, i) => (
                      <p key={i} className="mb-1 pl-4 -indent-4">
                        {ref}
                      </p>
                    ))}
                  {sections.references.split("\n").filter((l) => l.trim())
                    .length > 8 && (
                    <p className="italic text-gray-400">
                      ...and more references
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] italic text-gray-400">
                  No references detected
                </p>
              )}
            </div>

            {/* Declaration preview */}
            <Separator className="my-4" />
            <div className="text-[10px] text-gray-500">
              <p className="font-bold">
                Plagiarism & AI Declaration / Honour Pledge
              </p>
              <p className="mt-1">
                Signature: {studentName || "_______________"}
              </p>
              <p>
                Date:{" "}
                {new Date().toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </Card>

          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Word count (excl. references): {totalWords}
          </p>
        </TabsContent>
      </Tabs>

      {/* Warnings */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 rounded bg-yellow-50 p-2 text-xs text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Missing: {missingFields.join(", ")}</span>
        </div>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={!template || !currentPaper?.plainText || exporting}
        className="w-full"
      >
        {exporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export .docx
      </Button>

      <p className="text-center text-[10px] text-muted-foreground">
        File: {studentNumber || "student"}_{selectedModule}_
        {(assignmentTitle || "assignment").replace(/\s+/g, "_")}.docx
      </p>
    </div>
  );
}
