"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import {
  GraduationCap,
  Loader2,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

interface AcademizeChange {
  from: string;
  to: string;
  reason: string;
}

interface AcademizeResult {
  original: string;
  academized: string;
  changes: AcademizeChange[];
}

export function AcademizeButton() {
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const updateContent = usePaperStore((s) => s.updateContent);
  const apiKey = useSettingsStore((s) => s.apiKey);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AcademizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [open, setOpen] = useState(false);

  const hasText = Boolean(currentPaper?.plainText);

  const handleAcademize = async () => {
    if (!currentPaper?.plainText) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);

    try {
      const res = await fetch("/api/academize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPaper.plainText,
          apiKey,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data as AcademizeResult);
    } catch {
      setError("Failed to connect to the academizer service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.academized) return;
    try {
      await navigator.clipboard.writeText(result.academized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no clipboard API
    }
  };

  const handleApply = () => {
    if (!result?.academized || !currentPaper) return;

    const wordCount = result.academized
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    // Replace plain text content — the editor uses HTML so wrap in paragraphs
    const html = result.academized
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");

    updateContent(html, result.academized, wordCount);
    setApplied(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset state when dialog closes
      setResult(null);
      setError(null);
      setCopied(false);
      setApplied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        disabled={!hasText}
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <GraduationCap className="h-4 w-4" />
        Academize
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academize — Tone Converter
          </DialogTitle>
        </DialogHeader>

        {/* Initial state — prompt to convert */}
        {!result && !isLoading && !error && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Convert your essay from informal/conversational language into
              proper academic register. Your original meaning will be preserved,
              and each change will be explained so you can learn from it.
            </p>
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Text to convert ({currentPaper?.wordCount ?? 0} words)
              </p>
              <p className="line-clamp-4 text-sm">
                {currentPaper?.plainText?.slice(0, 500)}
                {(currentPaper?.plainText?.length ?? 0) > 500 ? "..." : ""}
              </p>
            </div>
            <Button onClick={handleAcademize} className="w-full">
              <GraduationCap className="mr-2 h-4 w-4" />
              Convert to Academic Register
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Converting to academic register...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="space-y-3 py-4">
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <Button variant="outline" onClick={handleAcademize}>
              Try Again
            </Button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 py-2">
            {/* Side-by-side comparison */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Original
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result.original}
                </p>
              </div>
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  Academic Version
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result.academized}
                </p>
              </div>
            </div>

            {/* Changes list */}
            {result.changes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Changes ({result.changes.length})
                </p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
                  {result.changes.map((change, i) => (
                    <div
                      key={i}
                      className="rounded border-l-2 border-l-primary/50 bg-muted/30 p-2"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-muted-foreground">
                          {change.from}
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
                        <span className="font-medium">{change.to}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {change.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={applied}
                className="flex-1"
              >
                {applied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Applied
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Apply to Essay
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {applied && (
              <p className="text-center text-xs text-muted-foreground">
                Academic version applied to your editor. You can undo with Ctrl+Z.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
