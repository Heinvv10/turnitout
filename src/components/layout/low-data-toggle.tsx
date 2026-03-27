"use client";

import { useSettingsStore } from "@/store/settings-store";
import { WifiOff } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function LowDataToggle() {
  const { lowDataMode, setLowDataMode } = useSettingsStore();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={() => setLowDataMode(!lowDataMode)}
          className={`inline-flex items-center justify-center rounded-md h-9 w-9 ${
            lowDataMode
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <WifiOff className="h-4 w-4" />
          <span className="sr-only">
            {lowDataMode ? "Disable" : "Enable"} Low Data Mode
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{lowDataMode ? "Low Data Mode ON" : "Enable Low Data Mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function LowDataBanner() {
  const lowDataMode = useSettingsStore((s) => s.lowDataMode);

  if (!lowDataMode) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-600/15 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
      <WifiOff className="h-3 w-3 shrink-0" />
      <span>
        Some features disabled to save data. Turn off Low Data Mode in settings
        for full analysis.
      </span>
    </div>
  );
}
