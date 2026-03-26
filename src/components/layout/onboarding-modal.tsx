"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import {
  COUNTRIES,
  GRADING_SCALES,
  REFERENCING_STYLES,
} from "@/lib/i18n-config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Key } from "lucide-react";

const COUNTRY_FLAGS: Record<string, string> = {
  ZA: "🇿🇦", GB: "🇬🇧", US: "🇺🇸", AU: "🇦🇺", NZ: "🇳🇿",
  CA: "🇨🇦", IE: "🇮🇪", DE: "🇩🇪", NL: "🇳🇱", FR: "🇫🇷",
  IN: "🇮🇳", NG: "🇳🇬", KE: "🇰🇪", GH: "🇬🇭", OTHER: "🌍",
};

const TOTAL_STEPS = 4;

export function OnboardingModal() {
  const {
    onboardingComplete,
    setCountry,
    setUniversity,
    setGradingScale,
    setReferencingStyle,
    setLanguage,
    setStudentName,
    setStudentNumber,
    setApiKey,
    setOnboardingComplete,
    syncToDb,
  } = useSettingsStore();

  const [step, setStep] = useState(1);
  const [localCountry, setLocalCountry] = useState("ZA");
  const [localUniversity, setLocalUniversity] = useState("Cornerstone Institute");
  const [localScale, setLocalScale] = useState("south_africa");
  const [localRefStyle, setLocalRefStyle] = useState("harvard");
  const [localName, setLocalName] = useState("");
  const [localStudentNumber, setLocalStudentNumber] = useState("");
  const [localApiKey, setLocalApiKey] = useState("");

  if (onboardingComplete) return null;

  const handleCountrySelect = (code: string) => {
    setLocalCountry(code);
    const country = COUNTRIES.find((c) => c.code === code);
    if (country) {
      setLocalScale(country.defaultScale);
      setLocalRefStyle(country.defaultRef);
    }
  };

  const handleFinish = () => {
    setCountry(localCountry);
    setUniversity(localUniversity);
    setGradingScale(localScale);
    setReferencingStyle(localRefStyle);
    const country = COUNTRIES.find((c) => c.code === localCountry);
    setLanguage(country?.defaultLang || "en-GB");
    setStudentName(localName);
    setStudentNumber(localStudentNumber);
    setApiKey(localApiKey);
    setOnboardingComplete(true);
    setTimeout(() => syncToDb(), 100);
  };

  const canAdvance = (): boolean => {
    if (step === 1) return !!localCountry;
    if (step === 2) return localUniversity.trim().length > 0;
    if (step === 3) return !!localScale && !!localRefStyle;
    if (step === 4) return localName.trim().length > 0;
    return true;
  };

  return (
    <Dialog open={!onboardingComplete} onOpenChange={() => { /* prevent closing */ }}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <DialogTitle>Welcome to TurnItOut</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {step === 1 && "Where are you studying? This helps us set up the right grading scale."}
            {step === 2 && "Which university or institution do you attend?"}
            {step === 3 && "Confirm your grading scale and referencing style."}
            {step === 4 && "Almost done! Tell us a bit about yourself."}
          </p>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Step 1: Country */}
        {step === 1 && (
          <div className="grid grid-cols-3 gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c.code)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors hover:bg-accent ${
                  localCountry === c.code
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
                }`}
              >
                <span className="text-2xl">{COUNTRY_FLAGS[c.code] || "🌍"}</span>
                <span className="text-xs font-medium leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: University */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ob-university">University / Institution</Label>
              <Input
                id="ob-university"
                value={localUniversity}
                onChange={(e) => setLocalUniversity(e.target.value)}
                placeholder="e.g. University of Cape Town"
                className="mt-1"
                autoFocus
              />
            </div>
            {localCountry && (
              <p className="text-xs text-muted-foreground">
                Selected country:{" "}
                <Badge variant="secondary" className="text-xs">
                  {COUNTRY_FLAGS[localCountry]}{" "}
                  {COUNTRIES.find((c) => c.code === localCountry)?.label}
                </Badge>
              </p>
            )}
          </div>
        )}

        {/* Step 3: Grading + Referencing */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Grading Scale</Label>
              <Select value={localScale} onValueChange={(v) => v && setLocalScale(v)}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select grading scale" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GRADING_SCALES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label} (pass: {val.pass}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localScale && (
                <div className="mt-2 rounded-md border bg-muted/50 p-2">
                  <p className="mb-1 text-xs font-medium">Grade boundaries:</p>
                  <div className="flex flex-wrap gap-1">
                    {GRADING_SCALES[localScale as keyof typeof GRADING_SCALES]?.scale.map((g) => (
                      <Badge key={g.min} variant="outline" className="text-[10px]">
                        {g.min}%+ {g.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Referencing Style</Label>
              <Select value={localRefStyle} onValueChange={(v) => v && setLocalRefStyle(v)}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select referencing style" />
                </SelectTrigger>
                <SelectContent>
                  {REFERENCING_STYLES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localRefStyle && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {REFERENCING_STYLES.find((s) => s.id === localRefStyle)?.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Student info + API key */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ob-name">Full Name</Label>
              <Input
                id="ob-name"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Name Surname"
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="ob-studentnum">Student Number</Label>
              <Input
                id="ob-studentnum"
                value={localStudentNumber}
                onChange={(e) => setLocalStudentNumber(e.target.value)}
                placeholder="e.g. 2026001"
                className="mt-1"
              />
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Label htmlFor="ob-apikey" className="flex items-center gap-1.5 text-sm font-medium">
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
                id="ob-apikey"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <Button size="sm" onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
              Next
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleFinish} disabled={!canAdvance()}>
              <Check className="mr-1 h-4 w-4" />
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
