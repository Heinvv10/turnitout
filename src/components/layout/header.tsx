"use client";

import { useSettingsStore } from "@/store/settings-store";
import { MODULES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Moon, Sun, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettingsDialog } from "./settings-dialog";

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
