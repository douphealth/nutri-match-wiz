import { jsPDF } from "jspdf";
import type { EngineResult } from "@/types/supplements";
import { productFor, amazonLink } from "./supplement-products";

// Brand palette (sRGB approximations of app's oklch tokens)
const COL = {
  bg: [10, 12, 20] as const,
  surface: [18, 22, 34] as const,
  card: [24, 28, 42] as const,
  border: [60, 66, 90] as const,
  text: [240, 242, 248] as const,
  muted: [160, 165, 185] as const,
  primary: [110, 200, 170] as const, // mint-teal
  primaryDeep: [60, 150, 130] as const,
  accent: [255, 200, 120] as const,
  danger: [235, 110, 110] as const,
  warn: [240, 180, 90] as const,
};

const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const MARGIN = 40;

type RGB = readonly [number, number, number];
const setFill = (doc: jsPDF, c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
const setStroke = (doc: jsPDF, c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
const setText = (doc: jsPDF, c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

function paintBackground(doc: jsPDF) {
  setFill(doc, COL.bg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  // subtle top glow band
  setFill(doc, COL.surface);
  doc.rect(0, 0, PAGE_W, 140, "F");
  setFill(doc, COL.primary);
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.circle(PAGE_W / 2, 60, 220, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
}

function footer(doc: jsPDF, page: number, total: number) {
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Nutri Match AI  ·  GearUpToFit", MARGIN, PAGE_H - 22);
  doc.text(
    `Page ${page} of ${total}  ·  Educational only — not medical advice`,
    PAGE_W - MARGIN,
    PAGE_H - 22,
    { align: "right" }
  );
}

function newPage(doc: jsPDF) {
  doc.addPage();
  paintBackground(doc);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 60) {
    newPage(doc);
    return MARGIN + 20;
  }
  return y;
}

function roundedCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: RGB = COL.card,
  border: RGB = COL.border
) {
  setFill(doc, fill);
  setStroke(doc, border);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, w, h, 10, 10, "FD");
}

function badge(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fg: RGB,
  bg: RGB
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const padX = 6;
  const w = doc.getTextWidth(text) + padX * 2;
  const h = 14;
  setFill(doc, bg);
  setStroke(doc, bg);
  doc.roundedRect(x, y, w, h, 4, 4, "F");
  setText(doc, fg);
  doc.text(text, x + padX, y + 9.5);
  return x + w + 6;
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function header(doc: jsPDF, matchScore: number) {
  // Logo mark
  setFill(doc, COL.primary);
  doc.roundedRect(MARGIN, 36, 28, 28, 8, 8, "F");
  setText(doc, COL.bg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("N", MARGIN + 10, 55);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Nutri Match AI", MARGIN + 38, 50);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Personalized Supplement Report  ·  gearuptofit.com", MARGIN + 38, 62);

  // Score chip
  const chipX = PAGE_W - MARGIN - 110;
  setFill(doc, COL.primary);
  doc.roundedRect(chipX, 36, 110, 28, 14, 14, "F");
  setText(doc, COL.bg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("MATCH SCORE", chipX + 10, 49);
  doc.setFontSize(13);
  doc.text(`${matchScore}%`, chipX + 100, 55, { align: "right" });
}

function drawHero(doc: jsPDF, result: EngineResult, dateStr: string): number {
  let y = 96;
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("YOUR SUPPLEMENT MATCH", MARGIN, y);

  y += 22;
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Your personalized", MARGIN, y);
  y += 28;
  setText(doc, COL.primary);
  doc.text("stack is ready.", MARGIN, y);

  y += 22;
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const sub = wrapText(
    doc,
    `Evidence-aware, safety-first recommendations generated on ${dateStr}. Ranking is commission-blind: products are matched to you before any affiliate link is attached.`,
    PAGE_W - MARGIN * 2
  );
  doc.text(sub, MARGIN, y);
  y += sub.length * 13 + 14;

  // Stats row
  const stats = [
    { label: "Top picks", value: String(result.recommendations.length) },
    {
      label: "Top recommendation",
      value:
        result.recommendations[0]?.supplement.name.replace(/\s*\([^)]*\)/g, "") ??
        "Food-first only",
    },
    {
      label: "Safety review",
      value: result.safetyGate.triggered ? "Clinician input" : "Standard",
    },
  ];
  const colW = (PAGE_W - MARGIN * 2 - 16) / 3;
  stats.forEach((s, i) => {
    const x = MARGIN + i * (colW + 8);
    roundedCard(doc, x, y, colW, 56);
    setText(doc, COL.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(s.label.toUpperCase(), x + 12, y + 18);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const v = wrapText(doc, s.value, colW - 24);
    doc.text(v.slice(0, 2), x + 12, y + 36);
  });
  return y + 56 + 18;
}

function drawSafetyGate(doc: jsPDF, result: EngineResult, y: number): number {
  if (!result.safetyGate.triggered) return y;
  const reasons = result.safetyGate.reasons;
  const lines = reasons.flatMap((r) => wrapText(doc, `•  ${r}`, PAGE_W - MARGIN * 2 - 24));
  const h = 36 + lines.length * 12 + 12;
  y = ensureSpace(doc, y, h);
  roundedCard(doc, MARGIN, y, PAGE_W - MARGIN * 2, h, [50, 24, 28], [180, 70, 80]);
  setText(doc, [255, 180, 180]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Talk with a clinician before starting anything new", MARGIN + 16, y + 22);
  setText(doc, COL.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(lines, MARGIN + 16, y + 40);
  return y + h + 14;
}

function confidenceColors(c: string): { fg: RGB; bg: RGB; label: string } {
  if (c === "High") return { fg: COL.bg, bg: COL.primary, label: "HIGH MATCH" };
  if (c === "Moderate")
    return { fg: COL.bg, bg: COL.warn, label: "GOOD MATCH" };
  return { fg: COL.text, bg: COL.border, label: "WORTH CONSIDERING" };
}

function drawRecommendation(
  doc: jsPDF,
  rec: EngineResult["recommendations"][number],
  rank: number,
  y: number
): number {
  const product = productFor(rec.supplement.id);
  const cleanName = rec.supplement.name.replace(/\s*\([^)]*\)/g, "");
  const innerW = PAGE_W - MARGIN * 2 - 32;

  // Pre-compute height
  const copyLines = wrapText(doc.setFont("helvetica", "normal").setFontSize(10), rec.supplement.resultCopy, innerW);
  const reasonLines = rec.reasons.slice(0, 4).flatMap((r) =>
    wrapText(doc, `•  ${r}`, innerW - 12)
  );
  const labelItems = rec.supplement.whatToLookFor.slice(0, 6);
  const safetyLines = rec.safetyFlags.flatMap((f) =>
    wrapText(doc, `•  ${f}`, innerW - 12)
  );

  const productBlockH = product ? 78 : 0;
  const safetyBlockH = safetyLines.length ? 18 + safetyLines.length * 12 + 10 : 0;
  const labelBlockH = labelItems.length ? 18 + Math.ceil(labelItems.length / 2) * 12 + 8 : 0;
  const reasonsH = reasonLines.length ? 18 + reasonLines.length * 12 + 8 : 0;

  const h =
    60 + // header
    copyLines.length * 13 + 14 +
    productBlockH + (productBlockH ? 12 : 0) +
    reasonsH +
    labelBlockH +
    safetyBlockH +
    18; // food-first line

  y = ensureSpace(doc, y, h + 12);
  const isTop = rank === 1;
  roundedCard(
    doc,
    MARGIN,
    y,
    PAGE_W - MARGIN * 2,
    h,
    COL.card,
    isTop ? COL.primary : COL.border
  );

  let cy = y + 18;
  // Rank chip
  setFill(doc, isTop ? COL.primary : COL.surface);
  doc.roundedRect(MARGIN + 16, cy - 2, 26, 26, 6, 6, "F");
  setText(doc, isTop ? COL.bg : COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(String(rank), MARGIN + 29, cy + 16, { align: "center" });

  // Title
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(cleanName, MARGIN + 52, cy + 12);

  // Conf badge (right)
  const conf = confidenceColors(rec.confidence);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const cw = doc.getTextWidth(conf.label) + 14;
  setFill(doc, conf.bg);
  doc.roundedRect(PAGE_W - MARGIN - 16 - cw, cy, cw, 14, 4, 4, "F");
  setText(doc, conf.fg);
  doc.text(conf.label, PAGE_W - MARGIN - 16 - cw / 2, cy + 9.5, { align: "center" });

  // Subline
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    `${rec.supplement.category}  ·  Evidence: ${rec.supplement.evidenceLevel}  ·  Safety: ${rec.supplement.safetyLevel}  ·  Score ${Math.round(rec.score)}`,
    MARGIN + 52,
    cy + 26
  );

  cy += 50;
  // Body copy
  setText(doc, COL.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(copyLines, MARGIN + 16, cy);
  cy += copyLines.length * 13 + 8;

  // Product block
  if (product) {
    const px = MARGIN + 16;
    const pw = PAGE_W - MARGIN * 2 - 32;
    const ph = 70;
    roundedCard(doc, px, cy, pw, ph, COL.surface, COL.border);
    // Tile
    setFill(doc, COL.primaryDeep);
    doc.roundedRect(px + 10, cy + 10, 50, 50, 8, 8, "F");
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(product.pill, px + 35, cy + 40, { align: "center", maxWidth: 46 });
    // Text
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`AMAZON PICK  ·  ${product.brand.toUpperCase()}`, px + 72, cy + 20);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const tLines = wrapText(doc, product.title, pw - 90);
    doc.text(tLines.slice(0, 2), px + 72, cy + 34);
    setText(doc, COL.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const wLines = wrapText(doc, product.why, pw - 90);
    doc.text(wLines.slice(0, 2), px + 72, cy + 56);
    // Link
    const link = amazonLink(product.asin);
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.textWithLink("View on Amazon →", px + pw - 100, cy + ph - 8, { url: link });
    cy += ph + 12;
  }

  // Reasons
  if (reasonLines.length) {
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("WHY WE RECOMMENDED THIS", MARGIN + 16, cy + 10);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(reasonLines, MARGIN + 22, cy + 24);
    cy += 18 + reasonLines.length * 12 + 8;
  }

  // What to look for
  if (labelItems.length) {
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("WHAT TO LOOK FOR ON THE LABEL", MARGIN + 16, cy + 10);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const half = PAGE_W / 2;
    labelItems.forEach((it, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? MARGIN + 22 : half + 6;
      doc.text(`✓  ${it}`, x, cy + 24 + row * 12, { maxWidth: half - MARGIN - 30 });
    });
    cy += 18 + Math.ceil(labelItems.length / 2) * 12 + 8;
  }

  // Safety flags
  if (safetyLines.length) {
    setText(doc, COL.warn);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("SAFETY NOTES", MARGIN + 16, cy + 10);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(safetyLines, MARGIN + 22, cy + 24);
    cy += 18 + safetyLines.length * 12 + 8;
  }

  // Food-first
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("FOOD-FIRST", MARGIN + 16, cy + 8);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const ff = wrapText(doc, rec.supplement.foodFirstAdvice, PAGE_W - MARGIN * 2 - 110);
  doc.text(ff.slice(0, 2), MARGIN + 90, cy + 8);

  return y + h + 12;
}

function drawNotes(doc: jsPDF, title: string, items: string[], y: number): number {
  if (!items.length) return y;
  const innerW = PAGE_W - MARGIN * 2 - 32;
  const lines = items.flatMap((n) => wrapText(doc.setFontSize(10), `•  ${n}`, innerW));
  const h = 36 + lines.length * 13 + 12;
  y = ensureSpace(doc, y, h);
  roundedCard(doc, MARGIN, y, PAGE_W - MARGIN * 2, h);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title.toUpperCase(), MARGIN + 16, y + 22);
  setText(doc, COL.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(lines, MARGIN + 16, y + 40);
  return y + h + 14;
}

function drawDisclosure(doc: jsPDF, y: number) {
  y = ensureSpace(doc, y, 80);
  roundedCard(doc, MARGIN, y, PAGE_W - MARGIN * 2, 70, COL.surface);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const txt = wrapText(
    doc,
    "Educational only — not medical advice. Always speak with a qualified clinician before starting any new supplement, especially if pregnant, breastfeeding, taking medication, or managing a medical condition. Product links use Amazon affiliate tag papalex-20; ranking is commission-blind and computed before any product is attached.",
    PAGE_W - MARGIN * 2 - 32
  );
  doc.text(txt, MARGIN + 16, y + 20);
}

export function generateSupplementReport(result: EngineResult): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  paintBackground(doc);
  header(doc, result.matchScore);

  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let y = drawHero(doc, result, date);
  y = drawSafetyGate(doc, result, y);

  // Section header
  y = ensureSpace(doc, y, 30);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("YOUR RECOMMENDATIONS", MARGIN, y);
  y += 14;

  if (result.recommendations.length === 0) {
    roundedCard(doc, MARGIN, y, PAGE_W - MARGIN * 2, 50);
    setText(doc, COL.muted);
    doc.setFontSize(10);
    doc.text(
      "Based on your answers, no specific supplements rose above the baseline. Food-first wins.",
      MARGIN + 16,
      y + 30
    );
    y += 64;
  } else {
    result.recommendations.forEach((rec, i) => {
      y = drawRecommendation(doc, rec, i + 1, y);
    });
  }

  y = drawNotes(doc, "Food-first plan", result.foodFirstNotes, y);
  y = drawNotes(doc, "Lifestyle notes", result.generalNotes, y);
  drawDisclosure(doc, y);

  // Footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    footer(doc, i, total);
  }
  return doc;
}

export function downloadSupplementReport(result: EngineResult) {
  const doc = generateSupplementReport(result);
  const top =
    result.recommendations[0]?.supplement.name
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase() ?? "report";
  doc.save(`nutri-match-${top}-${Date.now()}.pdf`);
}
