// Curated, hand-picked links to highly-relevant GearUpToFit content,
// matched to the supplements the engine recommended and the user's profile.
// IMPORTANT: every URL below is verified against the live gearuptofit.com
// sitemap. Do NOT invent /supplement-match/* paths — they 404 on the WP site.
import type { EngineResult, QuizAnswers, Goal } from "@/types/supplements";

const BASE = "https://gearuptofit.com";

interface Resource {
  title: string;
  url: string;
  why: string;
}

// supplement.id → verified article on gearuptofit.com
const SUPPLEMENT_LINKS: Record<string, Resource> = {
  vitamin_d3: {
    title: "How much vitamin D is enough?",
    url: `${BASE}/nutrition/how-much-vitamin-d-is-enough/`,
    why: "Dose ranges, lab targets, and why most people under-dose D3.",
  },
  omega3: {
    title: "Ranking the best fish oil supplements",
    url: `${BASE}/health/supplements/ranking-the-best-fish-oil-supplements/`,
    why: "How to read EPA/DHA per serving and avoid rancid oils.",
  },
  magnesium_glycinate: {
    title: "Ranking the best sleep aids",
    url: `${BASE}/health/ranking-the-best-sleep-aids/`,
    why: "Where magnesium glycinate fits in a sleep stack — and what beats it.",
  },
  creatine_monohydrate: {
    title: "Ranking the best creatine",
    url: `${BASE}/health/supplements/ranking-the-best-creatine-for-men/`,
    why: "Why monohydrate still wins, plus loading vs maintenance.",
  },
  whey_protein: {
    title: "Best protein powders for muscle gain",
    url: `${BASE}/review/best-protein-powders-for-muscle-gain/`,
    why: "Isolate vs concentrate, lactose tips, per-meal protein math.",
  },
  vitamin_b12: {
    title: "Best energy supplements for chronic fatigue",
    url: `${BASE}/health/supplements/ranking-the-best-energy-supplements-for-chronic-fatigue/`,
    why: "Where B12 fits — and the labs to run before you supplement.",
  },
  iron: {
    title: "Ranking the best iron supplements",
    url: `${BASE}/health/supplements/ranking-the-best-iron-supplement-for-women/`,
    why: "Ferritin testing before supplementing, GI tolerability, food-first.",
  },
  zinc: {
    title: "7 health benefits of zinc",
    url: `${BASE}/nutrition/7-health-benefits-of-zinc/`,
    why: "Acute vs chronic dosing, copper balance, and food-first wins.",
  },
  electrolytes: {
    title: "Best electrolyte powders",
    url: `${BASE}/review/best-electrolyte-powders-for-runners/`,
    why: "Sodium per liter math for runners, hikers, and hot-climate training.",
  },
  ashwagandha: {
    title: "Best supplements to reduce cortisol",
    url: `${BASE}/health/supplements/ranking-the-best-supplements-to-reduce-cortisol/`,
    why: "Where ashwagandha fits — and who should skip it.",
  },
  melatonin: {
    title: "Ranking the best sleep aids",
    url: `${BASE}/health/ranking-the-best-sleep-aids/`,
    why: "Why 0.3–0.5 mg melatonin often beats 5–10 mg for sleep onset.",
  },
  collagen: {
    title: "The best collagen peptide supplements",
    url: `${BASE}/nutrition/the-best-collagen-peptide-supplements/`,
    why: "Type I vs type II, vitamin C synergy, what the evidence supports.",
  },
  probiotics: {
    title: "What you should know about probiotics",
    url: `${BASE}/nutrition/what-you-should-know-about-probiotics/`,
    why: "Why strain matters more than CFU count on the label.",
  },
  multivitamin: {
    title: "Ranking the best multivitamins",
    url: `${BASE}/nutrition/ranking-the-best-multivitamins-for-women/`,
    why: "When a multi makes sense and when it's just expensive pee.",
  },
};

// goal → verified GUTF guide
const GOAL_LINKS: Record<Goal, Resource | undefined> = {
  energy: {
    title: "Best energy supplements for chronic fatigue",
    url: `${BASE}/health/supplements/ranking-the-best-energy-supplements-for-chronic-fatigue/`,
    why: "Steady-state energy comes from food and sleep first.",
  },
  muscle_recovery: {
    title: "Best protein powders for muscle gain",
    url: `${BASE}/review/best-protein-powders-for-muscle-gain/`,
    why: "Per-meal protein math for lifters and athletes.",
  },
  endurance: {
    title: "Best electrolyte powders for runners",
    url: `${BASE}/review/best-electrolyte-powders-for-runners/`,
    why: "Sodium, hydration, and fueling for endurance athletes.",
  },
  weight_management: {
    title: "Best thermogenic supplements for fat loss",
    url: `${BASE}/health/supplements/best-thermogenic-supplements-for-fat-loss/`,
    why: "What actually moves the needle — and what doesn't.",
  },
  sleep: {
    title: "Ranking the best sleep aids",
    url: `${BASE}/health/ranking-the-best-sleep-aids/`,
    why: "Behavior changes that beat any pill, then what's worth trying.",
  },
  general_wellness: {
    title: "Ranking the best multivitamins",
    url: `${BASE}/nutrition/ranking-the-best-multivitamins-for-women/`,
    why: "The short list that survives the evidence filter.",
  },
  bone_health: {
    title: "Ranking the best calcium supplements",
    url: `${BASE}/health/supplements/ranking-the-best-calcium-supplement-for-women/`,
    why: "Why resistance training matters more than any single nutrient.",
  },
  immune: {
    title: "7 health benefits of zinc",
    url: `${BASE}/nutrition/7-health-benefits-of-zinc/`,
    why: "The non-marketing version of an 'immune-boosting' stack.",
  },
  focus: {
    title: "Best supplements to reduce cortisol",
    url: `${BASE}/health/supplements/ranking-the-best-supplements-to-reduce-cortisol/`,
    why: "Cognitive endurance starts with sleep and stress, not nootropics.",
  },
};

const ALWAYS: Resource[] = [
  {
    title: "How GearUpToFit reviews supplements",
    url: `${BASE}/review-methodology/`,
    why: "Our evidence framework, conflicts-of-interest policy, and review process.",
  },
  {
    title: "All supplement guides",
    url: `${BASE}/category/supplements/`,
    why: "Index of every GearUpToFit supplement deep-dive.",
  },
  {
    title: "Latest reviews & guides",
    url: `${BASE}/blog/`,
    why: "Fresh evidence-led articles published weekly.",
  },
];

/** Pick up to 8 maximally relevant GearUpToFit resources for this user. */
export function pickResources(result: EngineResult, answers?: QuizAnswers): Resource[] {
  const out: Resource[] = [];
  const seen = new Set<string>();
  const push = (r?: Resource) => {
    if (!r || seen.has(r.url)) return;
    seen.add(r.url);
    out.push(r);
  };

  for (const rec of result.recommendations.slice(0, 5)) {
    push(SUPPLEMENT_LINKS[rec.supplement.id]);
  }
  const goals = answers?.goals ?? result.answers?.goals ?? [];
  for (const g of goals.slice(0, 3)) {
    push(GOAL_LINKS[g]);
  }
  for (const r of ALWAYS) push(r);
  return out.slice(0, 8);
}

export type { Resource as GearUpToFitResource };
