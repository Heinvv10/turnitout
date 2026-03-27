"use client";

import { useState, useCallback } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settings-store";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParaphraseButtonProps {
  text: string;
}

export function ParaphraseButton({ text }: ParaphraseButtonProps) {
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { apiKey } = useSettingsStore();

  const fetchAlternatives = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, apiKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAlternatives(data.alternatives || []);
      setHasFetched(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to rephrase";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [text, apiKey]);

  const handleCopy = useCallback(async (alt: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(alt);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, []);

  const handleOpen = useCallback(
    (open: boolean) => {
      if (open && !hasFetched && !loading) {
        fetchAlternatives();
      }
    },
    [hasFetched, loading, fetchAlternatives],
  );

  return (
    <PopoverPrimitive.Root onOpenChange={handleOpen}>
      <PopoverPrimitive.Trigger
        render={
          <Button variant="ghost" size="xs" className="text-primary">
            <RefreshCw className="mr-1 h-3 w-3" />
            Rephrase
          </Button>
        }
      />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side="bottom" align="start" sideOffset={4}>
          <PopoverPrimitive.Popup
            className={cn(
              "z-50 w-80 rounded-lg border bg-background p-3 shadow-lg",
              "animate-in fade-in-0 zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <PopoverPrimitive.Arrow className="size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] border bg-background" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                  Alternative Phrasings
                </p>
                {hasFetched && !loading && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={fetchAlternatives}
                    title="Regenerate"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Generating alternatives...
                  </span>
                </div>
              )}

              {error && !loading && (
                <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                  {error}
                  <Button
                    variant="ghost"
                    size="xs"
                    className="mt-1 w-full"
                    onClick={fetchAlternatives}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {!loading && !error && alternatives.length > 0 && (
                <div className="space-y-2">
                  {alternatives.map((alt, idx) => (
                    <Card
                      key={idx}
                      className="p-2 text-xs leading-relaxed"
                    >
                      <p className="mb-1.5 text-muted-foreground">
                        {alt}
                      </p>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="w-full justify-center"
                        onClick={() => handleCopy(alt, idx)}
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="mr-1 h-3 w-3 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
