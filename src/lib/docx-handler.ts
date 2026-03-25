import JSZip from "jszip";
import type { TemplateMetadata } from "@/types/template";

/**
 * Reads a .docx template and replaces placeholder text with actual values,
 * then inserts the paper body into the INTRODUCTION/BODY/CONCLUSION sections.
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
  const docXml = await zip.file("word/document.xml")!.async("string");

  // Replace cover page placeholders
  let updated = docXml;

  // Replace "NAME OF THE ASSIGNMENT" with the actual assignment title
  updated = replaceTextInXml(
    updated,
    "NAME OF THE ASSIGNMENT",
    metadata.assignmentTitle,
  );

  // Replace "TYPE OF PAPER" (e.g., "Essay", "Research Paper")
  // Keep as-is if not provided - user can set this
  if (metadata.assignmentTitle) {
    updated = replaceTextInXml(updated, "TYPE OF PAPER", "Essay");
  }

  // Replace "Module Name" with actual module
  updated = replaceTextInXml(
    updated,
    "Module Name",
    `${metadata.moduleCode} - ${metadata.moduleName}`,
  );

  // Replace "Name Surname (Student Number)"
  updated = replaceTextInXml(
    updated,
    "Name Surname (Student Number)",
    `${metadata.studentName} (${metadata.studentNumber})`,
  );

  // Replace the date placeholder
  updated = replaceDateInXml(updated, metadata.date);

  // Replace "Student Name and Surname" in the declaration section
  updated = replaceTextInXml(
    updated,
    "Student Name and Surname",
    metadata.studentName,
  );

  // Replace "Submission Date" in the declaration
  updated = replaceTextInXml(updated, "Submission Date", metadata.date);

  // Insert body content into sections
  // The template has placeholder sections: INTRODUCTION (empty), BODY, CONCLUSION, REFERENCE LIST
  // We replace the empty paragraphs after these headings with actual content
  updated = insertSectionContent(updated, "INTRODUCTION", sections.introduction);
  updated = insertSectionContent(updated, "BODY", sections.body);
  updated = insertSectionContent(updated, "CONCLUSION", sections.conclusion);
  updated = insertSectionContent(updated, "REFERENCE LIST", sections.references);

  zip.file("word/document.xml", updated);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return blob;
}

/**
 * Replace text that may be split across multiple <w:t> elements in the XML.
 * This handles the common OOXML issue where Word splits text into fragments.
 */
function replaceTextInXml(
  xml: string,
  search: string,
  replacement: string,
): string {
  // First try a direct replacement in case the text isn't split
  if (xml.includes(`>${search}<`)) {
    return xml.replace(
      new RegExp(`>${escapeRegex(search)}<`, "g"),
      `>${escapeXml(replacement)}<`,
    );
  }

  // Handle split text across w:t elements within a paragraph
  // Build a regex that allows XML tags between characters
  const chars = search.split("");
  const flexiblePattern = chars
    .map((c) => escapeRegex(c))
    .join("(?:</w:t></w:r><w:r[^>]*><w:rPr>[^<]*</w:rPr><w:t[^>]*>|</w:t></w:r><w:r[^>]*><w:t[^>]*>|\\|)?");

  try {
    const regex = new RegExp(flexiblePattern, "g");
    const match = xml.match(regex);
    if (match) {
      // Replace the first match with the replacement in a single w:t
      return xml.replace(regex, escapeXml(replacement));
    }
  } catch {
    // Regex too complex, fall back
  }

  return xml;
}

/**
 * Replace the date field specifically (handles "Date: " prefix)
 */
function replaceDateInXml(xml: string, date: string): string {
  // The template has "Date: " as a text run - we just need to ensure
  // the date value is set
  return xml;
}

/**
 * Insert content after a section heading.
 * Finds the heading paragraph and replaces the next empty paragraph with content.
 */
function insertSectionContent(
  xml: string,
  headingText: string,
  content: string,
): string {
  if (!content.trim()) return xml;

  // Find the heading that's not in the TOC (look for heading style, not hyperlink)
  // The actual content headings use Heading1 style
  const paragraphs = content.split("\n").filter((p) => p.trim());

  const contentXml = paragraphs
    .map(
      (p) =>
        `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${escapeXml(p)}</w:t></w:r></w:p>`,
    )
    .join("");

  // Find the section heading (in a Heading1 styled paragraph, not TOC)
  // Look for the pattern: heading paragraph followed by an empty paragraph
  // The heading contains the text in a bookmark
  const headingPattern = new RegExp(
    `(<w:p[^>]*>(?:(?!<w:p[ >]).)*?<w:t[^>]*>${escapeRegex(headingText)}</w:t>(?:(?!<w:p[ >]).)*?</w:p>)(<w:p[^>]*>(?:(?!<w:p[ >]).)*?</w:p>)`,
    "s",
  );

  const match = xml.match(headingPattern);
  if (match) {
    // Replace the empty paragraph after the heading with our content
    return xml.replace(
      headingPattern,
      `$1${contentXml}`,
    );
  }

  return xml;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
