"use client";

import { useState, useRef, useCallback } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { MODULES } from "@/lib/constants";
import { MODULE_RUBRICS, type ModuleRubric } from "@/lib/module-rubrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  BookOpen,
} from "lucide-react";

export function OutlineGate() {
  const { selectedModule, moduleOutlines, setModuleOutline, apiKey } =
    useSettingsStore();
  const hasOutline =
    !!moduleOutlines[selectedModule] || !!MODULE_RUBRICS[selectedModule];
  const moduleName =
    MODULES.find((m) => m.code === selectedModule)?.name || selectedModule;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setUploadError("");

      try {
        let text = "";
        if (file.name.endsWith(".docx")) {
          const mammoth = await import("mammoth");
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } else if (file.name.endsWith(".txt")) {
          text = await file.text();
        } else if (file.name.endsWith(".pdf")) {
          // Use server-side PDF extraction
          const formData = new FormData();
          formData.append("file", file);
          const pdfRes = await fetch("/api/extract-pdf", {
            method: "POST",
            body: formData,
          });
          const pdfData = await pdfRes.json();
          if (pdfData.error) throw new Error(pdfData.error);
          text = pdfData.text || "";
        }

        if (text.length < 100) {
          setUploadError(
            "Could not extract enough text. Try .docx or .txt format.",
          );
          return;
        }

        const res = await fetch("/api/parse-outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            moduleCode: selectedModule,
            apiKey,
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setModuleOutline(selectedModule, data as ModuleRubric);
      } catch (err) {
        console.error("Outline upload failed:", err);
        setUploadError(
          err instanceof Error ? err.message : "Failed to parse outline",
        );
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [selectedModule, apiKey, setModuleOutline],
  );

  // Outline already loaded - show compact status
  if (hasOutline && outline) {
    const assessmentCount = outline.assessments?.length || 0;
    return (
      <div className="flex items-center gap-2 border-b bg-green-50 px-4 py-1.5 dark:bg-green-950/20">
        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
        <span className="text-xs text-green-700 dark:text-green-400">
          <strong>{moduleName}</strong> outline loaded
          {outline.lecturer && ` (${outline.lecturer})`}
          {assessmentCount > 0 && ` · ${assessmentCount} assessments`}
          {outline.turnitinThreshold && (
            <> · Turnitin threshold: {outline.turnitinThreshold}%</>
          )}
        </span>
        <label className="ml-auto cursor-pointer text-xs text-green-600 hover:underline dark:text-green-400">
          Re-upload
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>
    );
  }

  // No outline - show prominent upload gate
  return (
    <div className="border-b bg-amber-50 dark:bg-amber-950/20">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-amber-100 p-2 dark:bg-amber-900/40">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Upload Module Outline for {moduleName}
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              Upload the module outline or assignment brief PDF so TurnItOut can
              check your paper against the{" "}
              <strong>exact rubric and requirements</strong> your lecturer uses.
              Without it, checks will use generic criteria.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                size="sm"
                variant="default"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-3.5 w-3.5" />
                )}
                {uploading ? "Parsing..." : "Upload Outline"}
              </Button>
              <span className="text-[10px] text-amber-600 dark:text-amber-500">
                .pdf, .docx, or .txt
              </span>
            </div>
            {uploadError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
