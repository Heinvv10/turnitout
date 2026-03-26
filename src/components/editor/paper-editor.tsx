"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useRef, useEffect } from "react";
import { usePaperStore } from "@/store/paper-store";
import { useSettingsStore } from "@/store/settings-store";
import { EditorToolbar } from "./editor-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionView } from "./section-view";
import { MODULE_RUBRICS } from "@/lib/module-rubrics";
import { Input } from "@/components/ui/input";
import {
  Upload,
  BookOpen,
  FileText,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { OutlineGenerator } from "./outline-generator";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function countReferences(text: string): number {
  return text.split("\n").filter((l) => l.trim().length > 10).length;
}

function splitBodyAndReferences(text: string): {
  body: string;
  references: string;
} {
  const refMatch = text.match(
    /\n\s*(references?|bibliography|reference\s*list)\s*\n/i,
  );
  if (refMatch && refMatch.index !== undefined) {
    return {
      body: text.slice(0, refMatch.index).trim(),
      references: text.slice(refMatch.index + refMatch[0].length).trim(),
    };
  }
  return { body: text, references: "" };
}

export function PaperEditor() {
  const {
    currentPaper,
    updateContent,
    updateReferences,
    updateTitle,
    setPaper,
    clearResults,
    sections,
    setSections,
    isSplitting,
    setIsSplitting,
  } = usePaperStore();
  const { apiKey, selectedModule, moduleOutlines } = useSettingsStore();

  // Auto-fill title from outline
  const outline = moduleOutlines[selectedModule] || MODULE_RUBRICS[selectedModule];
  const defaultTitle = outline?.assessments?.find(
    (a) => a.type !== "Summative",
  )?.name || "";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto AI-split when content changes (debounced)
  const triggerAiSplit = useCallback(
    async (bodyText: string, refText: string) => {
      if (!apiKey || bodyText.length < 100) return;
      setIsSplitting(true);
      try {
        const fullText = refText
          ? `${bodyText}\n\nReference List\n${refText}`
          : bodyText;
        const res = await fetch("/api/split-sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fullText, apiKey }),
        });
        const data = await res.json();
        if (!data.error) {
          setSections({
            introduction: data.introduction || "",
            body: data.body || "",
            conclusion: data.conclusion || "",
            references: data.references || refText || "",
          });
        }
      } catch {
        // Silent fail - sections stay empty
      } finally {
        setIsSplitting(false);
      }
    },
    [apiKey, setSections, setIsSplitting],
  );

  const bodyEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Paste your full essay here...\n\nIt will be automatically split into Introduction, Body, and Conclusion.",
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: currentPaper?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[350px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const { body, references } = splitBodyAndReferences(text);

      if (references && refEditor) {
        refEditor.commands.setContent(
          `<p>${references.replace(/\n/g, "</p><p>")}</p>`,
        );
        updateReferences(refEditor.getHTML(), references);
      }

      const bodyText = references ? body : text;
      const words = countWords(bodyText);

      if (!currentPaper) {
        setPaper({
          id: crypto.randomUUID(),
          moduleCode: "",
          title: defaultTitle || "",
          content: references ? editor.getHTML() : html,
          plainText: bodyText,
          wordCount: words,
          references: references || "",
          referencesHtml: "",
          referenceCount: countReferences(references || ""),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        updateContent(
          references ? editor.getHTML() : html,
          bodyText,
          words,
        );
      }

      // Debounced AI split
      if (splitTimeoutRef.current) clearTimeout(splitTimeoutRef.current);
      splitTimeoutRef.current = setTimeout(() => {
        triggerAiSplit(bodyText, references || currentPaper?.references || "");
      }, 2000);
    },
  });

  const refEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Reference list (auto-detected or paste here)",
      }),
    ],
    content: currentPaper?.referencesHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[60px] p-3 focus:outline-none text-xs",
      },
    },
    onUpdate: ({ editor }) => {
      updateReferences(editor.getHTML(), editor.getText());
    },
  });

  const handleDocxUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.name.endsWith(".docx")) return;
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const fullText = await mammoth
          .extractRawText({ arrayBuffer })
          .then((r) => r.value);
        const result = await mammoth.convertToHtml({ arrayBuffer });

        const { body, references } = splitBodyAndReferences(fullText);
        bodyEditor?.commands.setContent(result.value);
        if (references && refEditor) {
          refEditor.commands.setContent(
            `<p>${references.replace(/\n/g, "</p><p>")}</p>`,
          );
        }

        setPaper({
          id: crypto.randomUUID(),
          moduleCode: "",
          title: file.name.replace(".docx", ""),
          content: bodyEditor?.getHTML() || "",
          plainText: body,
          wordCount: countWords(body),
          references,
          referencesHtml: refEditor?.getHTML() || "",
          referenceCount: countReferences(references),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Trigger AI split
        triggerAiSplit(body, references);
      } catch (err) {
        console.error("Failed to parse .docx:", err);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [bodyEditor, refEditor, setPaper, triggerAiSplit],
  );

  const handleClearAll = useCallback(() => {
    bodyEditor?.commands.clearContent();
    refEditor?.commands.clearContent();
    clearResults();
    setSections(null);
    setPaper({
      id: crypto.randomUUID(),
      moduleCode: "",
      title: "Untitled Paper",
      content: "",
      plainText: "",
      wordCount: 0,
      references: "",
      referencesHtml: "",
      referenceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [bodyEditor, refEditor, clearResults, setSections, setPaper]);

  const bodyWordCount = currentPaper?.wordCount || 0;
  const refCount = currentPaper?.referenceCount || 0;

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Essay Body */}
      <div className="flex flex-1 flex-col rounded-xl shadow-sm border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Essay</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {bodyWordCount} words
            </Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleDocxUpload}
            />
            {bodyWordCount < 50 && (
              <OutlineGenerator editor={bodyEditor} />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              .docx
            </Button>
            {bodyWordCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleClearAll}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="border-b px-3 py-1.5">
          <Input
            value={currentPaper?.title || defaultTitle || ""}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Essay title (e.g. PERMA Reflective Essay)"
            className="h-7 border-0 bg-transparent px-1 text-sm font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
          />
        </div>
        <EditorToolbar editor={bodyEditor} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={bodyEditor} />
        </div>

        {/* Visual section breakdown */}
        <SectionView />

        {/* Section split status bar */}
        {bodyWordCount > 0 && (
          <div className="flex items-center gap-2 border-t bg-muted/20 px-3 py-1.5 text-xs">
            {isSplitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">
                  Detecting sections...
                </span>
              </>
            ) : sections ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">
                  Intro: {countWords(sections.introduction)}w
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  Body: {countWords(sections.body)}w
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  Conclusion: {countWords(sections.conclusion)}w
                </span>
                {sections.references && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      Refs: {countReferences(sections.references)}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">
                Sections will be auto-detected after you paste your essay
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reference List */}
      <div className="flex flex-col rounded-xl shadow-sm border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Reference List</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {refCount} references
          </Badge>
        </div>
        <div className="max-h-[150px] overflow-y-auto">
          <EditorContent editor={refEditor} />
        </div>
      </div>
    </div>
  );
}
