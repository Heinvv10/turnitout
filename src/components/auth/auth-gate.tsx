"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginModal } from "./login-modal";
import { UserPlus, LogIn, Shield, Sparkles } from "lucide-react";

interface AuthGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}

export function AuthGate({ open, onOpenChange, feature }: AuthGateProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<"register" | "login">("register");

  const handleCreate = () => {
    setLoginTab("register");
    onOpenChange(false);
    setLoginOpen(true);
  };

  const handleSignIn = () => {
    setLoginTab("login");
    onOpenChange(false);
    setLoginOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-violet-500" />
              Create your free account to continue
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              You&apos;ve written your essay — great! Now let our AI check it
              for grammar, plagiarism, and predict your grade. Create a free
              account to get 2 AI checks.
            </p>

            <div className="rounded-md border border-violet-500/20 bg-violet-950/20 p-3">
              <p className="text-xs font-medium text-violet-400 mb-2">
                You tried to use: {feature}
              </p>
              <div className="flex items-center gap-2 text-sm text-violet-300">
                <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                <span>
                  2 free AI checks — no credit card required
                </span>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create Free Account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={handleSignIn}
                className="inline-flex items-center gap-1 text-primary underline hover:text-primary/80"
              >
                <LogIn className="h-3 w-3" />
                Sign In
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        defaultTab={loginTab}
        key={loginTab}
      />
    </>
  );
}
