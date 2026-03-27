"use client";

import { useState, useCallback, useEffect } from "react";
import { usePaperStore } from "@/store/paper-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Link as LinkIcon,
  Copy,
  Share2,
  Trash2,
  Check,
  ExternalLink,
} from "lucide-react";

interface ReviewLink {
  id: string;
  title: string;
  createdAt: string;
  url: string;
}

const STORAGE_KEY = "turnitout-reviews";

function getStoredLinks(): ReviewLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewLink[]) : [];
  } catch {
    return [];
  }
}

function setStoredLinks(links: ReviewLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

/** Compress essay text to first 500 words for URL encoding */
function truncateText(text: string, maxWords = 500): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

/** Encode review payload as base64 URL-safe string */
function encodeReviewData(title: string, text: string): string {
  const payload = JSON.stringify({
    t: title,
    e: truncateText(text),
  });
  // TextEncoder -> Uint8Array -> base64
  const bytes = new TextEncoder().encode(payload);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildReviewUrl(data: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/review/link?d=${data}`;
}

export function PeerReviewPanel() {
  const { currentPaper } = usePaperStore();
  const [links, setLinks] = useState<ReviewLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    setLinks(getStoredLinks());
  }, []);

  const handleGenerate = useCallback(() => {
    if (!currentPaper?.plainText) return;

    const title = currentPaper.title || "Untitled Essay";
    const encoded = encodeReviewData(title, currentPaper.plainText);
    const url = buildReviewUrl(encoded);
    const id = crypto.randomUUID();

    const newLink: ReviewLink = {
      id,
      title,
      createdAt: new Date().toISOString(),
      url,
    };

    const updated = [newLink, ...links];
    setLinks(updated);
    setStoredLinks(updated);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 2000);
  }, [currentPaper, links]);

  const handleCopy = useCallback(async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback: select text from hidden input
    }
  }, []);

  const handleWhatsApp = useCallback((url: string, title: string) => {
    const text = encodeURIComponent(
      `Please review my essay "${title}" on TurnItOut:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, []);

  const handleShare = useCallback(async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Review: ${title}`,
          text: `Please review my essay "${title}"`,
          url,
        });
      } catch {
        // User cancelled or API unavailable
      }
    }
  }, []);

  const handleRevoke = useCallback(
    (id: string) => {
      const updated = links.filter((l) => l.id !== id);
      setLinks(updated);
      setStoredLinks(updated);
    },
    [links]
  );

  if (!currentPaper?.plainText) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Upload or paste an essay to generate a peer review link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Peer Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate a shareable link so a classmate can review your essay with
            structured feedback prompts. The first 500 words are included.
          </p>
          <Button onClick={handleGenerate} className="w-full gap-2">
            {generated ? (
              <>
                <Check className="h-4 w-4" />
                Link Generated
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Generate Review Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Active Links ({links.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="rounded-lg border bg-secondary/30 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {link.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRevoke(link.id)}
                    title="Revoke link"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleCopy(link.url, link.id)}
                    className="gap-1"
                  >
                    {copied === link.id ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied === link.id ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      handleWhatsApp(link.url, link.title)
                    }
                    className="gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    WhatsApp
                  </Button>
                  {typeof navigator !== "undefined" &&
                    typeof navigator.share === "function" && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          handleShare(link.url, link.title)
                        }
                        className="gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Share
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
