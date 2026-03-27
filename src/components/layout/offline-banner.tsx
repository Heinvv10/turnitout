"use client";

import { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";

interface OfflineBannerProps {
  isOnline: boolean;
}

/**
 * Animated banner shown when the user is offline.
 * Dismissable, but reappears on page reload if still offline.
 */
export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Reset dismissed state when going offline again
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // Animate in/out
  useEffect(() => {
    if (!isOnline && !dismissed) {
      // Slight delay for slide-in animation
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [isOnline, dismissed]);

  if (isOnline || dismissed) return null;

  return (
    <div
      className={`
        flex items-center justify-between gap-3 border-b border-amber-300/30
        bg-amber-50 px-4 py-2.5 text-sm text-amber-900
        transition-all duration-300 ease-out
        dark:border-amber-700/30 dark:bg-amber-950/50 dark:text-amber-200
        ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <p>
          You&apos;re offline. Local checks (readability, vocabulary, ESL) still
          work. API checks will run when you reconnect.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
        aria-label="Dismiss offline banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
