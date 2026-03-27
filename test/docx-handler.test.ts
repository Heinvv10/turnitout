import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { populateTemplate } from "@/lib/docx-handler";

/**
 * Creates a minimal .docx-like zip (base64) with the given XML as word/document.xml.
 */
async function makeTemplateBase64(xml: string): Promise<string> {
  const zip = new JSZip();
  zip.file("word/document.xml", xml);
  const buf = await zip.generateAsync({ type: "uint8array" });
  // Convert Uint8Array to base64
  let binary = "";
  for (let i = 0; i < buf.byteLength; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}

/**
 * Reads back the word/document.xml from the populated blob.
 */
async function readDocXml(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  return await zip.file("word/document.xml")!.async("string");
}

describe("populateTemplate", () => {
  const metadata = {
    studentName: "Jane Doe",
    studentNumber: "ST12345",
    moduleCode: "CALS5150",
    moduleName: "Counselling and Life Skills",
    lecturer: "Dr Smith",
    assignmentTitle: "My Essay",
    date: "2026-03-27",
    wordCount: 1200,
  };

  it("replaces assignment title placeholder in <w:t> elements", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>NAME OF THE ASSIGNMENT</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain(">My Essay<");
    expect(result).not.toContain(">NAME OF THE ASSIGNMENT<");
  });

  it("replaces student name and number placeholder", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>Name Surname (Student Number)</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain(">Jane Doe (ST12345)<");
  });

  it("replaces module name placeholder with code and name", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>Module Name</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain(">CALS5150 - Counselling and Life Skills<");
  });

  it("replaces submission date placeholder", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>Submission Date</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain(">2026-03-27<");
  });

  it("inserts introduction content after the INTRODUCTION heading", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>INTRODUCTION</w:t></w:r></w:p><w:p><w:r><w:t>Other</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "This is the intro paragraph.",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain("This is the intro paragraph.");
    // The intro text should appear after the INTRODUCTION heading paragraph
    const introHeadingIdx = result.indexOf(">INTRODUCTION<");
    const introContentIdx = result.indexOf("This is the intro paragraph.");
    expect(introContentIdx).toBeGreaterThan(introHeadingIdx);
  });

  it("escapes XML special characters in metadata", async () => {
    const specialMetadata = {
      ...metadata,
      assignmentTitle: "Tom & Jerry's <Essay>",
    };
    const xml = `<w:document><w:body><w:p><w:r><w:t>NAME OF THE ASSIGNMENT</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, specialMetadata, {
      introduction: "",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain("Tom &amp; Jerry&apos;s &lt;Essay&gt;");
    expect(result).not.toContain(">NAME OF THE ASSIGNMENT<");
  });

  it("skips section insertion when content is empty", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>INTRODUCTION</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "",
      body: "",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    // Should remain unchanged (no extra paragraphs inserted)
    expect(result).toBe(xml);
  });

  it("inserts multi-line content as separate paragraphs", async () => {
    const xml = `<w:document><w:body><w:p><w:r><w:t>BODY</w:t></w:r></w:p></w:body></w:document>`;
    const base64 = await makeTemplateBase64(xml);

    const blob = await populateTemplate(base64, metadata, {
      introduction: "",
      body: "Line one.\nLine two.\nLine three.",
      conclusion: "",
      references: "",
    });

    const result = await readDocXml(blob);
    expect(result).toContain("Line one.");
    expect(result).toContain("Line two.");
    expect(result).toContain("Line three.");
    // Each line becomes a <w:p> paragraph
    const paragraphCount = (result.match(/<w:p>/g) || []).length;
    // Original heading paragraph + 3 content paragraphs = 4
    expect(paragraphCount).toBe(4);
  });
});
