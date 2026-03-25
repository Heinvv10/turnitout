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
  content: string; // HTML from Tiptap
  plainText: string; // Stripped text for analysis
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}
