"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useRef, useState } from "react";
import { usePaperStore } from "@/store/paper-store";
import { EditorToolbar } from "./editor-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, BookOpen, FileText } from "lucide-react";

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function countReferences(text: string): number {
  return text
    .split("\n")
    .filter((l) => l.trim().length > 10).length;
}

export function PaperEditor() {
  const { currentPaper, updateContent, updateReferences, setPaper } =
    usePaperStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Essay body editor
  const bodyEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Write your essay here (Introduction, Body, Conclusion)...\n\nDo NOT include your reference list here — use the Reference List section below.",
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: currentPaper?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = countWords(text);

      if (!currentPaper) {
        setPaper({
          id: crypto.randomUUID(),
          moduleCode: "",
          title: "Untitled Paper",
          content: html,
          plainText: text,
          wordCount: words,
          references: "",
          referencesHtml: "",
          referenceCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        updateContent(html, text, words);
      }
    },
  });

  // Reference list editor
  const refEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Paste your reference list here...\n\nOne reference per line, Harvard format:\nAuthor, I. (Year). Title. Publisher.",
      }),
    ],
    content: currentPaper?.referencesHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[120px] p-3 focus:outline-none text-xs",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      updateReferences(html, text);
    },
  });

  const handleDocxUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.name.endsWith(".docx")) return;

      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const fullHtml = result.value;
        const fullText = await mammoth
          .extractRawText({ arrayBuffer })
          .then((r) => r.value);

        // Try to split body from references
        const refMatch = fullText.match(
          /\n\s*(references?|bibliography|reference\s+list)\s*\n/i,
        );

        let bodyText = fullText;
        let refText = "";

        if (refMatch && refMatch.index) {
          bodyText = fullText.slice(0, refMatch.index).trim();
          refText = fullText
            .slice(refMatch.index + refMatch[0].length)
            .trim();
        }

        bodyEditor?.commands.setContent(
          `<p>${bodyText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`,
        );

        if (refText && refEditor) {
          refEditor.commands.setContent(
            `<p>${refText.replace(/\n/g, "</p><p>")}</p>`,
          );
        }

        const bodyWords = countWords(bodyText);

        setPaper({
          id: crypto.randomUUID(),
          moduleCode: "",
          title: file.name.replace(".docx", ""),
          content: bodyEditor?.getHTML() || "",
          plainText: bodyText,
          wordCount: bodyWords,
          references: refText,
          referencesHtml: refEditor?.getHTML() || "",
          referenceCount: countReferences(refText),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to parse .docx file:", err);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [bodyEditor, refEditor, setPaper],
  );

  const bodyWordCount = currentPaper?.wordCount || 0;
  const refCount = currentPaper?.referenceCount || 0;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Essay Body */}
      <div className="flex flex-1 flex-col rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Essay Body</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {bodyWordCount} words
            </Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleDocxUpload}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Upload .docx
            </Button>
          </div>
        </div>
        <EditorToolbar editor={bodyEditor} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={bodyEditor} />
        </div>
      </div>

      {/* Reference List */}
      <div className="flex flex-col rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Reference List</span>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {refCount} references
          </Badge>
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          <EditorContent editor={refEditor} />
        </div>
      </div>
    </div>
  );
}
