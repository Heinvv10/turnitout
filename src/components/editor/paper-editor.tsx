"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useRef } from "react";
import { usePaperStore } from "@/store/paper-store";
import { EditorToolbar } from "./editor-toolbar";
import { WordCounter } from "./word-counter";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function PaperEditor() {
  const { currentPaper, updateContent, setPaper } = usePaperStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "Start writing your paper here, or paste your text...\n\nTip: Use the toolbar above for formatting (headings, bold, lists).",
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: currentPaper?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none",
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        updateContent(html, text, words);
      }
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
        const html = result.value;

        editor?.commands.setContent(html);

        const text = editor?.getText() || "";
        const words = countWords(text);

        setPaper({
          id: crypto.randomUUID(),
          moduleCode: "",
          title: file.name.replace(".docx", ""),
          content: html,
          plainText: text,
          wordCount: words,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to parse .docx file:", err);
      }

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [editor, setPaper],
  );

  const wordCount = currentPaper?.wordCount || 0;
  const charCount = currentPaper?.plainText.length || 0;

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2">
        <WordCounter wordCount={wordCount} charCount={charCount} />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleDocxUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Upload .docx
          </Button>
        </div>
      </div>
    </div>
  );
}
