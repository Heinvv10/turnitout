export interface TemplateMetadata {
  studentName: string;
  studentNumber: string;
  moduleCode: string;
  moduleName: string;
  lecturer: string;
  assignmentTitle: string;
  date: string;
  wordCount: number;
}

export interface StoredTemplate {
  fileName: string;
  base64: string; // Base64-encoded .docx
  uploadedAt: string;
}
