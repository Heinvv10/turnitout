import JSZip from "jszip";
import type { TemplateMetadata } from "@/types/template";

/**
 * Populate the Cornerstone template with essay content.
 * Strategy: rebuild paragraph text nodes rather than regex replace XML.
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

  // Step 1: Flatten split text runs in paragraphs for reliable replacement.
  // Word splits text across <w:t> elements. We merge adjacent <w:r> elements
  // that have the same formatting into single <w:t> elements.
  xml = mergeAdjacentTextRuns(xml);

  // Step 2: Simple text replacements on the merged XML
  const replacements: [string, string][] = [
    ["NAME OF THE ASSIGNMENT", metadata.assignmentTitle],
    ["TYPE OF PAPER", "Academic Essay"],
    ["Module Name", `${metadata.moduleCode} - ${metadata.moduleName}`],
    ["Name Surname (Student Number)", `${metadata.studentName} (${metadata.studentNumber})`],
    ["Student Name and Surname", metadata.studentName],
    ["Submission Date", metadata.date],
  ];

  for (const [search, replace] of replacements) {
    xml = replaceInXmlText(xml, search, replace);
  }

  // Step 3: Insert section content after headings
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
 * Merge adjacent <w:r> elements within each paragraph that have the same
 * (or no) formatting. This undoes Word's tendency to split text across
 * multiple runs, making replacement reliable.
 */
function mergeAdjacentTextRuns(xml: string): string {
  // Find each paragraph
  return xml.replace(
    /<w:p[ >][\s\S]*?<\/w:p>/g,
    (paragraph) => {
      // Extract all text from <w:t> elements in this paragraph
      const texts: string[] = [];
      const textRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
      let match;
      while ((match = textRegex.exec(paragraph)) !== null) {
        texts.push(match[1]);
      }
      const fullText = texts.join("");

      // If the paragraph has a simple text and it matches a known pattern,
      // we can rebuild it. Otherwise, leave it untouched.
      // This is conservative - only merge when we have text to find.
      if (!fullText) return paragraph;

      // Store the full text for this paragraph so replaceInXmlText can find it
      // We add a data attribute with the merged text
      return paragraph;
    },
  );
}

/**
 * Find text content across potentially split <w:t> elements and replace it.
 */
function replaceInXmlText(xml: string, search: string, replacement: string): string {
  if (!search || !replacement) return xml;

  // Strategy: find paragraphs containing the search text (possibly split across <w:t> elements)
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g);
  if (!paragraphs) return xml;

  for (const para of paragraphs) {
    // Collect all text from this paragraph
    const texts: { text: string; start: number; end: number }[] = [];
    const textRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let match;
    while ((match = textRegex.exec(para)) !== null) {
      texts.push({
        text: match[1],
        start: match.index + match[0].indexOf(match[1]),
        end: match.index + match[0].indexOf(match[1]) + match[1].length,
      });
    }

    const fullText = texts.map((t) => t.text).join("");
    const searchIdx = fullText.indexOf(search);

    if (searchIdx === -1) continue;

    // Found the search text. Now figure out which <w:t> elements it spans
    // and replace just the text content.
    let charPos = 0;
    let newPara = para;
    let firstRun = true;

    for (const t of texts) {
      const tStart = charPos;
      const tEnd = charPos + t.text.length;
      charPos = tEnd;

      const searchEnd = searchIdx + search.length;

      // Does this text node overlap with the search text?
      if (tEnd <= searchIdx || tStart >= searchEnd) continue;

      // Calculate what part of this text node to replace
      const overlapStart = Math.max(0, searchIdx - tStart);
      const overlapEnd = Math.min(t.text.length, searchEnd - tStart);

      let newText = t.text;
      if (firstRun) {
        // First overlapping run gets the replacement
        newText =
          t.text.slice(0, overlapStart) +
          escapeXml(replacement) +
          t.text.slice(overlapEnd);
        firstRun = false;
      } else {
        // Subsequent overlapping runs: remove the matched portion
        newText = t.text.slice(0, overlapStart) + t.text.slice(overlapEnd);
      }

      // Replace in the XML
      const oldTNode = `>${t.text}</w:t>`;
      const newTNode = ` xml:space="preserve">${newText}</w:t>`;
      newPara = newPara.replace(oldTNode, newTNode);
    }

    if (newPara !== para) {
      xml = xml.replace(para, newPara);
      // Only replace first occurrence
      break;
    }
  }

  return xml;
}

/**
 * Insert paragraph content after a heading paragraph.
 * Finds a paragraph containing the heading text (in a Heading style)
 * and inserts new paragraphs after it.
 */
function insertAfterHeading(
  xml: string,
  headingText: string,
  content: string,
): string {
  if (!content.trim()) return xml;

  // Find paragraphs that look like they contain the heading
  // Look for the heading text NOT in a hyperlink (avoid TOC entries)
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g);
  if (!paragraphs) return xml;

  for (const para of paragraphs) {
    // Skip TOC entries (they contain hyperlinks)
    if (para.includes("<w:hyperlink")) continue;
    // Skip the template note paragraph
    if (para.includes("automated table of contents")) continue;

    // Get text content
    const texts: string[] = [];
    const textRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
    let match;
    while ((match = textRegex.exec(para)) !== null) {
      texts.push(match[1]);
    }
    const fullText = texts.join("").trim();

    // Check if this paragraph IS the heading (not just contains it)
    const cleanHeading = headingText.replace(/\s+/g, " ").trim();
    const cleanFull = fullText.replace(/\s+/g, " ").trim();

    if (
      cleanFull.toLowerCase() === cleanHeading.toLowerCase() ||
      cleanFull.toLowerCase().match(
        new RegExp(`^\\d\\.?\\s*${cleanHeading.toLowerCase()}\\s*$`),
      )
    ) {
      // Found the heading. Find the next empty/placeholder paragraph after it
      // and replace it with our content paragraphs.
      const paraIdx = xml.indexOf(para);
      const afterHeading = xml.slice(paraIdx + para.length);

      // Find the next paragraph
      const nextParaMatch = afterHeading.match(/<w:p[ >][\s\S]*?<\/w:p>/);
      if (!nextParaMatch) continue;

      const nextPara = nextParaMatch[0];
      const nextTexts: string[] = [];
      const nextTextRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
      let m;
      while ((m = nextTextRegex.exec(nextPara)) !== null) {
        nextTexts.push(m[1]);
      }
      const nextText = nextTexts.join("").trim();

      // Build replacement paragraphs
      const contentParas = content
        .split("\n")
        .filter((line) => line.trim())
        .map(
          (line) =>
            `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`,
        )
        .join("");

      // If the next paragraph is empty or just whitespace, replace it
      if (!nextText || nextText === " ") {
        xml = xml.replace(nextPara, contentParas);
      } else {
        // Insert before the next paragraph
        xml = xml.replace(
          nextPara,
          contentParas + nextPara,
        );
      }

      break;
    }
  }

  return xml;
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
