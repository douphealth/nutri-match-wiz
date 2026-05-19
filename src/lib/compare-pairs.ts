// Curated comparison pairs — used by the /compare/$slug route and sitemap.
// Each pair points to two existing topic slugs in seo-topics.ts.
// Pairs were chosen because they reflect real "X vs Y" search intent we see
// in supplement decision-making.

import { SEO_TOPICS, type TopicCopy } from "./seo-topics";

export interface ComparePair {
  slug: string;
  a: string;
  b: string;
  /** One-line "decision frame" rendered in the lede. */
  decisionFrame: string;
}

export const COMPARE_PAIRS: ComparePair[] = [
  {
    slug: "vitamin-d-vs-magnesium",
    a: "vitamin-d",
    b: "magnesium",
    decisionFrame:
      "Both are common shortfall nutrients. Vitamin D corrects a lab-confirmed gap; magnesium fills a measured dietary one.",
  },
  {
    slug: "omega-3-vs-vitamin-d",
    a: "omega-3",
    b: "vitamin-d",
    decisionFrame:
      "Different jobs. Omega-3 targets EPA+DHA shortfall when oily fish is rare; vitamin D corrects deficiency confirmed by 25(OH)D.",
  },
  {
    slug: "creatine-vs-protein",
    a: "creatine",
    b: "multivitamin",
    decisionFrame:
      "Creatine is the most evidence-backed performance aid. A multivitamin only matters when diet quality is unreliable — they solve different problems.",
  },
  {
    slug: "iron-vs-vitamin-b12",
    a: "iron",
    b: "vitamin-b12",
    decisionFrame:
      "Both can cause 'low energy' symptoms. Iron requires labs before use; B12 is the safer first check for vegans, adults 50+, and metformin users.",
  },
  {
    slug: "magnesium-vs-melatonin",
    a: "magnesium",
    b: "melatonin",
    decisionFrame:
      "For sleep, magnesium addresses a dietary gap with low risk; melatonin is a short-term circadian tool, not a nightly sedative.",
  },
  {
    slug: "calcium-vs-vitamin-d",
    a: "calcium",
    b: "vitamin-d",
    decisionFrame:
      "Bone health pair. Calcium fills a measured dietary gap (especially low-dairy/vegan); vitamin D enables calcium absorption.",
  },
  {
    slug: "zinc-vs-vitamin-c",
    a: "zinc",
    b: "vitamin-c",
    decisionFrame:
      "Both have modest, short-term cold-symptom evidence. Neither prevents colds in well-fed adults.",
  },
  {
    slug: "probiotics-vs-multivitamin",
    a: "probiotics",
    b: "multivitamin",
    decisionFrame:
      "Probiotics are strain- and condition-specific, not a general 'gut health' insurance. A multivitamin is conservative diet insurance — different roles.",
  },
];

export const COMPARE_SLUGS = COMPARE_PAIRS.map((p) => p.slug);

export interface ResolvedPair {
  pair: ComparePair;
  a: TopicCopy;
  b: TopicCopy;
}

export function resolveComparePair(slug: string): ResolvedPair | undefined {
  const pair = COMPARE_PAIRS.find((p) => p.slug === slug);
  if (!pair) return undefined;
  const a = SEO_TOPICS.find((t) => t.slug === pair.a);
  const b = SEO_TOPICS.find((t) => t.slug === pair.b);
  if (!a || !b) return undefined;
  return { pair, a, b };
}
