"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./login-modal";
import { Lock, UserPlus, Check, Sparkles } from "lucide-react";

const FREE_ACCOUNT_FEATURES = [
  "Readability & vocabulary analysis",
  "ESL & Afrikaans writing tips",
  "Citation cross-checker",
  "Self-plagiarism checker",
  "Academic phrasebank (92 phrases)",
  "Text-to-speech proofreading",
  "Submission readiness checklist",
  "2 free AI checks (grammar, plagiarism, grading)",
];

export function LockedPanel() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mx-auto max-w-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Create a free account to see your results
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Paste your essay on the left, then sign up to unlock all checks
              and analysis tools. It takes 30 seconds.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 text-left">
            <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Sparkles className="inline h-3 w-3 mr-1" />
              Free account includes
            </p>
            <ul className="space-y-2">
              {FREE_ACCOUNT_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={() => setLoginOpen(true)} className="w-full" size="lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Free Account
          </Button>

          <p className="text-xs text-muted-foreground">
            No credit card required. Takes 30 seconds.
          </p>
        </div>
      </div>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} defaultTab="register" />
    </>
  );
}
