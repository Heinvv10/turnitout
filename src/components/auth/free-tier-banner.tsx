"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./login-modal";
import { Lock, UserPlus, Sparkles } from "lucide-react";

export function FreeTierBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="border-b border-primary/20 bg-primary/5 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Lock className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                You&apos;re not signed in.{" "}
                <span className="text-muted-foreground font-normal">
                  You can paste your essay, but all checks require a free account.
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Sparkles className="inline h-3 w-3 text-primary mr-1" />
                Create a free account to unlock readability, vocabulary, ESL tips, citation checks, and get <strong>2 free AI checks</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setLoginOpen(true)}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Create Free Account
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground text-xs underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
