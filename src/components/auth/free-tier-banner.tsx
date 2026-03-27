"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./login-modal";
import {
  X,
  Check,
  Lock,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const FREE_FEATURES = [
  "Readability",
  "Vocabulary",
  "ESL Tips",
  "Citation Cross-Check",
  "Self-Plagiarism",
  "TTS",
  "Phrasebank",
];

const GATED_FEATURES = [
  "Grammar AI",
  "Plagiarism",
  "AI Risk",
  "Grading",
  "Academize",
  "Coach",
];

export function FreeTierBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="relative border-b border-lime-500/20 bg-lime-950/30 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-lime-200">
              <span className="font-semibold">You&apos;re using TurnItOut Free!</span>{" "}
              <span className="text-lime-300/80">
                Paste your essay and use readability, vocabulary, ESL, and
                citation checks — all free, no account needed. Create an account
                to unlock AI-powered grammar, plagiarism, and grade checks.
              </span>
            </p>

            {/* Expandable feature lists */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expanded ? "Hide details" : "See what's included"}
            </button>

            {expanded && (
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
                <div>
                  <p className="mb-1 text-xs font-medium text-lime-400">
                    Free
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {FREE_FEATURES.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 text-xs text-lime-300"
                      >
                        <Check className="h-3 w-3 text-lime-500" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-violet-400">
                    Requires account
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {GATED_FEATURES.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 text-xs text-violet-300/70"
                      >
                        <Lock className="h-3 w-3 text-violet-500" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setLoginOpen(true)}
              className="bg-lime-600 text-white hover:bg-lime-700 text-xs"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Create Free Account
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-lime-400/60 hover:text-lime-300 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
