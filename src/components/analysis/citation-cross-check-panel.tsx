"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  crossCheckCitations,
  type CrossCheckResult,
} from "@/lib/citation-cross-check";

export function CitationCrossCheckPanel() {
  const { currentPaper } = usePaperStore();
  const [result, setResult] = useState<CrossCheckResult | null>(null);
  const [runCount, setRunCount] = useState(0);

  const bodyText = currentPaper?.plainText ?? "";
  const references = currentPaper?.references ?? "";

  const hasData = bodyText.length > 0 && references.length > 0;

  const runCheck = useCallback(() => {
    if (!hasData) {
      setResult(null);
      return;
    }
    const r = crossCheckCitations(bodyText, references);
    setResult(r);
  }, [bodyText, references, hasData]);

  // Auto-run when both fields are available
  useEffect(() => {
    runCheck();
  }, [runCheck]);

  // Manual re-check
  const handleRecheck = () => {
    setRunCount((c) => c + 1);
    runCheck();
  };

  if (!hasData) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Add essay text and a reference list to cross-check citations.
      </div>
    );
  }

  if (!result) return null;

  const issueCount = result.orphans.length + result.ghosts.length;
  const isClean = issueCount === 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Citation Cross-Check</p>
          <p className="text-xs text-muted-foreground">
            {result.totalInText} unique in-text citation
            {result.totalInText !== 1 ? "s" : ""},{" "}
            {result.totalReferences} reference
            {result.totalReferences !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRecheck}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Re-check
        </Button>
      </div>

      {/* Success state */}
      {isClean && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          All citations matched — every in-text citation has a reference and
          vice-versa.
        </div>
      )}

      {/* Orphans */}
      {result.orphans.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Orphan Citations ({result.orphans.length})
          </p>
          {result.orphans.map((o) => (
            <Card
              key={o.key}
              className="flex items-start gap-2 border-yellow-200 bg-yellow-50 p-3 shadow-sm dark:border-yellow-900 dark:bg-yellow-950/30"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  {o.citation}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Cited in-text but no matching reference found.
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ghosts */}
      {result.ghosts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Uncited References ({result.ghosts.length})
          </p>
          {result.ghosts.map((g, i) => (
            <Card
              key={`${g.surname}-${i}`}
              className="flex items-start gap-2 border-blue-200 bg-blue-50 p-3 shadow-sm dark:border-blue-900 dark:bg-blue-950/30"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-300 break-words">
                  {g.reference}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  In reference list but never cited in the essay body.
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Duplicates (informational) */}
      {result.duplicates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Repeated Citations ({result.duplicates.length})
          </p>
          {result.duplicates.map((d) => (
            <div
              key={d.key}
              className="flex items-center gap-2 rounded-md border p-2 text-xs"
            >
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium">{d.citation}</span>
              <Badge variant="secondary" className="ml-auto text-[11px]">
                {d.count}x
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
