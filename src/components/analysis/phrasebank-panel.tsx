"use client";

import { useState, useCallback } from "react";
import { PHRASE_SECTIONS, getAllPhrases } from "@/lib/academic-phrases";
import type { AcademicPhrase } from "@/lib/academic-phrases";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookText, Search, Copy, Check } from "lucide-react";

function PhraseCard({
  phrase,
  copiedText,
  onCopy,
}: {
  phrase: AcademicPhrase;
  copiedText: string | null;
  onCopy: (text: string) => void;
}) {
  const isCopied = copiedText === phrase.text;

  return (
    <button
      type="button"
      onClick={() => onCopy(phrase.text)}
      className="group flex w-full flex-col gap-1 rounded-xl border border-border/50
        bg-secondary/30 p-3 text-left transition-all duration-150
        hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{phrase.text}</p>
        <span className="mt-0.5 shrink-0">
          {isCopied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {phrase.tip}
      </p>
    </button>
  );
}

export function PhrasebankPanel() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, []);

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const isSearching = normalizedQuery.length > 0;

  // When searching, filter across all sections
  const searchResults = isSearching
    ? getAllPhrases().filter(
        (p) =>
          p.text.toLowerCase().includes(normalizedQuery) ||
          p.tip.toLowerCase().includes(normalizedQuery),
      )
    : [];

  // Group search results by section for display
  const groupedResults = isSearching
    ? PHRASE_SECTIONS.map((section) => ({
        ...section,
        phrases: searchResults.filter((p) => p.sectionKey === section.key),
      })).filter((s) => s.phrases.length > 0)
    : [];

  // When not searching, show the active section's phrases
  const activeData = !isSearching
    ? PHRASE_SECTIONS.find((s) => s.key === activeSection) ?? null
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookText className="h-5 w-5 text-primary" />
        <div>
          <p className="text-lg font-semibold">Academic Phrasebank</p>
          <p className="text-xs text-muted-foreground">
            Click any phrase to copy it to your clipboard
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search phrases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Section pills */}
      {!isSearching && (
        <div className="flex flex-wrap gap-1.5">
          {PHRASE_SECTIONS.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() =>
                  setActiveSection(isActive ? null : section.key)
                }
                className="cursor-pointer"
              >
                <Badge variant={isActive ? "default" : "secondary"}>
                  {section.label}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {/* Copied toast */}
      {copiedText && (
        <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
          <Check className="h-3 w-3" />
          Copied to clipboard
        </div>
      )}

      {/* Content */}
      {isSearching ? (
        groupedResults.length > 0 ? (
          <div className="space-y-4">
            {groupedResults.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label} ({section.phrases.length})
                </p>
                <div className="space-y-1.5">
                  {section.phrases.map((phrase) => (
                    <PhraseCard
                      key={phrase.text}
                      phrase={phrase}
                      copiedText={copiedText}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Search className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No phrases match &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground/70">
              Try a different search term
            </p>
          </div>
        )
      ) : activeData ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {activeData.label} ({activeData.phrases.length} phrases)
          </p>
          {activeData.phrases.map((phrase) => (
            <PhraseCard
              key={phrase.text}
              phrase={phrase}
              copiedText={copiedText}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <BookText className="h-10 w-10 text-primary/20" />
          <p className="text-sm text-muted-foreground">
            Select a section above to browse phrases
          </p>
          <p className="text-xs text-muted-foreground/70">
            Or use the search bar to find specific phrases
          </p>
        </div>
      )}
    </div>
  );
}
