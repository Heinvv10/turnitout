"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginModal } from "./login-modal";
import { LogIn, LogOut, Settings, User } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLoginOpen(true)}
        >
          <LogIn className="mr-1.5 h-3.5 w-3.5" />
          Sign In
        </Button>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const tierLabel =
    (user as { subscriptionTier?: string }).subscriptionTier === "annual"
      ? "Annual"
      : (user as { subscriptionTier?: string }).subscriptionTier === "student"
        ? "Student"
        : "Free";

  const tierVariant =
    (user as { subscriptionTier?: string }).subscriptionTier === "free"
      ? "secondary"
      : "default";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-opacity hover:opacity-80"
        title={user.name || "User"}
      >
        {initials}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant={tierVariant}>{tierLabel} Plan</Badge>
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            onClick={() => setMenuOpen(false)}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>

          <div className="my-1 h-px bg-border" />

          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            onClick={() => {
              setMenuOpen(false);
              signOut();
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
