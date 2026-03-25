"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { MODULES } from "@/lib/constants";
import { db } from "@/lib/db-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Key } from "lucide-react";

export function SettingsDialog() {
  const {
    studentName,
    studentNumber,
    lecturers,
    apiKey,
    setStudentName,
    setStudentNumber,
    setLecturer,
    setApiKey,
  } = useSettingsStore();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(studentName);
  const [number, setNumber] = useState(studentNumber);
  const [localKey, setLocalKey] = useState(apiKey);
  const [localLecturers, setLocalLecturers] = useState(lecturers);

  const handleSave = async () => {
    setStudentName(name);
    setStudentNumber(number);
    setApiKey(localKey);
    Object.entries(localLecturers).forEach(([code, lecturer]) => {
      setLecturer(code, lecturer);
    });
    setOpen(false);
    // Sync to database
    setTimeout(() => useSettingsStore.getState().syncToDb(), 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground">
        <Settings className="h-4 w-4" />
        <span className="sr-only">Settings</span>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key - most important, show first */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Label htmlFor="s-apikey" className="flex items-center gap-1.5 text-sm font-medium">
              <Key className="h-3.5 w-3.5" />
              Anthropic API Key
            </Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Required for AI checks. Get yours at{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                console.anthropic.com
              </a>
            </p>
            <Input
              id="s-apikey"
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-ant-..."
              className="font-mono text-xs"
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="s-name">Full Name</Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name Surname"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="s-number">Student Number</Label>
            <Input
              id="s-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. 2026001"
              className="mt-1"
            />
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">
              Lecturers per Module
            </Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Used for the cover page when exporting to Word template
            </p>
            <div className="space-y-2">
              {MODULES.map((m) => (
                <div key={m.code} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                    {m.code}
                  </span>
                  <Input
                    value={localLecturers[m.code] || ""}
                    onChange={(e) =>
                      setLocalLecturers((prev) => ({
                        ...prev,
                        [m.code]: e.target.value,
                      }))
                    }
                    placeholder={m.name}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
