"use client";

import { Card } from "@/components/ui/card";
import { Lightbulb, BookOpen, ExternalLink } from "lucide-react";

interface FixGuideProps {
  issue: string;
  approaches: string[];
  example?: { bad: string; why: string };
  resource?: { label: string; url: string };
}

/**
 * Guided fix component - shows HOW to fix without doing it FOR them.
 * Appears inline with flagged issues across all panels.
 */
export function FixGuide({ issue, approaches, example, resource }: FixGuideProps) {
  return (
    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/50 p-2.5 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Lightbulb className="h-3 w-3 text-blue-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          How to fix this
        </span>
      </div>

      <ul className="space-y-1">
        {approaches.map((approach, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-blue-800 dark:text-blue-300">
            <span className="mt-0.5 text-blue-400">{i + 1}.</span>
            <span>{approach}</span>
          </li>
        ))}
      </ul>

      {example && (
        <div className="mt-2 rounded bg-white/60 p-2 dark:bg-black/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-red-500">Avoid:</span>{" "}
            {example.bad}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-blue-500">Why:</span>{" "}
            {example.why}
          </p>
        </div>
      )}

      {resource && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <BookOpen className="h-2.5 w-2.5" />
          {resource.label}
          <ExternalLink className="h-2 w-2" />
        </a>
      )}
    </div>
  );
}

/**
 * Generate fix guidance based on issue type.
 * Returns approaches without writing content for the student.
 */
export function getFixGuide(
  issueType: string,
  detail?: string,
): { approaches: string[]; example?: { bad: string; why: string }; resource?: { label: string; url: string } } {
  switch (issueType) {
    case "perplexity":
      return {
        approaches: [
          "Replace generic academic phrases with your own natural way of saying it",
          "Read the sentence aloud — if it sounds like a textbook, rephrase it in your voice",
          "Use specific, concrete language instead of vague abstractions",
        ],
        example: {
          bad: "Phrases like 'provides a framework for understanding'",
          why: "This is a pattern AI detection tools flag because it's overly predictable",
        },
      };
    case "burstiness":
      return {
        approaches: [
          "Mix short sentences (5-10 words) with longer ones (20-30 words)",
          "Start some sentences with the subject, others with a clause or transition",
          "Break up any sequence of 3+ sentences with similar length",
        ],
        example: {
          bad: "Multiple consecutive sentences of ~15 words each",
          why: "Uniform sentence length is a strong AI detection signal",
        },
      };
    case "vocabulary":
      return {
        approaches: [
          "Replace 'significant' with a more specific word: crucial, devastating, transformative",
          "Use words you'd actually use in conversation with your lecturer",
          "Avoid cycling through the same 'safe' academic words",
        ],
      };
    case "transitions":
      return {
        approaches: [
          "Remove 'Furthermore' / 'Moreover' / 'Additionally' — just start the next point",
          "Connect ideas through meaning, not connector words",
          "Use varied transitions: 'This connects to...', 'Building on this...', 'In contrast...'",
        ],
        example: {
          bad: "Starting paragraphs with Furthermore, Moreover, Additionally",
          why: "These formulaic connectors are the strongest AI detection signal",
        },
      };
    case "patchwriting":
      return {
        approaches: [
          "Put the source away and write the idea from memory in your own words",
          "Change the sentence structure entirely, not just swap synonyms",
          "If you must use the original phrasing, put it in quotation marks and cite it",
        ],
        resource: {
          label: "Cornerstone guide on paraphrasing",
          url: "https://cornerstone.ac.za/student-information/",
        },
      };
    case "missing_citation":
      return {
        approaches: [
          "Identify which source this claim comes from and add (Author, Year)",
          "If it's your own observation, make that clear: 'In my experience...'",
          "If it's general knowledge (e.g. 'the sky is blue'), no citation needed",
        ],
      };
    case "format_error":
      return {
        approaches: [
          "Check the exact format your referencing style requires",
          "For Harvard: (Surname Year) or Surname (Year)",
          "For direct quotes always add page numbers: (Surname Year, p. X)",
        ],
        resource: {
          label: "Harvard referencing quick guide",
          url: "https://www.citethisforme.com/harvard-referencing",
        },
      };
    case "orphan_citation":
      return {
        approaches: [
          "Add the full reference to your Reference List",
          "Check spelling of the author name matches between in-text and reference list",
          "Ensure the year matches in both places",
        ],
      };
    case "orphan_reference":
      return {
        approaches: [
          "Either cite this source somewhere in your essay, or remove it from the reference list",
          "Every reference must be cited at least once in the text",
        ],
      };
    case "direct_copy":
      return {
        approaches: [
          "Put the copied text in quotation marks and add a page number citation",
          "Or better: close the source and rewrite the idea entirely in your own words",
          "Keep direct quotes under 40 words — longer quotes need block formatting",
        ],
      };
    case "close_paraphrase":
      return {
        approaches: [
          "You've kept the original sentence structure — restructure it completely",
          "Read the original, close it, wait 30 seconds, then write from memory",
          "Change both the words AND the sentence structure",
        ],
      };
    case "grammar":
    case "spelling":
    case "punctuation":
      return {
        approaches: [
          "Read the sentence aloud to catch the error naturally",
          "Check subject-verb agreement — does the verb match the subject?",
          "Review comma usage: use commas to separate clauses, not to add pauses",
        ],
      };
    case "informal":
    case "contraction":
      return {
        approaches: [
          "Replace contractions with full forms: don't → do not, can't → cannot",
          "Avoid colloquial expressions — rephrase in formal academic language",
          "Read your essay as if your lecturer is reading it aloud in class",
        ],
      };
    case "hedging":
      return {
        approaches: [
          "Replace 'might' with 'may' or make a stronger claim with evidence",
          "If uncertain, qualify with evidence: 'Research suggests...' instead of 'Maybe...'",
          "Academic writing allows hedging but it should be deliberate, not habitual",
        ],
      };
    default:
      return {
        approaches: [
          "Review this section carefully before submitting",
          "Consider whether your point is clear and well-supported",
          "Ask a classmate to read this section and give feedback",
        ],
      };
  }
}
