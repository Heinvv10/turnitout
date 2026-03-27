"use client";

import { useEffect, useState } from "react";
import { CloudOff, RefreshCw, X } from "lucide-react";

interface OfflineToastProps {
  message: string;
  type: "queued" | "reconnected";
  onDismiss: () => void;
}

/**
 * Lightweight toast notification for offline queue events.
 * Auto-dismisses after 5 seconds.
 */
export function OfflineToast({ message, type, onDismiss }: OfflineToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  const Icon = type === "queued" ? CloudOff : RefreshCw;
  const bgClass =
    type === "queued"
      ? "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/80 dark:border-amber-700 dark:text-amber-200"
      : "bg-green-50 border-green-300 text-green-900 dark:bg-green-950/80 dark:border-green-700 dark:text-green-200";

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3
        rounded-lg border px-4 py-3 shadow-lg
        transition-all duration-300 ease-out
        ${bgClass}
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${type === "reconnected" ? "animate-spin" : ""}`}
      />
      <p className="text-sm">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
