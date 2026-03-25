import JSZip from "jszip";
import type { TemplateMetadata } from "@/types/template";

/**
 * Populate the Cornerstone template with essay content.
 * Uses simple, reliable XML text replacement.
 */
export async function populateTemplate(
  templateBase64: string,
  metadata: TemplateMetadata,
  sections: {
    introduction: string;
    body: string;
    conclusion: string;
    references: string;
  },
): Promise<Blob> {
  const zip = await JSZip.loadAsync(templateBase64, { base64: true });
  let xml = await zip.file("word/document.xml")!.async("string");

  // Step 1: Direct text replacements (these exist as single <w:t> elements)
  xml = safeReplace(xml, "NAME OF THE ASSIGNMENT", metadata.assignmentTitle);
  xml = safeReplace(xml, "TYPE OF PAPER", "Academic Essay");
  xml = safeReplace(xml, "Module Name", `${metadata.moduleCode} - ${metadata.moduleName}`);
  xml = safeReplace(xml, "Name Surname (Student Number)", `${metadata.studentName} (${metadata.studentNumber})`);
  xml = safeReplace(xml, "Student Name and Surname", metadata.studentName);
  xml = safeReplace(xml, "Submission Date", metadata.date);

  // Step 2: Insert content after section headings
  xml = insertAfterHeading(xml, "INTRODUCTION", sections.introduction);
  xml = insertAfterHeading(xml, "BODY", sections.body);
  xml = insertAfterHeading(xml, "CONCLUSION", sections.conclusion);
  xml = insertAfterHeading(xml, "REFERENCE LIST", sections.references);

  zip.file("word/document.xml", xml);

  return await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Safe text replacement within <w:t> elements.
 * Finds >SEARCH< pattern and replaces with >REPLACEMENT<
 */
function safeReplace(xml: string, search: string, replacement: string): string {
  if (!search || !replacement) return xml;
  const esc = escapeXml(replacement);
  const searchEsc = escapeRegex(search);
  // Match the text inside <w:t> tags: >search text<
  const regex = new RegExp(`(>)${searchEsc}(<)`, "g");
  return xml.replace(regex, `$1${esc}$2`);
}

/**
 * Insert paragraphs after a heading.
 * Finds paragraphs containing the heading text (not in TOC hyperlinks)
 * and inserts new content paragraphs after them.
 */
function insertAfterHeading(xml: string, heading: string, content: string): string {
  if (!content.trim()) return xml;

  // Split XML into paragraphs
  const parts: string[] = [];
  let lastIdx = 0;
  const paraRegex = /<w:p[ >][\s\S]*?<\/w:p>/g;
  let match;
  let insertIdx = -1;

  while ((match = paraRegex.exec(xml)) !== null) {
    const para = match[0];
    const paraStart = match.index;

    // Skip TOC paragraphs (contain hyperlinks)
    if (para.includes("<w:hyperlink")) continue;
    // Skip template note
    if (para.includes("automated table of contents")) continue;

    // Get text content of this paragraph
    const textParts: string[] = [];
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let tm;
    while ((tm = tRegex.exec(para)) !== null) {
      textParts.push(tm[1]);
    }
    const fullText = textParts.join("").replace(/\s+/g, " ").trim();

    // Check if this is the heading we're looking for
    const headingLower = heading.toLowerCase();
    const textLower = fullText.toLowerCase();

    if (
      textLower === headingLower ||
      textLower.match(new RegExp(`^\\d\\.?\\s*${escapeRegex(headingLower)}$`))
    ) {
      insertIdx = paraStart + para.length;
      break;
    }
  }

  if (insertIdx === -1) return xml;

  // Build content paragraphs with proper Word XML formatting
  const contentXml = content
    .split("\n")
    .filter((line) => line.trim())
    .map(
      (line) =>
        `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`,
    )
    .join("");

  // Insert after the heading paragraph
  return xml.slice(0, insertIdx) + contentXml + xml.slice(insertIdx);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Read a .docx file and return base64 string for storage.
 */
export async function docxToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
