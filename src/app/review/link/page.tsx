"use client";

import { use, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ReviewData {
  t: string; // title
  e: string; // essay text
}

const PROMPTS = [
  "Is the thesis/argument clearly stated?",
  "Are sources properly cited and referenced?",
  "Is the writing clear and academic in tone?",
  "What is the strongest part of the essay?",
  "What needs the most improvement?",
] as const;

/** Decode URL-safe base64 back to ReviewData */
function decodeReviewData(encoded: string): ReviewData | null {
  try {
    let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Re-add padding
    while (b64.length % 4 !== 0) {
      b64 += "=";
    }
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as ReviewData;
  } catch {
    return null;
  }
}

const FEEDBACK_STORAGE_PREFIX = "turnitout-review-feedback-";

export default function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(searchParams);
  const encodedData =
    typeof resolvedParams.d === "string" ? resolvedParams.d : null;

  const reviewData = useMemo(
    () => (encodedData ? decodeReviewData(encodedData) : null),
    [encodedData]
  );

  const storageKey = encodedData
    ? `${FEEDBACK_STORAGE_PREFIX}${encodedData.slice(0, 32)}`
    : null;

  const [feedback, setFeedback] = useState<string[]>(() => {
    if (!storageKey || typeof window === "undefined") {
      return PROMPTS.map(() => "");
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored) as string[];
    } catch {
      // ignore
    }
    return PROMPTS.map(() => "");
  });

  const [saved, setSaved] = useState(false);

  const updateFeedback = useCallback(
    (index: number, value: string) => {
      setFeedback((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
      setSaved(false);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(feedback));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // storage full or unavailable
    }
  }, [storageKey, feedback]);

  if (!encodedData || !reviewData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive/60" />
            <p className="text-sm font-medium">Invalid Review Link</p>
            <p className="text-xs text-muted-foreground">
              This link is missing or contains invalid review data. Ask the
              essay author to generate a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="text-lg font-semibold">TurnItOut Peer Review</span>
          </div>
          <h1 className="text-xl font-bold">{reviewData.t}</h1>
          <p className="text-sm text-muted-foreground">
            Read the essay below, then provide structured feedback.
          </p>
        </div>

        {/* Essay text (read-only, scrollable) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Essay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto rounded-lg border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {reviewData.e}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Structured feedback prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              Review Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {PROMPTS.map((prompt, idx) => (
              <div key={prompt} className="space-y-1.5">
                <label
                  htmlFor={`prompt-${idx}`}
                  className="block text-sm font-medium"
                >
                  {idx + 1}. {prompt}
                </label>
                <Textarea
                  id={`prompt-${idx}`}
                  placeholder="Type your feedback here..."
                  value={feedback[idx] ?? ""}
                  onChange={(e) => updateFeedback(idx, e.target.value)}
                  className="min-h-20"
                />
              </div>
            ))}

            <Button onClick={handleSave} className="w-full gap-2">
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved Locally
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Feedback
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Feedback is saved to your browser only. Share your notes with
              the author directly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
