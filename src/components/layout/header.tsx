"use client";

import { useMemo } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { MODULES, SEMESTER_DATES } from "@/lib/constants";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Moon, Sun, LayoutDashboard, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useTheme } from "./theme-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsDialog } from "./settings-dialog";

function getNextDueDate(
  moduleCode: string,
  moduleOutlines: Record<string, { assessments?: { name: string; dueWeek: number }[] }>,
): { dueDate: Date; assessmentName: string } | null {
  // Check uploaded outlines first, then hardcoded rubrics
  const outline = moduleOutlines[moduleCode];
  const rubric = MODULE_RUBRICS[moduleCode];

  const assessments = outline?.assessments || rubric?.assessments;
  if (!assessments || assessments.length === 0) return null;

  // Find module semester
  const mod = MODULES.find((m) => m.code === moduleCode);
  if (!mod) return null;

  const semesterKey = mod.semester === 1 ? "semester1Start" : "semester2Start";
  const startDateStr = SEMESTER_DATES[2026]?.[semesterKey];
  if (!startDateStr) return null;

  const semesterStart = new Date(startDateStr);

  // Find the first assessment with a dueWeek, and pick the nearest upcoming one
  const now = new Date();
  let closest: { dueDate: Date; assessmentName: string } | null = null;

  for (const assessment of assessments) {
    if (!assessment.dueWeek) continue;
    const dueDate = new Date(semesterStart);
    dueDate.setDate(dueDate.getDate() + (assessment.dueWeek - 1) * 7);

    if (!closest || dueDate.getTime() < closest.dueDate.getTime()) {
      // Prefer the next upcoming one, but if all are past, show the most recent
      if (dueDate >= now || !closest || closest.dueDate < now) {
        closest = { dueDate, assessmentName: assessment.name };
      }
    }
  }

  return closest;
}

function AssignmentCountdown({ moduleCode }: { moduleCode: string }) {
  const { moduleOutlines } = useSettingsStore();

  const dueInfo = useMemo(
    () => getNextDueDate(moduleCode, moduleOutlines),
    [moduleCode, moduleOutlines],
  );

  if (!dueInfo) return null;

  const now = new Date();
  const diffMs = dueInfo.dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let badgeColor: string;
  let pulseClass = "";
  let label: string;

  if (diffDays < 0) {
    badgeColor = "bg-red-600 text-white";
    pulseClass = "animate-pulse";
    label = `Overdue ${Math.abs(diffDays)}d`;
  } else if (diffDays === 0) {
    badgeColor = "bg-red-600 text-white";
    pulseClass = "animate-pulse";
    label = "Due today";
  } else if (diffDays <= 3) {
    badgeColor = "bg-red-500 text-white";
    label = `Due in ${diffDays}d`;
  } else if (diffDays <= 7) {
    badgeColor = "bg-yellow-500 text-white dark:bg-yellow-600";
    label = `Due in ${diffDays}d`;
  } else {
    badgeColor = "bg-green-500 text-white dark:bg-green-600";
    label = `Due in ${diffDays}d`;
  }

  const formattedDate = dueInfo.dueDate.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor} ${pulseClass} cursor-default`}
        >
          <CalendarDays className="h-3 w-3" />
          {label}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{dueInfo.assessmentName}</p>
            <p className="text-xs opacity-80">{formattedDate}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Header() {
  const { selectedModule, setSelectedModule } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="border-b bg-card px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-lg font-bold leading-tight">TurnItOut</h1>
              <p className="text-xs text-muted-foreground">
                Pre-Submission Checker
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-1 ml-4">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                size="sm"
              >
                Editor
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
              >
                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedModule} onValueChange={(v) => v && setSelectedModule(v)}>
            <SelectTrigger className="w-[180px] sm:w-[260px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Semester 1
              </div>
              {MODULES.filter((m) => m.semester === 1).map((m) => (
                <SelectItem key={m.code} value={m.code}>
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.code}
                  </span>{" "}
                  {m.name}
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Semester 2
              </div>
              {MODULES.filter((m) => m.semester === 2).map((m) => (
                <SelectItem key={m.code} value={m.code}>
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.code}
                  </span>{" "}
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AssignmentCountdown moduleCode={selectedModule} />

          <SettingsDialog />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
