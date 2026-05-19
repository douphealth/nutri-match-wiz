// Curated, hand-picked links to highly-relevant GearUpToFit content,
// matched to the supplements the engine recommended and the user's profile.
// These are the URLs we surface in the PDF "Further reading" page.
import type { EngineResult, QuizAnswers, Goal } from "@/types/supplements";

const BASE = "https://gearuptofit.com";

interface Resource {
  title: string;
  url: string;
  why: string;
}

// supplement.id → article on gearuptofit.com
const SUPPLEMENT_LINKS: Record<string, Resource> = {
  vitamin_d3: {
    title: "Vitamin D — dose, timing & who actually needs it",
    url: `${BASE}/supplement-match/vitamin-d/`,
    why: "Lab-first guidance, sun-exposure math, and when D3+K2 makes sense.",
  },
  omega3: {
    title: "Omega-3 fish oil — EPA/DHA quality guide",
    url: `${BASE}/supplement-match/omega-3/`,
    why: "How to read EPA/DHA per serving and avoid rancid oils.",
  },
  magnesium_glycinate: {
    title: "Magnesium glycinate — sleep, cramps & stress",
    url: `${BASE}/supplement-match/magnesium/`,
    why: "Which form for which goal — glycinate vs citrate vs threonate.",
  },
  creatine_monohydrate: {
    title: "Creatine monohydrate — the most-studied legal ergogenic",
    url: `${BASE}/supplement-match/creatine/`,
    why: "Loading vs maintenance, timing, and why monohydrate still wins.",
  },
  whey_protein: {
    title: "Whey protein — when food alone won't hit your target",
    url: `${BASE}/supplement-match/whey-protein/`,
    why: "Per-meal protein math, isolate vs concentrate, lactose tips.",
  },
  vitamin_b12: {
    title: "Vitamin B12 — plant-based & 50+ priority",
    url: `${BASE}/supplement-match/vitamin-b12/`,
    why: "Methylcobalamin vs cyanocobalamin and why labs matter at 50+.",
  },
  iron: {
    title: "Iron — why labs come first, always",
    url: `${BASE}/supplement-match/iron/`,
    why: "Ferritin testing before supplementing, GI tolerability, food-first.",
  },
  zinc: {
    title: "Zinc — immunity dose vs long-term safety",
    url: `${BASE}/supplement-match/zinc/`,
    why: "Acute vs chronic dosing, copper balance, and food-first wins.",
  },
  electrolytes: {
    title: "Electrolytes for heavy sweaters & endurance",
    url: `${BASE}/supplement-match/electrolytes/`,
    why: "Sodium per liter math for runners, hikers, and hot-climate training.",
  },
  ashwagandha: {
    title: "Ashwagandha — stress, cortisol & sleep",
    url: `${BASE}/supplement-match/ashwagandha/`,
    why: "KSM-66 vs Sensoril, dosing windows, and who should skip it.",
  },
  melatonin: {
    title: "Melatonin — micro-dose, not mega-dose",
    url: `${BASE}/supplement-match/melatonin/`,
    why: "Why 0.3–0.5 mg often beats 5–10 mg for sleep onset.",
  },
  collagen: {
    title: "Collagen peptides — joints, hair, skin",
    url: `${BASE}/supplement-match/collagen/`,
    why: "Type I vs type II, vitamin C synergy, what the evidence supports.",
  },
  probiotics: {
    title: "Probiotics — strain matters more than CFU count",
    url: `${BASE}/supplement-match/probiotics/`,
    why: "Why generic 'probiotic' on a label tells you almost nothing.",
  },
  multivitamin: {
    title: "Multivitamins — insurance policy or noise?",
    url: `${BASE}/supplement-match/multivitamin/`,
    why: "When a multi makes sense and when it's just expensive pee.",
  },
};

// goal → broad GUTF guide
const GOAL_LINKS: Record<Goal, Resource | undefined> = {
  energy: {
    title: "Energy without crashes — diet, sleep & supplements",
    url: `${BASE}/supplement-match/energy/`,
    why: "Steady-state energy comes from food and sleep first.",
  },
  muscle_recovery: {
    title: "Recovery stack — protein, creatine, omega-3, sleep",
    url: `${BASE}/supplement-match/recovery/`,
    why: "The four levers that move recovery for lifters and athletes.",
  },
  endurance: {
    title: "Endurance fueling — carbs, electrolytes, iron",
    url: `${BASE}/supplement-match/endurance/`,
    why: "For runners, cyclists, triathletes and hybrid athletes.",
  },
  weight_management: {
    title: "Cutting smart — protein, creatine, micronutrients",
    url: `${BASE}/supplement-match/weight-management/`,
    why: "Preserving lean mass while in a calorie deficit.",
  },
  sleep: {
    title: "Sleep stack — magnesium, glycine, behavior first",
    url: `${BASE}/supplement-match/sleep/`,
    why: "Behavior changes that beat any pill, then what's worth trying.",
  },
  general_wellness: {
    title: "Daily essentials — what almost everyone actually needs",
    url: `${BASE}/supplement-match/essentials/`,
    why: "The short list that survives the evidence filter.",
  },
  bone_health: {
    title: "Bone health — calcium, D, K2, protein, load",
    url: `${BASE}/supplement-match/bone-health/`,
    why: "Why resistance training matters more than any single nutrient.",
  },
  immune: {
    title: "Immunity — sleep, sun, zinc, vitamin D",
    url: `${BASE}/supplement-match/immunity/`,
    why: "The non-marketing version of an 'immune-boosting' stack.",
  },
  focus: {
    title: "Focus & mood — caffeine, omega-3, sleep, stress",
    url: `${BASE}/supplement-match/focus/`,
    why: "Cognitive endurance from the foundation up.",
  },
};

const ALWAYS: Resource[] = [
  {
    title: "How GearUpToFit reviews supplements",
    url: `${BASE}/methodology/`,
    why: "Our evidence framework, conflicts-of-interest policy, and review process.",
  },
  {
    title: "Browse every supplement topic guide",
    url: `${BASE}/supplement-match/topic/`,
    why: "Index of all GearUpToFit supplement deep-dives.",
  },
  {
    title: "Compare two supplements head-to-head",
    url: `${BASE}/supplement-match/compare/`,
    why: "Side-by-side guides on common 'which should I take?' questions.",
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

  // Top recommendations first
  for (const rec of result.recommendations.slice(0, 5)) {
    push(SUPPLEMENT_LINKS[rec.supplement.id]);
  }

  // Then user's primary goals
  const goals = answers?.goals ?? result.answers?.goals ?? [];
  for (const g of goals.slice(0, 3)) {
    push(GOAL_LINKS[g]);
  }

  // Always include the evergreen entry points
  for (const r of ALWAYS) push(r);

  return out.slice(0, 8);
}

export type { Resource as GearUpToFitResource };
