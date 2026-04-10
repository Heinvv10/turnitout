"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Shield, Moon, Sun, LayoutDashboard, CalendarDays, Library, Menu, WifiOff, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/auth/user-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useTheme } from "./theme-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsDialog } from "./settings-dialog";
import { LowDataToggle, LowDataBanner } from "./low-data-toggle";

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
  const currentYear = new Date().getFullYear();
  const dates = SEMESTER_DATES[currentYear] ?? SEMESTER_DATES[Math.max(...Object.keys(SEMESTER_DATES).map(Number))];
  const startDateStr = dates?.[semesterKey];
  if (!startDateStr) return null;

  const semesterStart = new Date(startDateStr);

  // Find the first assessment with a dueWeek, and pick the nearest upcoming one
  const now = new Date();
  let closest: { dueDate: Date; assessmentName: string } | null = null;

  for (const assessment of assessments) {
    const week = Number(assessment.dueWeek);
    if (!week || isNaN(week)) continue;
    const dueDate = new Date(semesterStart);
    dueDate.setDate(dueDate.getDate() + (week - 1) * 7);

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
  const moduleOutlines = useSettingsStore((s) => s.moduleOutlines);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dueInfo = useMemo(
    () => getNextDueDate(moduleCode, moduleOutlines),
    [moduleCode, moduleOutlines],
  );

  if (!dueInfo || !mounted) return null;

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
    badgeColor = "bg-yellow-600 text-white dark:bg-yellow-500";
    label = `Due in ${diffDays}d`;
  } else {
    badgeColor = "bg-green-700 text-white dark:bg-green-600";
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
  const selectedModule = useSettingsStore((s) => s.selectedModule);
  const setSelectedModule = useSettingsStore((s) => s.setSelectedModule);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-30 border-b bg-card px-4 py-3 dark:border-b-primary/10 header-frosted">
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
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                size="sm"
              >
                Editor
              </Button>
            </Link>
            <Link href="/library">
              <Button
                variant={pathname === "/library" ? "secondary" : "ghost"}
                size="sm"
              >
                <Library className="mr-1.5 h-3.5 w-3.5" />
                Library
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
            <Link href="/institutional">
              <Button
                variant={pathname === "/institutional" ? "secondary" : "ghost"}
                size="sm"
              >
                <Building className="mr-1.5 h-3.5 w-3.5" />
                For Institutions
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Select value={selectedModule} onValueChange={(v) => v && setSelectedModule(v)}>
            <SelectTrigger className="hidden sm:flex w-[180px] md:w-[260px]">
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

          <div className="hidden sm:block">
            <AssignmentCountdown moduleCode={selectedModule} />
          </div>

          <LowDataToggle />
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

          <UserMenu />
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="bottom" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4 pb-4">
            <SheetClose
              render={
                <Link href="/">
                  <Button
                    variant={pathname === "/" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    Editor
                  </Button>
                </Link>
              }
            />
            <SheetClose
              render={
                <Link href="/library">
                  <Button
                    variant={pathname === "/library" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Library className="mr-1.5 h-3.5 w-3.5" />
                    Library
                  </Button>
                </Link>
              }
            />
            <SheetClose
              render={
                <Link href="/dashboard">
                  <Button
                    variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                    Dashboard
                  </Button>
                </Link>
              }
            />
            <SheetClose
              render={
                <Link href="/institutional">
                  <Button
                    variant={pathname === "/institutional" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Building className="mr-1.5 h-3.5 w-3.5" />
                    For Institutions
                  </Button>
                </Link>
              }
            />
          </nav>
          <div className="border-t px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Module</p>
            <Select value={selectedModule} onValueChange={(v) => { if (v) { setSelectedModule(v); setMobileMenuOpen(false); } }}>
              <SelectTrigger className="w-full">
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
          </div>
        </SheetContent>
      </Sheet>
    </header>
    <LowDataBanner />
    </>
  );
}
