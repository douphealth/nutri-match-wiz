import { jsPDF } from "jspdf";
import type { EngineResult, Recommendation, QuizAnswers } from "@/types/supplements";
import { productFor, amazonLink, type AmazonProduct } from "./supplement-products";
import { buildDailySchedule, type DailySchedule } from "./daily-schedule";
import { DEFAULT_ANSWERS } from "./engine";
import { buildAxes, archetypeFor, tierForAxis, type AxisRow } from "./wellness-axes";
import { pickResources, type GearUpToFitResource } from "./gearuptofit-links";


/* =========================================================================
 * Nutri Match AI — Personal Supplement Livebook (PDF)
 * Multi-page, fully branded, with real Amazon product images embedded.
 * ========================================================================= */

// Brand palette (sRGB approximations of app's oklch tokens)
const COL = {
  bg: [9, 11, 18] as const,
  bgSoft: [14, 18, 28] as const,
  surface: [20, 24, 36] as const,
  card: [26, 30, 44] as const,
  cardHi: [34, 40, 58] as const,
  border: [62, 70, 96] as const,
  borderSoft: [44, 50, 70] as const,
  text: [240, 242, 248] as const,
  textDim: [200, 206, 222] as const,
  muted: [158, 165, 188] as const,
  primary: [114, 220, 188] as const, // mint-teal
  primaryDeep: [54, 158, 138] as const,
  primarySoft: [40, 84, 76] as const,
  accent: [255, 198, 122] as const,
  danger: [240, 112, 112] as const,
  warn: [240, 184, 92] as const,
};
type RGB = readonly [number, number, number];

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 44; // page margin

const setFill = (d: jsPDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const setStroke = (d: jsPDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);
const setText = (d: jsPDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);
const opacity = (d: jsPDF, a: number) =>
  d.setGState(
    new (d as unknown as { GState: new (o: { opacity: number }) => unknown }).GState({
      opacity: a,
    }),
  );

/* ---------- Image preloading (Amazon CDN supports CORS) ---------- */

type ImageEntry = { dataUrl: string; w: number; h: number };

async function loadImage(url: string): Promise<ImageEntry | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL("image/jpeg", 0.92),
            w: img.naturalWidth,
            h: img.naturalHeight,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

async function preloadProductImages(recs: Recommendation[]): Promise<Map<string, ImageEntry>> {
  const map = new Map<string, ImageEntry>();
  const tasks = recs.map(async (r) => {
    const p = productFor(r.supplement.id);
    if (!p?.image) return;
    const img = await loadImage(p.image);
    if (img) map.set(r.supplement.id, img);
  });
  await Promise.all(tasks);
  return map;
}

/* ---------- Primitives ---------- */

function paintBackground(doc: jsPDF) {
  setFill(doc, COL.bg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  // top band
  setFill(doc, COL.bgSoft);
  doc.rect(0, 0, PAGE_W, 110, "F");
  // teal glow
  setFill(doc, COL.primary);
  opacity(doc, 0.06);
  doc.circle(PAGE_W * 0.85, 60, 200, "F");
  doc.circle(PAGE_W * 0.1, 40, 160, "F");
  opacity(doc, 1);
}

function roundedCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: RGB = COL.card,
  border: RGB = COL.borderSoft,
  radius = 12,
) {
  setFill(doc, fill);
  setStroke(doc, border);
  doc.setLineWidth(0.6);
  doc.roundedRect(x, y, w, h, radius, radius, "FD");
}

function chip(doc: jsPDF, text: string, x: number, y: number, fg: RGB, bg: RGB): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const padX = 7;
  const w = doc.getTextWidth(text) + padX * 2;
  const h = 15;
  setFill(doc, bg);
  doc.roundedRect(x, y, w, h, 4, 4, "F");
  setText(doc, fg);
  doc.text(text, x + padX, y + 10.2);
  return x + w + 6;
}

function wrap(doc: jsPDF, text: string, maxW: number): string[] {
  if (!text) return [];
  return doc.splitTextToSize(text, maxW) as string[];
}

function header(doc: jsPDF, eyebrow: string) {
  setFill(doc, COL.primary);
  doc.roundedRect(M, 34, 28, 28, 7, 7, "F");
  setText(doc, COL.bg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("N", M + 10, 53);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Nutri Match AI", M + 38, 48);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Personal Supplement Livebook  ·  gearuptofit.com", M + 38, 60);

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(eyebrow.toUpperCase(), PAGE_W - M, 50, { align: "right" });

  // hairline
  setStroke(doc, COL.borderSoft);
  doc.setLineWidth(0.5);
  doc.line(M, 78, PAGE_W - M, 78);
}

function footer(doc: jsPDF, page: number, total: number) {
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Nutri Match AI  ·  Educational only — not medical advice", M, PAGE_H - 22);
  doc.text(`Page ${page} / ${total}`, PAGE_W - M, PAGE_H - 22, { align: "right" });
}

function ensure(doc: jsPDF, y: number, needed: number, eyebrow: string): number {
  if (y + needed > PAGE_H - 60) {
    doc.addPage();
    paintBackground(doc);
    header(doc, eyebrow);
    return 100;
  }
  return y;
}

/* ---------- Cover page ---------- */

