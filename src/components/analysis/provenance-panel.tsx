"use client";

import { useMemo } from "react";
import { useProvenanceStore } from "@/store/provenance-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { History, Download, Share2 } from "lucide-react";
import type { ProvenanceEvent } from "@/store/provenance-store";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildReportText(
  stats: ReturnType<typeof useProvenanceStore.getState>["getStats"] extends (
    m: string,
  ) => infer R
    ? R
    : never,
  moduleName: string,
  studentName: string,
): string {
  const totalChars = stats.totalTyped + stats.totalPasted;
  const typedPct = totalChars > 0 ? Math.round((stats.totalTyped / totalChars) * 100) : 0;
  const pastedPct = totalChars > 0 ? 100 - typedPct : 0;

  return [
    "TurnItOut — Writing Process Provenance Report",
    "==============================================",
    "",
    `Student: ${studentName || "Not set"}`,
    `Module: ${moduleName || "Not set"}`,
    `Generated: ${new Date().toLocaleString("en-ZA")}`,
    "",
    "Summary",
    "-------",
    `Typed: ${stats.totalTyped} chars (${typedPct}%)`,
    `Pasted: ${stats.totalPasted} chars (${pastedPct}%)`,
    `Deleted: ${stats.totalDeleted} chars`,
    `Revisions: ${stats.revisions}`,
    `Sessions: ${stats.sessionCount}`,
    `First edit: ${formatDate(stats.firstEdit)}`,
    `Last edit: ${formatDate(stats.lastEdit)}`,
    "",
    "This report confirms the student actively typed and revised",
    "their work across multiple editing sessions.",
  ].join("\n");
}

/** Color bar for the timeline */
function TimelineBar({ events }: { events: ProvenanceEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg bg-muted/50 p-4 text-center text-xs text-muted-foreground">
        No writing activity recorded yet. Start typing in the editor.
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    typed: "bg-green-500",
    pasted: "bg-yellow-500",
    deleted: "bg-red-500",
    revised: "bg-blue-500",
  };

  const maxDelta = Math.max(...events.map((e) => Math.abs(e.charDelta)), 1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-px rounded-lg bg-muted/30 p-2 h-20 overflow-hidden">
        {events.slice(-100).map((event, idx) => {
          const height = Math.max(
            8,
            (Math.abs(event.charDelta) / maxDelta) * 100,
          );
          return (
            <div
              key={`${event.timestamp}-${idx}`}
              className={`flex-1 min-w-[2px] max-w-[6px] rounded-t ${colorMap[event.type] || "bg-muted"}`}
              style={{ height: `${height}%` }}
              title={`${event.type}: ${event.charDelta > 0 ? "+" : ""}${event.charDelta} chars`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-green-500" />
          Typed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-yellow-500" />
          Pasted
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-red-500" />
          Deleted
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-blue-500" />
          Revised
        </span>
      </div>
    </div>
  );
}

export function ProvenancePanel() {
  const { selectedModule, studentName } = useSettingsStore();
  const { getStats, getEvents } = useProvenanceStore();

  const stats = useMemo(() => getStats(selectedModule), [getStats, selectedModule]);
  const events = useMemo(() => getEvents(selectedModule), [getEvents, selectedModule]);

  const totalChars = stats.totalTyped + stats.totalPasted;
  const typedPct = totalChars > 0 ? Math.round((stats.totalTyped / totalChars) * 100) : 0;
  const pastedPct = totalChars > 0 ? 100 - typedPct : 0;

  const handleDownload = () => {
    const text = buildReportText(stats, selectedModule, studentName);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `provenance-${selectedModule || "report"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsApp = () => {
    const text = buildReportText(stats, selectedModule, studentName);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Writing Process Log</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Typed" value={`${typedPct}%`} sub={`${stats.totalTyped} chars`} />
        <StatCard label="Pasted" value={`${pastedPct}%`} sub={`${stats.totalPasted} chars`} />
        <StatCard label="Deleted" value={String(stats.totalDeleted)} sub="chars removed" />
        <StatCard label="Revisions" value={String(stats.revisions)} sub="edit passes" />
        <StatCard label="Sessions" value={String(stats.sessionCount)} sub="writing sessions" />
        <StatCard
          label="Time span"
          value={stats.firstEdit && stats.lastEdit ? formatTimeSpan(stats.firstEdit, stats.lastEdit) : "—"}
          sub={stats.firstEdit ? `since ${formatDate(stats.firstEdit)}` : "no activity"}
        />
      </div>

      {/* Timeline */}
      <div>
        <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">
          Activity Timeline (last 100 events)
        </h4>
        <TimelineBar events={events} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleDownload}
          disabled={events.length === 0}
        >
          <Download className="mr-1 h-3 w-3" />
          Download Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleWhatsApp}
          disabled={events.length === 0}
        >
          <Share2 className="mr-1 h-3 w-3" />
          Share via WhatsApp
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function formatTimeSpan(first: string, last: string): string {
  const ms = new Date(last).getTime() - new Date(first).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  const mins = Math.floor(ms / (1000 * 60));
  return `${mins}m`;
}
