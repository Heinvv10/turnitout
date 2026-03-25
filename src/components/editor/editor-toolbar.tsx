"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
      label: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
      label: "Italic",
    },
  ];

  const headings = [
    {
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
      label: "Heading 1",
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
      label: "Heading 2",
    },
    {
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
      label: "Heading 3",
    },
  ];

  const lists = [
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
      label: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
      label: "Ordered List",
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
      label: "Blockquote",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
      {tools.map((tool) => (
        <Button
          key={tool.label}
          variant={tool.active ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={tool.action}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      {headings.map((tool) => (
        <Button
          key={tool.label}
          variant={tool.active ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={tool.action}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      {lists.map((tool) => (
        <Button
          key={tool.label}
          variant={tool.active ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={tool.action}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
