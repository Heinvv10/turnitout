"use client";

import { useState, useCallback } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileScan,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
} from "lucide-react";
import {
  checkSelfPlagiarism,
  type PreviousWork,
  type SelfPlagiarismResult,
} from "@/lib/self-plagiarism";

interface UploadedDoc {
  title: string;
  text: string;
}

/** Extract plain text from a .docx file using mammoth */
async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/** Extract plain text from a .txt file */
async function extractTxtText(file: File): Promise<string> {
  return file.text();
}

export function SelfPlagiarismPanel() {
  const { currentPaper } = usePaperStore();
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [result, setResult] = useState<SelfPlagiarismResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      try {
        let text: string;
        if (ext === "docx") {
          text = await extractDocxText(file);
        } else if (ext === "txt") {
          text = await extractTxtText(file);
        } else {
          setUploadError("Only .txt and .docx files are supported.");
          continue;
        }

        if (!text.trim()) {
          setUploadError(`"${file.name}" appears to be empty.`);
          continue;
        }

        setDocs((prev) => [...prev, { title: file.name, text }]);
      } catch {
        setUploadError(`Failed to read "${file.name}".`);
      }
    }
  }, []);

  const removeDoc = useCallback((index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }, []);

  const runCheck = useCallback(() => {
    if (!currentPaper?.plainText || docs.length === 0) return;
    setChecking(true);

    // Run in a microtask so the UI can show the loading state
    requestAnimationFrame(() => {
      const previousTexts: PreviousWork[] = docs.map((d) => ({
        title: d.title,
        text: d.text,
      }));
      const res = checkSelfPlagiarism(currentPaper.plainText, previousTexts);
      setResult(res);
      setChecking(false);
    });
  }, [currentPaper?.plainText, docs]);

  // --- Empty state ---
  if (!result && !checking) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <FileScan className="h-14 w-14 text-primary/30" />
        <div>
          <p className="text-lg font-medium">Self-Plagiarism Checker</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your previous assignments, then check for recycled
            paragraphs. Everything stays in your browser — nothing is stored.
          </p>
        </div>

        <UploadArea
          onUpload={handleUpload}
          uploadError={uploadError}
        />

        {docs.length > 0 && (
          <DocList docs={docs} onRemove={removeDoc} />
        )}

        <Button
          onClick={runCheck}
          disabled={!currentPaper?.plainText || docs.length === 0}
          className="mt-2"
        >
          Check for Self-Plagiarism
        </Button>

        {!currentPaper?.plainText && (
          <p className="text-xs text-muted-foreground">
            Paste or upload your current essay first.
          </p>
        )}
      </div>
    );
  }

  // --- Loading ---
  if (checking) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Comparing against {docs.length} previous{" "}
          {docs.length === 1 ? "document" : "documents"}...
        </p>
      </div>
    );
  }

  // --- Results ---
  const score = result?.overallScore ?? 0;
  const isClean = score < 5;
  const isModerate = score >= 5 && score < 15;

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isClean ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle
                className={`h-5 w-5 ${isModerate ? "text-yellow-500" : "text-red-500"}`}
              />
            )}
            <span className="font-semibold">Self-Plagiarism Score</span>
          </div>
          <Badge
            variant={isClean ? "outline" : isModerate ? "secondary" : "destructive"}
          >
            {score}%
          </Badge>
        </div>
        <Progress value={score} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {isClean
            ? "Minimal overlap with your previous work. You are in the clear."
            : isModerate
              ? "Some overlap detected. Review the flagged passages below."
              : "Significant overlap with previous work. Rewrite flagged sections."}
        </p>
      </Card>

      {/* Match list */}
      {result && result.matches.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {result.matches.length} matching{" "}
            {result.matches.length === 1 ? "passage" : "passages"} found
          </p>
          {result.matches.map((m, i) => (
            <Card key={`${m.currentPosition}-${i}`} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {m.previousTitle}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ~{m.phrase.split(" ").length} words
                </span>
              </div>
              <p className="text-sm bg-destructive/10 rounded-md px-3 py-2 font-mono leading-relaxed">
                {m.phrase}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Controls to re-run or upload more */}
      <div className="flex flex-col gap-3 pt-2">
        <UploadArea onUpload={handleUpload} uploadError={uploadError} />
        {docs.length > 0 && <DocList docs={docs} onRemove={removeDoc} />}
        <Button onClick={runCheck} variant="outline" className="w-full">
          Re-check
        </Button>
      </div>
    </div>
  );
}

// --- Sub-components ---

function UploadArea({
  onUpload,
  uploadError,
}: {
  onUpload: (files: FileList | null) => void;
  uploadError: string | null;
}) {
  return (
    <div className="w-full">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-4 hover:border-primary/50 transition-colors">
        <Upload className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Upload previous work (.txt, .docx)
        </span>
        <input
          type="file"
          accept=".txt,.docx"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
      </label>
      {uploadError && (
        <p className="text-xs text-destructive mt-1">{uploadError}</p>
      )}
    </div>
  );
}

function DocList({
  docs,
  onRemove,
}: {
  docs: UploadedDoc[];
  onRemove: (index: number) => void;
}) {
  return (
    <div className="w-full space-y-1">
      {docs.map((doc, i) => (
        <div
          key={`${doc.title}-${i}`}
          className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-sm truncate">{doc.title}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              ({doc.text.split(/\s+/).length} words)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