function drawCover(doc: jsPDF, result: EngineResult, dateStr: string) {
  paintBackground(doc);

  // Big mint gradient halo
  setFill(doc, COL.primary);
  opacity(doc, 0.12);
  doc.circle(PAGE_W / 2, 340, 280, "F");
  opacity(doc, 1);

  // Logo mark
  setFill(doc, COL.primary);
  doc.roundedRect(M, 60, 44, 44, 10, 10, "F");
  setText(doc, COL.bg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("N", M + 16, 92);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Nutri Match AI", M + 56, 84);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("by GearUpToFit  ·  gearuptofit.com", M + 56, 98);

  // Eyebrow
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("YOUR PERSONAL SUPPLEMENT LIVEBOOK", M, 220);

  // Title
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.text("The smartest", M, 270);
  doc.text("supplement plan", M, 312);
  setText(doc, COL.primary);
  doc.text("built for you.", M, 354);

  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  const intro = wrap(
    doc,
    "An evidence-aware, safety-first, commission-blind report. Ranking happens before any affiliate link is attached — every pick is matched to your answers first.",
    PAGE_W - M * 2 - 40,
  );
  doc.text(intro, M, 388);

  // Hero score panel
  const py = 470;
  const pw = PAGE_W - M * 2;
  const ph = 150;
  roundedCard(doc, M, py, pw, ph, COL.card, COL.primary, 16);

  // Big score
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(64);
  doc.text(`${result.matchScore}`, M + 36, py + 92);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("%", M + 36 + doc.getTextWidth(`${result.matchScore}`), py + 60);

  setText(doc, COL.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("PERSONAL MATCH SCORE", M + 36, py + 112);
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Strength of signal in your profile", M + 36, py + 126);

  // Right stack — quick stats
  const rx = M + pw / 2 + 10;
  const stats = [
    ["TOP PICKS", String(result.recommendations.length)],
    [
      "LEAD RECOMMENDATION",
      (result.recommendations[0]?.supplement.name ?? "Food-first only").replace(
        /\s*\([^)]*\)/g,
        "",
      ),
    ],
    ["SAFETY REVIEW", result.safetyGate.triggered ? "Clinician input" : "Standard"],
    ["GENERATED", dateStr],
  ];
  stats.forEach((s, i) => {
    const sy = py + 22 + i * 30;
    setText(doc, COL.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(s[0], rx, sy);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const v = wrap(doc, s[1], pw / 2 - 30);
    doc.text(v.slice(0, 1), rx, sy + 14);
  });

  // Pillars row
  const pillarY = 670;
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WHAT'S INSIDE", M, pillarY);
  const pillars = [
    ["Ranked picks", "Evidence + safety scored"],
    ["Label guide", "What to verify on every bottle"],
    ["Food-first", "Diet wins before pills"],
    ["Safety appendix", "Interactions & cautions"],
  ];
  const pw2 = (PAGE_W - M * 2 - 24) / 4;
  pillars.forEach(([t, s], i) => {
    const x = M + i * (pw2 + 8);
    roundedCard(doc, x, pillarY + 10, pw2, 64, COL.surface);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(t, x + 12, pillarY + 32);
    setText(doc, COL.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(wrap(doc, s, pw2 - 24), x + 12, pillarY + 48);
  });

  // Footer-cover
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Educational only. Not medical advice. Consult a qualified clinician before starting any new supplement.",
    M,
    PAGE_H - 50,
  );
  doc.text("Affiliate tag: papalex-20  ·  Ranking is commission-blind.", M, PAGE_H - 36);
}

/* ---------- Table of contents ---------- */

function drawTOC(doc: jsPDF, recs: Recommendation[]) {
  doc.addPage();
  paintBackground(doc);
  header(doc, "Contents");

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Contents", M, 130);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("A guided tour of your personalized livebook.", M, 152);

  const entries: { title: string; sub: string }[] = [
    { title: "01  Executive summary", sub: "Match score, lead picks, safety review" },
    { title: "02  Your ranked supplement stack", sub: "Ordered by signal strength + evidence" },
  ];
  recs.forEach((r, i) => {
    const idx = String(i + 1).padStart(2, "0");
    entries.push({
      title: `02.${idx}  ${r.supplement.name.replace(/\s*\([^)]*\)/g, "")}`,
      sub: `${r.supplement.category} · Evidence: ${r.supplement.evidenceLevel} · ${r.confidence} match`,
    });
  });
  entries.push(
    { title: "03  Food-first plan", sub: "Where the diet should do the work" },
    { title: "04  Lifestyle notes", sub: "Sleep, stress, caffeine, alcohol" },
    { title: "05  Safety appendix", sub: "Interactions, cautions, clinician check-ins" },
    { title: "06  Methodology & disclosure", sub: "How we score, how we link, what we don't do" },
  );

  let y = 180;
  entries.forEach((e) => {
    if (y > PAGE_H - 90) {
      doc.addPage();
      paintBackground(doc);
      header(doc, "Contents");
      y = 130;
    }
    roundedCard(doc, M, y, PAGE_W - M * 2, 38, COL.surface);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(e.title, M + 16, y + 17);
    setText(doc, COL.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(e.sub, M + 16, y + 30);
    y += 46;
  });
}

/* ---------- Executive summary ---------- */

function drawExecSummary(doc: jsPDF, result: EngineResult) {
  doc.addPage();
  paintBackground(doc);
  header(doc, "01 · Executive summary");

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("01  ·  EXECUTIVE SUMMARY", M, 110);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Your plan at a glance.", M, 138);

  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const intro = wrap(
    doc,
    "This is a synthesis of every signal in your quiz, weighted by published evidence, your safety profile, and how strongly each pattern showed up. Use it as a conversation starter with a clinician — not a prescription.",
    PAGE_W - M * 2,
  );
  doc.text(intro, M, 162);

  let y = 162 + intro.length * 13 + 14;

  // Score panel
  const pw = PAGE_W - M * 2;
  roundedCard(doc, M, y, pw, 110, COL.card, COL.primary, 14);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(54);
  doc.text(`${result.matchScore}%`, M + 24, y + 70);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PERSONAL MATCH SCORE", M + 24, y + 90);

  // Progress bar
  const barX = M + 200;
  const barW = pw - 220;
  setFill(doc, COL.surface);
  doc.roundedRect(barX, y + 34, barW, 14, 7, 7, "F");
  setFill(doc, COL.primary);
  doc.roundedRect(barX, y + 34, (barW * result.matchScore) / 100, 14, 7, 7, "F");
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Built from signal density, evidence-weighted picks, and your safety profile.",
    barX,
    y + 70,
  );
  doc.text(
    `${result.recommendations.length} ranked picks  ·  ${result.safetyGate.triggered ? "Clinician review recommended" : "Standard safety review"}`,
    barX,
    y + 86,
  );
  y += 124;

  // Safety gate
  if (result.safetyGate.triggered) {
    const lines = result.safetyGate.reasons.flatMap((r) => wrap(doc, `•  ${r}`, pw - 40));
    const h = 40 + lines.length * 12 + 14;
    roundedCard(doc, M, y, pw, h, [56, 26, 30], [200, 90, 90]);
    setText(doc, [255, 188, 188]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Safety gate triggered — talk with a clinician first", M + 16, y + 22);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(lines, M + 16, y + 40);
    y += h + 14;
  }

  // Top 3 mini cards
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("YOUR TOP 3 RECOMMENDATIONS", M, y + 4);
  y += 16;

  const top3 = result.recommendations.slice(0, 3);
  if (top3.length === 0) {
    roundedCard(doc, M, y, pw, 50);
    setText(doc, COL.muted);
    doc.setFontSize(10);
    doc.text("No supplements rose above the baseline. Food-first wins.", M + 16, y + 30);
  } else {
    const cw = (pw - 16) / Math.min(top3.length, 3);
    top3.forEach((r, i) => {
      const x = M + i * (cw + 8);
      roundedCard(doc, x, y, cw, 110, COL.card);
      setText(doc, COL.primary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(`#${i + 1}  ${r.confidence.toUpperCase()} MATCH`, x + 12, y + 18);
      setText(doc, COL.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      const t = wrap(doc, r.supplement.name.replace(/\s*\([^)]*\)/g, ""), cw - 24);
      doc.text(t.slice(0, 2), x + 12, y + 36);
      setText(doc, COL.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(
        `Evidence: ${r.supplement.evidenceLevel}  ·  Score ${Math.round(r.score)}`,
        x + 12,
        y + 70,
      );
      const why = wrap(doc, r.reasons[0] ?? "", cw - 24);
      setText(doc, COL.textDim);
      doc.setFontSize(8.5);
      doc.text(why.slice(0, 2), x + 12, y + 86);
    });
  }
}

/* ---------- Per-supplement detail page ---------- */

function confidenceColors(c: string): { fg: RGB; bg: RGB; label: string } {
  if (c === "High") return { fg: COL.bg, bg: COL.primary, label: "HIGH MATCH" };
  if (c === "Moderate") return { fg: COL.bg, bg: COL.accent, label: "GOOD MATCH" };
  return { fg: COL.text, bg: COL.border, label: "WORTH CONSIDERING" };
}

function drawSupplementPage(
  doc: jsPDF,
  rec: Recommendation,
  rank: number,
  product: AmazonProduct | undefined,
  productImg: ImageEntry | undefined,
) {
  doc.addPage();
  paintBackground(doc);
  const eyebrow = `02.${String(rank).padStart(2, "0")} · ${rec.supplement.name.replace(/\s*\([^)]*\)/g, "")}`;
  header(doc, eyebrow);

  const cleanName = rec.supplement.name.replace(/\s*\([^)]*\)/g, "");
  const conf = confidenceColors(rec.confidence);

  // Title block
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`PICK #${rank}  ·  ${rec.supplement.category.toUpperCase()}`, M, 110);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(cleanName, M, 144);

  // Confidence + meta chips
  let cx = M;
  const cy = 158;
  cx = chip(doc, conf.label, cx, cy, conf.fg, conf.bg);
  cx = chip(
    doc,
    `EVIDENCE · ${rec.supplement.evidenceLevel.toUpperCase()}`,
    cx,
    cy,
    COL.text,
    COL.surface,
  );
  cx = chip(
    doc,
    `SAFETY · ${rec.supplement.safetyLevel.toUpperCase()}`,
    cx,
    cy,
    COL.text,
    COL.surface,
  );
  cx = chip(doc, `SIGNAL SCORE · ${Math.round(rec.score)}`, cx, cy, COL.text, COL.surface);

  let y = 195;
  const pw = PAGE_W - M * 2;

  // Why summary
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const body = wrap(doc, rec.supplement.resultCopy, pw);
  doc.text(body, M, y);
  y += body.length * 14 + 14;

  // Amazon product hero card (image + details)
  if (product) {
    const ph = 168;
    roundedCard(doc, M, y, pw, ph, COL.card, COL.borderSoft, 14);

    // Left image area
    const imgBoxX = M + 14;
    const imgBoxY = y + 14;
    const imgBoxS = 140;
    setFill(doc, [248, 250, 252]);
    doc.roundedRect(imgBoxX, imgBoxY, imgBoxS, imgBoxS, 10, 10, "F");

    if (productImg) {
      // Fit image into box preserving aspect ratio
      const pad = 10;
      const max = imgBoxS - pad * 2;
      const ratio = productImg.w / productImg.h;
      let iw = max;
      let ih = max;
      if (ratio > 1) ih = max / ratio;
      else iw = max * ratio;
      const ix = imgBoxX + (imgBoxS - iw) / 2;
      const iy = imgBoxY + (imgBoxS - ih) / 2;
      try {
        doc.addImage(productImg.dataUrl, "JPEG", ix, iy, iw, ih, undefined, "FAST");
      } catch {
        /* fall back to placeholder below */
      }
    } else {
      // Branded fallback tile
      setFill(doc, COL.primarySoft);
      doc.roundedRect(imgBoxX + 14, imgBoxY + 14, imgBoxS - 28, imgBoxS - 28, 8, 8, "F");
      setText(doc, COL.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(product.pill, imgBoxX + imgBoxS / 2, imgBoxY + imgBoxS / 2 + 4, {
        align: "center",
        maxWidth: imgBoxS - 30,
      });
    }

    // Right text area
    const tx = imgBoxX + imgBoxS + 18;
    const tw = pw - imgBoxS - 50;
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`AMAZON PICK  ·  ${product.brand.toUpperCase()}`, tx, y + 28);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const ttl = wrap(doc, product.title, tw);
    doc.text(ttl.slice(0, 3), tx, y + 46);
    const titleBlockH = Math.min(ttl.length, 3) * 14;

    setText(doc, COL.textDim);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const why = wrap(doc, product.why, tw);
    doc.text(why.slice(0, 2), tx, y + 50 + titleBlockH + 10);

    // Badges
    if (product.badges?.length) {
      let bx = tx;
      const by = y + ph - 56;
      product.badges.slice(0, 3).forEach((b) => {
        bx = chip(doc, b.toUpperCase(), bx, by, COL.primary, COL.surface);
      });
    }

    // CTA
    const link = amazonLink(product.asin);
    const ctaY = y + ph - 28;
    setFill(doc, COL.primary);
    const ctaW = 160;
    doc.roundedRect(tx, ctaY, ctaW, 22, 6, 6, "F");
    setText(doc, COL.bg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.textWithLink("VIEW ON AMAZON  →", tx + ctaW / 2, ctaY + 14, {
      align: "center",
      url: link,
    });
    setText(doc, COL.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Affiliate · tag papalex-20 · ASIN ${product.asin}`, tx + ctaW + 12, ctaY + 14);

    y += ph + 16;
  }

  // Why we recommended this
  y = ensure(doc, y, 60, eyebrow);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WHY WE RECOMMENDED THIS", M, y);
  y += 14;
  setText(doc, COL.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const reasons = rec.reasons.slice(0, 6);
  reasons.forEach((r) => {
    const lines = wrap(doc, r, pw - 18);
    y = ensure(doc, y, lines.length * 13 + 4, eyebrow);
    setFill(doc, COL.primary);
    doc.circle(M + 4, y - 3, 1.6, "F");
    setText(doc, COL.text);
    doc.text(lines, M + 14, y);
    y += lines.length * 13 + 4;
  });
  y += 8;

  // Two-column: Label guide / Best for
  y = ensure(doc, y, 140, eyebrow);
  const colW = (pw - 12) / 2;
  // Label guide
  const labelItems = rec.supplement.whatToLookFor;
  const guideH = 24 + labelItems.length * 14 + 14;
  roundedCard(doc, M, y, colW, guideH, COL.surface);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WHAT TO LOOK FOR ON THE LABEL", M + 14, y + 20);
  setText(doc, COL.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  labelItems.forEach((it, i) => {
    doc.text(`✓  ${it}`, M + 14, y + 38 + i * 14, { maxWidth: colW - 28 });
  });

  // Best for / typical use
  const bestForLines = wrap(doc, rec.supplement.typicalUseCase, colW - 28);
  const recOnly = rec.supplement.recommendedOnlyIf;
  const bestH = 24 + bestForLines.length * 13 + 12 + recOnly.length * 13 + 14;
  const colH = Math.max(guideH, bestH);
  roundedCard(doc, M + colW + 12, y, colW, colH, COL.surface);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("WHO THIS IS FOR", M + colW + 26, y + 20);
  setText(doc, COL.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(bestForLines, M + colW + 26, y + 38);
  let by2 = y + 38 + bestForLines.length * 13 + 8;
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CONSIDER ONLY IF", M + colW + 26, by2);
  by2 += 12;
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  recOnly.forEach((it) => {
    doc.text(`•  ${it}`, M + colW + 26, by2, { maxWidth: colW - 28 });
    by2 += 13;
  });

  y += Math.max(guideH, colH) + 14;

  // Safety / interactions
  const safety = [
    ...(rec.safetyFlags ?? []),
    ...(rec.supplement.contraindications.length
      ? [`Avoid with: ${rec.supplement.contraindications.join(", ")}`]
      : []),
    ...(rec.supplement.medicationInteractions.length
      ? [`Med interactions: ${rec.supplement.medicationInteractions.join(", ")}`]
      : []),
  ];
  if (safety.length) {
    const sLines = safety.flatMap((s) => wrap(doc, `•  ${s}`, pw - 36));
    const sh = 24 + sLines.length * 13 + 14;
    y = ensure(doc, y, sh, eyebrow);
    roundedCard(doc, M, y, pw, sh, [50, 38, 24], [200, 150, 80]);
    setText(doc, COL.warn);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("SAFETY NOTES & INTERACTIONS", M + 14, y + 20);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(sLines, M + 14, y + 38);
    y += sh + 14;
  }

  // Food-first
  const ffLines = wrap(doc, rec.supplement.foodFirstAdvice, pw - 32);
  const ffh = 24 + ffLines.length * 13 + 14;
  y = ensure(doc, y, ffh, eyebrow);
  roundedCard(doc, M, y, pw, ffh, COL.card);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FOOD-FIRST PLAN", M + 14, y + 20);
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(ffLines, M + 14, y + 38);
}

/* ---------- Generic chapter (food-first / lifestyle / safety appendix) ---------- */

function drawChapter(doc: jsPDF, num: string, title: string, intro: string, items: string[]) {
  doc.addPage();
  paintBackground(doc);
  header(doc, `${num} · ${title}`);

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${num}  ·  CHAPTER`, M, 110);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(title, M, 140);

  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const introLines = wrap(doc, intro, PAGE_W - M * 2);
  doc.text(introLines, M, 162);

  let y = 162 + introLines.length * 14 + 14;
  const pw = PAGE_W - M * 2;
  if (items.length === 0) {
    roundedCard(doc, M, y, pw, 50);
    setText(doc, COL.muted);
    doc.setFontSize(10);
    doc.text("Nothing flagged for this chapter — keep doing what you're doing.", M + 16, y + 30);
    return;
  }

  items.forEach((it) => {
    const lines = wrap(doc, it, pw - 56);
    const h = Math.max(46, 18 + lines.length * 13 + 14);
    y = ensure(doc, y, h, `${num} · ${title}`);
    roundedCard(doc, M, y, pw, h, COL.card);
    // bullet
    setFill(doc, COL.primary);
    doc.circle(M + 22, y + 22, 4, "F");
    setText(doc, COL.bg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text(lines, M + 40, y + 24);
    y += h + 10;
  });
}

/* ---------- Methodology & disclosure ---------- */

function drawMethodology(doc: jsPDF) {
  doc.addPage();
  paintBackground(doc);
  header(doc, "06 · Methodology & disclosure");

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("06  ·  METHODOLOGY & DISCLOSURE", M, 110);
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("How this report was built.", M, 140);

  const pw = PAGE_W - M * 2;
  const sections = [
    {
      h: "Signal scoring",
      b: "Each supplement starts at zero and earns points only for signals you explicitly reported (diet, training, sleep, stress, sun, goals, medical context). Evidence strength and safety class then weight the final confidence label.",
    },
    {
      h: "Match score",
      b: "Combines (1) signal density across your answers, (2) average evidence strength of your top picks, and (3) a safety penalty when a clinician review is recommended. Anchored at 60 minimum, capped at 98 — no perfect scores.",
    },
    {
      h: "Commission-blind ranking",
      b: "Ranking is computed before any Amazon link is attached. We never re-order picks to favor a specific brand or higher commission. If a product can't be matched, the recommendation still appears.",
    },
    {
      h: "Affiliate disclosure",
      b: "Product links use the Amazon affiliate tag papalex-20. As an Amazon Associate, GearUpToFit may earn from qualifying purchases at no extra cost to you.",
    },
    {
      h: "Safety gate",
      b: "Pregnancy, breastfeeding, prescription medications, blood thinners, kidney/liver disease, planned surgery, and other flags trigger a clinician-first banner. High-caution supplements (e.g. iron, melatonin) are downgraded or suppressed accordingly.",
    },
    {
      h: "What this report is not",
      b: "Not a diagnosis. Not a prescription. Not a substitute for blood work, your medical history, or a conversation with a qualified clinician. Always verify dose, form, and timing with a professional who knows you.",
    },
  ];

  let y = 168;
  sections.forEach((s) => {
    const bLines = wrap(doc, s.b, pw - 32);
    const h = 22 + bLines.length * 13 + 18;
    y = ensure(doc, y, h, "06 · Methodology & disclosure");
    roundedCard(doc, M, y, pw, h, COL.card);
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(s.h, M + 16, y + 22);
    setText(doc, COL.textDim);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(bLines, M + 16, y + 40);
    y += h + 10;
  });

  // Final disclosure footer block
  y = ensure(doc, y, 80, "06 · Methodology & disclosure");
  roundedCard(doc, M, y, pw, 70, COL.surface, COL.primary);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("EDUCATIONAL ONLY — NOT MEDICAL ADVICE", M + 16, y + 22);
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const dis = wrap(
    doc,
    "Speak with a qualified clinician before starting any new supplement — especially if you're pregnant, breastfeeding, under 18, taking medication, or managing a medical condition. Doses, forms, and timing should always be confirmed with someone who knows your full picture.",
    pw - 32,
  );
  doc.text(dis, M + 16, y + 40);
}

/* ---------- Daily protocol chapter ---------- */

function drawDailyProtocol(doc: jsPDF, schedule: DailySchedule) {
  doc.addPage();
  paintBackground(doc);
  header(doc, "02 · Daily protocol");

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("02  ·  YOUR DAILY PROTOCOL", M, 110);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Take this, at this time,", M, 140);
  doc.text("with this.", M, 170);

  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const intro = wrap(
    doc,
    `A clinician-style timeline built from your answers: dose, form, food pairing, and cadence for each pick. ${schedule.totalDoses} total doses spread across ${schedule.bySlot.length} time slot${schedule.bySlot.length === 1 ? "" : "s"}.`,
    PAGE_W - M * 2,
  );
  doc.text(intro, M, 196);

  let y = 196 + intro.length * 14 + 10;
  const pw = PAGE_W - M * 2;

  schedule.bySlot.forEach((slot) => {
    const blockLines = slot.doses.flatMap((d) => {
      const head = `${d.supplementName} — ${d.dose}`;
      return [head, `${d.form}  ·  ${d.withFood}  ·  ${d.cadence}`, ...wrap(doc, d.notes, pw - 60)];
    });
    const h = 36 + blockLines.length * 12 + 16;
    y = ensure(doc, y, h, "02 · Daily protocol");

    // Slot header strip
    setFill(doc, COL.primarySoft);
    doc.roundedRect(M, y, pw, 24, 8, 8, "F");
    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(slot.label.toUpperCase(), M + 14, y + 16);
    setText(doc, COL.text);
    doc.text(
      `${slot.doses.length} item${slot.doses.length > 1 ? "s" : ""}`,
      PAGE_W - M - 14,
      y + 16,
      { align: "right" },
    );

    // Card body
    const bodyY = y + 28;
    const bodyH = h - 30;
    roundedCard(doc, M, bodyY, pw, bodyH, COL.card);
    let cy = bodyY + 16;
    slot.doses.forEach((d, i) => {
      if (i > 0) {
        setStroke(doc, COL.borderSoft);
        doc.setLineWidth(0.4);
        doc.line(M + 14, cy - 4, PAGE_W - M - 14, cy - 4);
      }
      setText(doc, COL.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(d.supplementName, M + 14, cy);
      setText(doc, COL.primary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(d.cadence.toUpperCase(), PAGE_W - M - 14, cy, { align: "right" });
      cy += 14;
      setText(doc, COL.textDim);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(d.dose, M + 14, cy);
      cy += 12;
      setText(doc, COL.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`${d.form}  ·  ${d.withFood}`, M + 14, cy);
      cy += 12;
      const noteLines = wrap(doc, d.notes, pw - 32);
      setText(doc, COL.textDim);
      doc.setFontSize(9);
      doc.text(noteLines, M + 14, cy);
      cy += noteLines.length * 11 + 8;
    });
    y = bodyY + bodyH + 14;
  });

  if (schedule.globalSeparations.length) {
    const lines = schedule.globalSeparations.flatMap((s) => wrap(doc, `•  ${s}`, pw - 40));
    const h = 32 + lines.length * 12 + 12;
    y = ensure(doc, y, h, "02 · Daily protocol");
    roundedCard(doc, M, y, pw, h, [50, 38, 24], [200, 150, 80]);
    setText(doc, COL.warn);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TIMING SEPARATIONS", M + 14, y + 20);
    setText(doc, COL.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(lines, M + 14, y + 38);
  }
}

/* ---------- Wellness profile chapter ---------- */

function drawWellnessRadar(
  doc: jsPDF,
  axes: AxisRow[],
  cx: number,
  cy: number,
  R: number,
) {
  const n = axes.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  const drawPolygon = (
    pts: { x: number; y: number }[],
    style: "S" | "F" | "FD",
  ) => {
    const deltas = pts.slice(1).map((p, i) => [p.x - pts[i].x, p.y - pts[i].y] as [number, number]);
    deltas.push([pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y]);
    doc.lines(deltas, pts[0].x, pts[0].y, [1, 1], style, true);
  };

  // Concentric rings (25/50/75/100)
  setStroke(doc, COL.borderSoft);
  doc.setLineWidth(0.4);
  [0.25, 0.5, 0.75, 1].forEach((t) => {
    drawPolygon(axes.map((_, i) => point(i, R * t)), "S");
  });

  // Spokes
  axes.forEach((_, i) => {
    const p = point(i, R);
    doc.line(cx, cy, p.x, p.y);
  });

  // Data polygon
  const dataPts = axes.map((a, i) => point(i, (a.value / 100) * R));
  setFill(doc, COL.primary);
  opacity(doc, 0.28);
  drawPolygon(dataPts, "F");
  opacity(doc, 1);

  setStroke(doc, COL.primary);
  doc.setLineWidth(1.4);
  drawPolygon(dataPts, "S");

  // Vertex dots
  axes.forEach((a, i) => {
    const p = dataPts[i];
    const t = tierForAxis(a.value);
    setFill(doc, COL.bg);
    setStroke(doc, t.rgb as unknown as RGB);
    doc.setLineWidth(1.2);
    doc.circle(p.x, p.y, 3.2, "FD");
  });

  // Labels around the outside
  const labelR = R + 22;
  axes.forEach((a, i) => {
    const p = point(i, labelR);
    const t = tierForAxis(a.value);
    const isMid = Math.abs(p.x - cx) < 4;
    const align: "left" | "right" | "center" = isMid ? "center" : p.x > cx ? "left" : "right";
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(a.key.toUpperCase(), p.x, p.y - 3, { align });
    setText(doc, t.rgb as unknown as RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${a.value} · ${t.label}`, p.x, p.y + 9, { align });
  });

  // Center hub
  setFill(doc, COL.primary);
  doc.circle(cx, cy, 1.6, "F");
}


function drawWellnessProfile(doc: jsPDF, answers: QuizAnswers, result: EngineResult) {
  const axes = buildAxes(answers, result);
  const arche = archetypeFor(axes, answers);
  const overall = Math.round(axes.reduce((s, a) => s + a.value, 0) / axes.length);
  const sorted = [...axes].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const eyebrow = "02 · Your wellness profile";

  doc.addPage();
  paintBackground(doc);
  header(doc, eyebrow);

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("02  ·  YOUR WELLNESS PROFILE", M, 110);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(arche.name, M, 142);

  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const tag = wrap(doc, arche.tagline, PAGE_W - M * 2);
  doc.text(tag, M, 166);

  let y = 166 + tag.length * 14 + 12;
  const pw = PAGE_W - M * 2;

  // Radar + score panel
  const radarH = 250;
  roundedCard(doc, M, y, pw, radarH, COL.card, COL.borderSoft, 14);

  // Left: radar
  const radarCX = M + 150;
  const radarCY = y + radarH / 2 + 6;
  drawWellnessRadar(doc, axes, radarCX, radarCY, 88);

  // Right: overall + strongest/weakest
  const rx = M + 300;
  setText(doc, COL.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("OVERALL WELLNESS", rx, y + 28);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.text(`${overall}`, rx, y + 76);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("/ 100", rx + doc.getTextWidth(`${overall}`) + 6, y + 70);

  // Mini stat: strongest
  const ss = tierForAxis(strongest.value);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("STRONGEST", rx, y + 108);
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${strongest.key}  ${strongest.value}`, rx, y + 124);
  setText(doc, ss.rgb as unknown as RGB);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(ss.label.toUpperCase(), rx, y + 137);

  const ws = tierForAxis(weakest.value);
  setText(doc, COL.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("FOCUS ON NEXT", rx, y + 162);
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${weakest.key}  ${weakest.value}`, rx, y + 178);
  setText(doc, ws.rgb as unknown as RGB);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(ws.label.toUpperCase(), rx, y + 191);

  setText(doc, COL.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Derived from goals, sleep, training, diet & stress.", rx, y + radarH - 14);

  y += radarH + 16;

  // Per-axis breakdown — grid 2×3
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("AXIS BREAKDOWN", M, y);
  y += 12;

  const cardW = (pw - 12) / 2;
  const cardH = 76;
  axes.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = M + col * (cardW + 12);
    const cy = y + row * (cardH + 10);
    if (cy + cardH > PAGE_H - 70) return; // safety
    const t = tierForAxis(a.value);
    roundedCard(doc, cx, cy, cardW, cardH, COL.surface);
    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(a.key.toUpperCase(), cx + 14, cy + 18);
    setText(doc, t.rgb as unknown as RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${a.value}`, cx + cardW - 14, cy + 20, { align: "right" });
    setText(doc, COL.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(t.label.toUpperCase(), cx + cardW - 14, cy + 32, { align: "right" });

    // Tiny bar
    setFill(doc, COL.borderSoft);
    doc.roundedRect(cx + 14, cy + 36, cardW - 28, 4, 2, 2, "F");
    setFill(doc, t.rgb as unknown as RGB);
    doc.roundedRect(cx + 14, cy + 36, ((cardW - 28) * a.value) / 100, 4, 2, 2, "F");

    setText(doc, COL.textDim);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const meaning = wrap(doc, a.meaning, cardW - 28);
    doc.text(meaning.slice(0, 1), cx + 14, cy + 52);
    setText(doc, COL.muted);
    doc.setFontSize(8);
    const driver = wrap(doc, a.driver, cardW - 28);
    doc.text(driver.slice(0, 1), cx + 14, cy + 64);
  });
}

/* ---------- Further reading (gearuptofit.com) ---------- */

function drawResources(doc: jsPDF, resources: GearUpToFitResource[]) {
  doc.addPage();
  paintBackground(doc);
  const eyebrow = "07 · Further reading on GearUpToFit";
  header(doc, eyebrow);

  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("07  ·  FURTHER READING", M, 110);

  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Hand-picked guides for you.", M, 140);

  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const intro = wrap(
    doc,
    "These GearUpToFit articles map directly to your top picks and goals. Tap any title to open the guide on gearuptofit.com.",
    PAGE_W - M * 2,
  );
  doc.text(intro, M, 162);

  let y = 162 + intro.length * 14 + 14;
  const pw = PAGE_W - M * 2;

  resources.forEach((r) => {
    const titleLines = wrap(doc, r.title, pw - 32);
    const whyLines = wrap(doc, r.why, pw - 32);
    const urlLines = wrap(doc, r.url, pw - 32);
    const h = 14 + titleLines.length * 14 + whyLines.length * 12 + urlLines.length * 11 + 22;
    y = ensure(doc, y, h, eyebrow);
    roundedCard(doc, M, y, pw, h, COL.card);

    setText(doc, COL.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text(titleLines, M + 16, y + 22);
    let cy = y + 22 + titleLines.length * 14;

    setText(doc, COL.textDim);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(whyLines, M + 16, cy);
    cy += whyLines.length * 12 + 4;

    setText(doc, COL.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.textWithLink(r.url, M + 16, cy + 4, { url: r.url });
    y += h + 10;
  });

  // Site-wide CTA card
  y = ensure(doc, y, 70, eyebrow);
  roundedCard(doc, M, y, pw, 60, COL.surface, COL.primary);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("EXPLORE EVERYTHING ON GEARUPTOFIT.COM", M + 16, y + 24);
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Reviews, training plans, gear breakdowns, nutrition deep-dives.", M + 16, y + 40);
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.textWithLink("https://gearuptofit.com  →", PAGE_W - M - 16, y + 36, {
    align: "right",
    url: "https://gearuptofit.com",
  });
}

/* ---------- Master generator ---------- */

export async function generateSupplementReport(result: EngineResult): Promise<jsPDF> {

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Pre-load all product images
  const imageMap = await preloadProductImages(result.recommendations);

  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Cover
  drawCover(doc, result, date);
  // TOC
  drawTOC(doc, result.recommendations);
  // Executive summary
  drawExecSummary(doc, result);

  // Daily protocol
  const answers: QuizAnswers = result.answers ?? DEFAULT_ANSWERS;
  const schedule = buildDailySchedule(result.recommendations, answers);
  if (schedule.totalDoses > 0) {
    drawDailyProtocol(doc, schedule);
  }

  // Stack divider page
  doc.addPage();
  paintBackground(doc);
  header(doc, "02 · Your ranked stack");
  setText(doc, COL.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("02  ·  YOUR RANKED SUPPLEMENT STACK", M, 110);
  setText(doc, COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("The shortlist — ranked by", M, 142);
  doc.text("signal, evidence, and safety.", M, 174);
  setText(doc, COL.textDim);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const sd = wrap(
    doc,
    "Each pick gets its own page: a hero card with the real Amazon product, why we recommended it, what to verify on the label, who it's for, safety notes, and a food-first plan in case the diet can do the work.",
    PAGE_W - M * 2,
  );
  doc.text(sd, M, 200);

  // Per-supplement pages
  result.recommendations.forEach((r, i) => {
    drawSupplementPage(doc, r, i + 1, productFor(r.supplement.id), imageMap.get(r.supplement.id));
  });

  // Food-first
  drawChapter(
    doc,
    "03",
    "Food-first plan",
    "Most vitamin and mineral gaps close fastest at the plate. These are the diet moves your answers point to — make them first; let supplements fill what's left.",
    result.foodFirstNotes.length
      ? result.foodFirstNotes
      : [
          "No specific food-first gaps stood out. Keep variety and produce high, and revisit if symptoms appear.",
        ],
  );

  // Lifestyle
  drawChapter(
    doc,
    "04",
    "Lifestyle notes",
    "Sleep, stress, caffeine, and alcohol move the needle more than most supplements. These notes are personalized to the answers you gave.",
    result.generalNotes.length
      ? result.generalNotes
      : [
          "No specific lifestyle flags. Keep monitoring sleep, stress, and stimulant intake — they shape supplement need.",
        ],
  );

  // Safety appendix
  const safetyItems: string[] = [];
  if (result.safetyGate.triggered) safetyItems.push(...result.safetyGate.reasons);
  result.recommendations.forEach((r) => {
    r.safetyFlags.forEach((f) =>
      safetyItems.push(`${r.supplement.name.replace(/\s*\([^)]*\)/g, "")}: ${f}`),
    );
  });
  drawChapter(
    doc,
    "05",
    "Safety appendix",
    "Every safety flag the engine raised for your profile, consolidated in one place to share with a pharmacist or clinician.",
    safetyItems.length ? safetyItems : ["No safety flags raised by your answers."],
  );

  // Methodology
  drawMethodology(doc);

  // Footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    // Skip footer on cover (page 1)
    if (i === 1) continue;
    footer(doc, i, total);
  }
  return doc;
}

export async function downloadSupplementReport(result: EngineResult): Promise<void> {
  const doc = await generateSupplementReport(result);
  const top =
    result.recommendations[0]?.supplement.name
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase() ?? "report";
  doc.save(`nutri-match-livebook-${top}-${Date.now()}.pdf`);
}
