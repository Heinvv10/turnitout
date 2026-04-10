import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

const VLM_API_URL = process.env.VLM_API_URL;
if (!VLM_API_URL) throw new Error("VLM_API_URL environment variable is required");
const VLM_URL = `${VLM_API_URL}/v1/chat/completions`;
const VLM_MODEL = process.env.VLM_MODEL;
if (!VLM_MODEL) throw new Error("VLM_MODEL environment variable is required");

/**
 * Extract text from PDF using VLM (configured via VLM_MODEL env var).
 * Converts each page to an image and sends to the VLM for OCR + understanding.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save PDF to temp file
    const tmpPdf = join("/tmp", `turnitout-${Date.now()}.pdf`);
    const tmpPrefix = join("/tmp", `turnitout-page-${Date.now()}`);
    writeFileSync(tmpPdf, buffer);

    // Convert PDF pages to JPEG images using pdftoppm
    execSync(`pdftoppm -jpeg -r 150 "${tmpPdf}" "${tmpPrefix}"`, {
      timeout: 30000,
    });

    // Find all generated page images
    const pages: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const padded = String(i).padStart(2, "0");
      const pagePath = `${tmpPrefix}-${padded}.jpg`;
      if (existsSync(pagePath)) {
        pages.push(pagePath);
      } else {
        break;
      }
    }

    if (pages.length === 0) {
      // Try single page format (no padding)
      const singlePage = `${tmpPrefix}-1.jpg`;
      if (existsSync(singlePage)) {
        pages.push(singlePage);
      }
    }

    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Failed to convert PDF to images" },
        { status: 500 },
      );
    }

    // Send each page to VLM for text extraction
    const allText: string[] = [];

    for (const pagePath of pages) {
      const imageBuffer = readFileSync(pagePath);
      const base64 = imageBuffer.toString("base64");

      const payload = {
        model: VLM_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
              {
                type: "text",
                text: "Extract ALL text from this document page. Preserve the structure including headings, tables, and lists. Return the raw text content only, no commentary.",
              },
            ],
          },
        ],
        max_tokens: 4096,
      };

      const vlmRes = await fetch(VLM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (vlmRes.ok) {
        const data = await vlmRes.json();
        const text = data.choices?.[0]?.message?.content || "";
        if (text) allText.push(text);
      }
    }

    // Cleanup temp files
    try {
      unlinkSync(tmpPdf);
      for (const p of pages) unlinkSync(p);
    } catch {
      // ignore cleanup errors
    }

    const fullText = allText.join("\n\n---PAGE BREAK---\n\n");

    return NextResponse.json({
      text: fullText,
      pages: pages.length,
      method: "vlm",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "PDF extraction failed";
    console.error("PDF extraction error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
