"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/store/paper-store";
import { Volume2, Pause, Square } from "lucide-react";

type PlaybackState = "idle" | "playing" | "paused";

const SPEED_OPTIONS = [0.8, 1, 1.2, 1.5] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function TTSButton() {
  const currentPaper = usePaperStore((s) => s.currentPaper);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [totalParagraphs, setTotalParagraphs] = useState(0);
  const [supported, setSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const paragraphsRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const speedRef = useRef<Speed>(speed);
  const isMountedRef = useRef(true);

  // SSR guard
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Keep speedRef in sync
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const speakParagraph = useCallback((index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (index >= paragraphsRef.current.length) {
      setPlaybackState("idle");
      setCurrentParagraph(0);
      currentIndexRef.current = 0;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      paragraphsRef.current[index]
    );
    utterance.rate = speedRef.current;
    utterance.onend = () => {
      if (!isMountedRef.current) return;
      const nextIndex = currentIndexRef.current + 1;
      currentIndexRef.current = nextIndex;
      setCurrentParagraph(nextIndex);
      speakParagraph(nextIndex);
    };
    utterance.onerror = (event) => {
      if (!isMountedRef.current) return;
      // "interrupted" and "canceled" are normal when user stops/pauses
      if (event.error === "interrupted" || event.error === "canceled") return;
      setPlaybackState("idle");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const text = currentPaper?.plainText;
    if (!text) return;

    if (playbackState === "paused") {
      window.speechSynthesis.resume();
      setPlaybackState("playing");
      return;
    }

    // Start fresh
    window.speechSynthesis.cancel();
    const paragraphs = splitIntoParagraphs(text);
    if (paragraphs.length === 0) return;

    paragraphsRef.current = paragraphs;
    currentIndexRef.current = 0;
    setCurrentParagraph(0);
    setTotalParagraphs(paragraphs.length);
    setPlaybackState("playing");
    speakParagraph(0);
  }, [currentPaper?.plainText, playbackState, speakParagraph]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setPlaybackState("paused");
  }, []);

  const handleStop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlaybackState("idle");
    setCurrentParagraph(0);
    currentIndexRef.current = 0;
  }, []);

  const handleSpeedChange = useCallback(
    (newSpeed: Speed) => {
      setSpeed(newSpeed);
      speedRef.current = newSpeed;
      // If currently playing, restart current paragraph at new speed
      if (playbackState === "playing" && typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        speakParagraph(currentIndexRef.current);
      }
    },
    [playbackState, speakParagraph]
  );

  if (!supported) return null;

  const hasText = Boolean(currentPaper?.plainText);
  const isActive = playbackState !== "idle";

  return (
    <div className="flex items-center gap-1">
      {/* Play / Pause toggle */}
      {playbackState === "playing" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          title="Pause reading"
        >
          <Pause className="mr-1.5 h-3.5 w-3.5" />
          Pause
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlay}
          disabled={!hasText}
          title={
            playbackState === "paused" ? "Resume reading" : "Read essay aloud"
          }
        >
          <Volume2 className="mr-1.5 h-3.5 w-3.5" />
          {playbackState === "paused" ? "Resume" : "Read Aloud"}
        </Button>
      )}

      {/* Stop button - only visible when active */}
      {isActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          title="Stop reading"
          className="px-2"
        >
          <Square className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Speed selector - cycles through speeds on click */}
      <Button
        variant="ghost"
        size="sm"
        className="px-2 text-xs text-muted-foreground"
        disabled={!hasText}
        onClick={() => {
          const currentIdx = SPEED_OPTIONS.indexOf(speed);
          const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
          handleSpeedChange(SPEED_OPTIONS[nextIdx]);
        }}
        title="Cycle playback speed"
      >
        {speed}x
      </Button>

      {/* Progress indicator */}
      {isActive && totalParagraphs > 0 && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Paragraph {currentParagraph + 1} of {totalParagraphs}
        </span>
      )}
    </div>
  );
}
