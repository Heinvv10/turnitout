"use client";

import { Header } from "@/components/layout/header";
import { MODULES } from "@/lib/constants";
import { useSettingsStore } from "@/store/settings-store";
import { useHistoryStore } from "@/store/history-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
} from "lucide-react";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import Link from "next/link";

function TrafficIcon({ color }: { color: "green" | "yellow" | "red" }) {
  if (color === "green")
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (color === "yellow")
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

export default function DashboardPage() {
  const { moduleOutlines, studentName, selectedModule } = useSettingsStore();
  const { entries, removeEntry, clearAll } = useHistoryStore();

  const semester1 = MODULES.filter((m) => m.semester === 1);
  const semester2 = MODULES.filter((m) => m.semester === 2);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="mx-auto w-full max-w-5xl flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          {studentName && (
            <p className="text-sm text-muted-foreground">
              Welcome, {studentName}
            </p>
          )}
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Semester 1
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {semester1.map((m) => (
              <ModuleCard
                key={m.code}
                code={m.code}
                name={m.name}
                credits={m.credits}
                hasOutline={!!moduleOutlines[m.code]}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Semester 2
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {semester2.map((m) => (
              <ModuleCard
                key={m.code}
                code={m.code}
                name={m.name}
                credits={m.credits}
                hasOutline={!!moduleOutlines[m.code]}
              />
            ))}
          </div>
        </div>

        {/* Draft Progress */}
        <div className="mb-8">
          <ProgressChart moduleCode={selectedModule} />
        </div>

        {/* History */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Check History
            </h3>
            {entries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={clearAll}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>

          {entries.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
              <Clock className="h-8 w-8 opacity-40" />
              <p className="text-sm">No checks run yet</p>
              <p className="text-xs">
                Run checks on your papers and they will appear here
              </p>
              <Link href="/">
                <Button variant="outline" size="sm" className="mt-2">
                  Go to Editor
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const moduleName =
                  MODULES.find((m) => m.code === entry.moduleCode)?.name ||
                  entry.moduleCode;
                return (
                  <Card
                    key={entry.id}
                    className="flex items-center gap-3 p-3"
                  >
                    <TrafficIcon color={entry.readiness.trafficLight} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {entry.paperTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {moduleName} &middot; {entry.wordCount} words &middot;{" "}
                        {new Date(entry.timestamp).toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          entry.readiness.trafficLight === "green"
                            ? "default"
                            : entry.readiness.trafficLight === "yellow"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {entry.readiness.overall}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  code,
  name,
  credits,
  hasOutline,
}: {
  code: string;
  name: string;
  credits: number;
  hasOutline: boolean;
}) {
  return (
    <Link href={`/?module=${code}`}>
      <Card className="cursor-pointer p-4 transition-colors hover:bg-accent">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {code}
          </span>
          {hasOutline ? (
            <Badge
              variant="default"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px]"
            >
              <FileText className="mr-1 h-2.5 w-2.5" />
              Outline
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              No outline
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium leading-tight">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{credits} credits</p>
      </Card>
    </Link>
  );
}
