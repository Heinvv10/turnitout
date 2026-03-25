export interface Module {
  code: string;
  name: string;
  semester: 1 | 2;
  credits: number;
}

export interface Paper {
  id: string;
  moduleCode: string;
  title: string;
  content: string; // HTML from Tiptap (essay body)
  plainText: string; // Stripped text for analysis (essay body)
  wordCount: number; // Body word count only (excludes references)
  references: string; // Reference list plain text
  referencesHtml: string; // Reference list HTML
  referenceCount: number; // Number of references
  createdAt: string;
  updatedAt: string;
}
