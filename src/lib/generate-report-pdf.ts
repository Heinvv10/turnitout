import jsPDF from "jspdf";
import type { SubmissionReadiness } from "@/types/analysis";

interface ReportData {
  studentName: string;
  studentNumber: string;
  moduleName: string;
  moduleCode: string;
  assessmentName: string;
  essayTitle: string;
  wordCount: number;
  date: string;
  results: SubmissionReadiness;
}

type RGB = [number, number, number];

// Palette
const VIOLET: RGB = [88, 28, 135];
const VIOLET_LIGHT: RGB = [245, 243, 255];
const GREEN: RGB = [22, 163, 74];
const GREEN_LIGHT: RGB = [240, 253, 244];
const YELLOW: RGB = [161, 98, 7];
const YELLOW_LIGHT: RGB = [254, 252, 232];
const RED: RGB = [185, 28, 28];
const RED_LIGHT: RGB = [254, 242, 242];
const BLUE: RGB = [37, 99, 235];
const BLUE_LIGHT: RGB = [239, 246, 255];
const GRAY: RGB = [107, 114, 128];
const GRAY_BG: RGB = [249, 250, 251];
const BORDER: RGB = [229, 231, 235];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [24, 24, 27];

function tc(light: string | null | undefined): { color: RGB; bg: RGB } {
  if (light === "green") return { color: GREEN, bg: GREEN_LIGHT };
  if (light === "yellow") return { color: YELLOW, bg: YELLOW_LIGHT };
  if (light === "red") return { color: RED, bg: RED_LIGHT };
  return { color: GRAY, bg: GRAY_BG };
}

/** Ensure we don't overflow the page; adds new page if needed */
function ensureSpace(doc: jsPDF, y: number, needed: number, margin: number): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return margin;
  }
  return y;
}

export function generateReportPDF(data: ReportData): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pw = doc.internal.pageSize.getWidth(); // 210
  const m = 18; // margin
  const cw = pw - m * 2; // content width
  let y = 0;

  // ━━━ PAGE 1: HEADER BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.setFillColor(...VIOLET);
  doc.rect(0, 0, pw, 38, "F");

  // Subtle accent line
  doc.setFillColor(167, 139, 250); // violet-400
  doc.rect(0, 38, pw, 1.5, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TurnItOut", m, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Pre-Submission Check Report", m, 24);
  doc.setFontSize(8);
  doc.text(data.date, m, 32);

  // Right side
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.moduleCode, pw - m, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(data.moduleName, pw - m, 23, { align: "right" });
  doc.text(`${data.wordCount} words`, pw - m, 30, { align: "right" });

  y = 47;

  // ━━━ STUDENT INFO ROW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  doc.setFillColor(...GRAY_BG);
  doc.roundedRect(m, y, cw, 18, 3, 3, "F");
  doc.setDrawColor(...BORDER);
  doc.roundedRect(m, y, cw, 18, 3, 3, "S");

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");

  const infoY = y + 7;
  doc.text("Student", m + 5, infoY);
  doc.text("Student No.", m + 5, infoY + 7);

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.text(data.studentName || "—", m + 30, infoY);
  doc.text(data.studentNumber || "—", m + 30, infoY + 7);

  const col2x = m + cw / 2 + 5;
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("Essay Title", col2x, infoY);
  doc.text("Assessment", col2x, infoY + 7);

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  const titleTrunc = (data.essayTitle || "Untitled").slice(0, 40);
  doc.text(titleTrunc, col2x + 25, infoY);
  const assessTrunc = (data.assessmentName || "—").slice(0, 40);
  doc.text(assessTrunc, col2x + 25, infoY + 7);

  y += 26;

  // ━━━ READINESS BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const overall = data.results.overall ?? 0;
  const overallLight = data.results.trafficLight;
  const { color: oColor, bg: oBg } = tc(overallLight);
  const statusLabel =
    overallLight === "green"
      ? "Ready to Submit"
      : overallLight === "yellow"
        ? "Needs Review"
        : "Not Ready";

  doc.setFillColor(...oBg);
  doc.roundedRect(m, y, cw, 22, 4, 4, "F");
  doc.setDrawColor(...oColor);
  doc.setLineWidth(0.6);
  doc.roundedRect(m, y, cw, 22, 4, 4, "S");
  doc.setLineWidth(0.2);

  // Large score
  doc.setTextColor(...oColor);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${overall}%`, m + 8, y + 15);

  // Label
  doc.setFontSize(12);
  doc.text(statusLabel, m + 30, y + 10);

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Submission Readiness Score", m + 30, y + 17);

  y += 30;

  // ━━━ SCORE CARDS (2-column grid) ━━━━━━━━━━━━━━━━━━━━━
  doc.setTextColor(...VIOLET);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Check Results", m, y);

  // Thin line
  doc.setDrawColor(...VIOLET);
  doc.setLineWidth(0.4);
  doc.line(m, y + 2, m + 36, y + 2);
  doc.setLineWidth(0.2);
  y += 8;

  interface ScoreCard {
    label: string;
    score: number | null;
    light: string | null | undefined;
    hint: string;
    goodDir: "high" | "low";
  }

  const cards: ScoreCard[] = [
    {
      label: "Grammar",
      score: data.results.grammar?.score ?? null,
      light: data.results.grammar?.trafficLight,
      hint: "Fewer spelling and grammar errors",
      goodDir: "high",
    },
    {
      label: "Tone & Formality",
      score: data.results.tone?.formalityScore ?? null,
      light: data.results.tone?.trafficLight,
      hint: "Academic writing style",
      goodDir: "high",
    },
    {
      label: "Citations",
      score: data.results.citations?.score ?? null,
      light: data.results.citations?.trafficLight,
      hint: "Properly formatted references",
      goodDir: "high",
    },
    {
      label: "Originality",
      score: data.results.plagiarism
        ? 100 - data.results.plagiarism.overallSimilarity
        : null,
      light: data.results.plagiarism?.trafficLight,
      hint: "Your own original work",
      goodDir: "high",
    },
    {
      label: "AI Risk",
      score: data.results.aiRisk
        ? 100 - data.results.aiRisk.overallScore
        : null,
      light: data.results.aiRisk?.trafficLight,
      hint: "Human-written confidence",
      goodDir: "high",
    },
    {
      label: "Estimated Grade",
      score: data.results.grading?.totalScore ?? null,
      light: data.results.grading?.trafficLight,
      hint: data.results.grading?.saGrade
        ? `SA: ${data.results.grading.saGrade}`
        : "Estimated mark",
      goodDir: "high",
    },
  ];

  const cardW = (cw - 6) / 2; // 2 columns with 6mm gap
  const cardH = 24;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = m + col * (cardW + 6);
    const cy = y + row * (cardH + 4);

    y = ensureSpace(doc, cy, cardH, m + 8);
    const finalCy = y === m + 8 ? y + row * (cardH + 4) : cy;

    const { color, bg } = tc(card.light);

    // Card background
    doc.setFillColor(...bg);
    doc.roundedRect(cx, finalCy, cardW, cardH, 3, 3, "F");
    doc.setDrawColor(...BORDER);
    doc.roundedRect(cx, finalCy, cardW, cardH, 3, 3, "S");

    // Score
    doc.setTextColor(...color);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const scoreText = card.score !== null ? `${card.score}%` : "—";
    doc.text(scoreText, cx + 6, finalCy + 11);

    // Label
    doc.setTextColor(...BLACK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(card.label, cx + 28, finalCy + 8);

    // Hint
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.hint, cx + 28, finalCy + 14);

    // Direction arrow
    doc.setFontSize(7);
    doc.setTextColor(...color);
    doc.text(
      card.goodDir === "high" ? "Higher is better" : "Lower is better",
      cx + 28,
      finalCy + 20,
    );

    // Mini progress bar
    const barX = cx + 6;
    const barY = finalCy + 17;
    const barW = 18;
    doc.setFillColor(...BORDER);
    doc.roundedRect(barX, barY, barW, 2.5, 1, 1, "F");
    const fillW = Math.max(0, Math.min(barW, ((card.score ?? 0) / 100) * barW));
    if (fillW > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(barX, barY, fillW, 2.5, 1, 1, "F");
    }
  }

  // Move y past the grid
  const gridRows = Math.ceil(cards.length / 2);
  y += gridRows * (cardH + 4) + 4;

  // ━━━ ADVICE SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const advice = data.results.advice;
  if (advice) {
    y = ensureSpace(doc, y, 40, 20);

    doc.setTextColor(...VIOLET);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Improvement Advice", m, y);
    doc.setDrawColor(...VIOLET);
    doc.setLineWidth(0.4);
    doc.line(m, y + 2, m + 46, y + 2);
    doc.setLineWidth(0.2);
    y += 8;

    // Overall message
    if (advice.overallMessage) {
      y = ensureSpace(doc, y, 16, 20);
      doc.setFillColor(...VIOLET_LIGHT);
      doc.roundedRect(m, y - 2, cw, 14, 3, 3, "F");
      doc.setTextColor(...VIOLET);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const msgLines = doc.splitTextToSize(advice.overallMessage, cw - 12);
      doc.text(msgLines.slice(0, 3), m + 6, y + 4);
      y += Math.min(msgLines.length, 3) * 4 + 8;
    }

    // Helper to draw advice cards
    const drawAdviceSection = (
      title: string,
      items: { area: string; detail: string; action: string }[],
      sectionColor: RGB,
      sectionBg: RGB,
      actionLabel: string,
    ) => {
      if (!items || items.length === 0) return;

      y = ensureSpace(doc, y, 14, 20);

      // Section header
      doc.setFillColor(...sectionColor);
      doc.roundedRect(m, y, cw, 8, 2, 2, "F");
      doc.setTextColor(...WHITE);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${title} (${items.length})`, m + 5, y + 5.5);
      y += 12;

      for (const item of items) {
        y = ensureSpace(doc, y, 22, 20);

        // Card
        doc.setFillColor(...sectionBg);
        doc.roundedRect(m + 2, y - 1, cw - 4, 20, 2, 2, "F");

        // Left accent bar
        doc.setFillColor(...sectionColor);
        doc.rect(m + 2, y - 1, 2, 20, "F");

        // Area name
        doc.setTextColor(...sectionColor);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(item.area, m + 8, y + 4);

        // Detail
        doc.setTextColor(...BLACK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const detailLines = doc.splitTextToSize(item.detail, cw - 18);
        doc.text(detailLines.slice(0, 2), m + 8, y + 9);

        // Action
        doc.setTextColor(...GRAY);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(`${actionLabel}: `, m + 8, y + 17);
        doc.setFont("helvetica", "normal");
        const actionLines = doc.splitTextToSize(item.action, cw - 30);
        doc.text(
          actionLines[0] || "",
          m + 8 + doc.getTextWidth(`${actionLabel}: `),
          y + 17,
        );

        y += 23;
      }
    };

    drawAdviceSection(
      "Fix Before Submitting",
      advice.critical || [],
      RED,
      RED_LIGHT,
      "Action",
    );
    drawAdviceSection(
      "Recommended Improvements",
      advice.recommended || [],
      YELLOW,
      YELLOW_LIGHT,
      "Tip",
    );
    drawAdviceSection(
      "Final Polish",
      advice.polish || [],
      BLUE,
      BLUE_LIGHT,
      "Tip",
    );
  }

  // ━━━ GRAMMAR ISSUES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const grammar = data.results.grammar;
  if (grammar && grammar.issues && grammar.issues.length > 0) {
    y = ensureSpace(doc, y, 30, 20);

    y += 2;
    doc.setTextColor(...VIOLET);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grammar Issues (${grammar.issues.length})`, m, y);
    doc.setDrawColor(...VIOLET);
    doc.setLineWidth(0.4);
    doc.line(m, y + 2, m + 42, y + 2);
    doc.setLineWidth(0.2);
    y += 8;

    for (const issue of grammar.issues.slice(0, 12)) {
      y = ensureSpace(doc, y, 14, 20);

      const sevColor: RGB =
        issue.severity === "error"
          ? RED
          : issue.severity === "warning"
            ? YELLOW
            : GRAY;

      // Row background
      doc.setFillColor(...GRAY_BG);
      doc.roundedRect(m, y - 2, cw, 12, 2, 2, "F");

      // Severity dot
      doc.setFillColor(...sevColor);
      doc.circle(m + 5, y + 2, 1.5, "F");

      // Original → Correction
      doc.setTextColor(...RED);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const origText = `"${(issue.text || "").slice(0, 30)}"`;
      doc.text(origText, m + 10, y + 2);

      doc.setTextColor(...GREEN);
      doc.setFont("helvetica", "bold");
      const corrText = `→ "${(issue.correction || "").slice(0, 30)}"`;
      doc.text(corrText, m + 10 + doc.getTextWidth(origText) + 3, y + 2);

      // Explanation
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text((issue.explanation || "").slice(0, 90), m + 10, y + 7);

      y += 14;
    }

    if (grammar.issues.length > 12) {
      doc.setTextColor(...GRAY);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.text(
        `+ ${grammar.issues.length - 12} more issues — see full details in TurnItOut`,
        m + 10,
        y,
      );
      y += 6;
    }
  }

  // ━━━ FOOTER ON ALL PAGES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();

    // Footer line
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(m, ph - 14, pw - m, ph - 14);

    // Left: branding
    doc.setTextColor(...VIOLET);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("TurnItOut", m, ph - 9);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(" — Pre-Submission Checker  |  turnitout.co.za", m + 18, ph - 9);

    // Right: page number
    doc.text(`${i} / ${totalPages}`, pw - m, ph - 9, { align: "right" });

    // Disclaimer
    doc.setFontSize(6);
    doc.text(
      "This report is for self-assessment only. Results are AI-generated estimates and do not guarantee grades.",
      m,
      ph - 5,
    );
  }

  // Save
  const safeName = data.moduleCode.replace(/[^a-zA-Z0-9]/g, "");
  const safeDate = data.date.replace(/\//g, "-");
  doc.save(`TurnItOut_${safeName}_${safeDate}.pdf`);
}
