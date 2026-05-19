// Hand-curated Amazon product picks per supplement id.
// Affiliate tag: papalex-20
// Product images are direct Amazon CDN image URLs verified to return real JPEGs.

import type { QuizAnswers } from "@/types/supplements";

export interface AmazonProduct {
  asin: string;
  brand: string;
  title: string;
  why: string;
  image: string;
  pill: string;
  tone: "amber" | "violet" | "teal" | "emerald" | "rose" | "sky" | "lime" | "orange";
  badges?: string[];
  fit?: "default" | "vegan" | "premium" | "budget" | "lactose_free" | "safety_first";
}

const TAG = "papalex-20";

export function amazonLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}&linkCode=ogi&th=1&psc=1`;
}

export function amazonImage(_asin: string, _size: 250 | 160 | 500 = 250): string {
  return "";
}

export const TONE_STYLES: Record<AmazonProduct["tone"], { bg: string; ring: string; text: string }> = {
  amber: { bg: "bg-gradient-to-br from-amber-400/25 via-amber-500/15 to-orange-600/10", ring: "ring-amber-400/40", text: "text-amber-200" },
  violet: { bg: "bg-gradient-to-br from-violet-400/25 via-violet-500/15 to-fuchsia-600/10", ring: "ring-violet-400/40", text: "text-violet-200" },
  teal: { bg: "bg-gradient-to-br from-teal-400/25 via-cyan-500/15 to-blue-600/10", ring: "ring-teal-400/40", text: "text-teal-200" },
  emerald: { bg: "bg-gradient-to-br from-emerald-400/25 via-emerald-500/15 to-green-600/10", ring: "ring-emerald-400/40", text: "text-emerald-200" },
  rose: { bg: "bg-gradient-to-br from-rose-400/25 via-pink-500/15 to-red-600/10", ring: "ring-rose-400/40", text: "text-rose-200" },
  sky: { bg: "bg-gradient-to-br from-sky-400/25 via-blue-500/15 to-indigo-600/10", ring: "ring-sky-400/40", text: "text-sky-200" },
  lime: { bg: "bg-gradient-to-br from-lime-400/25 via-green-500/15 to-emerald-600/10", ring: "ring-lime-400/40", text: "text-lime-200" },
  orange: { bg: "bg-gradient-to-br from-orange-400/25 via-red-500/15 to-rose-600/10", ring: "ring-orange-400/40", text: "text-orange-200" },
};

export const SUPPLEMENT_PRODUCTS: Record<string, AmazonProduct[]> = {
  vitamin_d: [
    {
      asin: "B0032BH76O",
      image: "https://m.media-amazon.com/images/I/410KX6Ll6CL._SL500_.jpg",
      brand: "NOW Foods",
      title: "Vitamin D-3 5,000 IU Softgels (240 ct)",
      pill: "Vitamin D3",
      tone: "amber",
      fit: "default",
      why: "D3 (cholecalciferol), GMP-tested, conservative per-cap dose so you can titrate with labs.",
      badges: ["GMP tested", "D3 cholecalciferol"],
    },
    {
      asin: "B07255MPRN",
      image: "https://m.media-amazon.com/images/I/61uhxiVJqCL._SL500_.jpg",
      brand: "Sports Research",
      title: "Vegan Vitamin D3 + K2, 5,000 IU D3 + MK-7 K2 (60 ct)",
      pill: "Vegan D3 + K2",
      tone: "amber",
      fit: "vegan",
      why: "Lichen-sourced vegan D3 with MK-7 K2 — best fit for vegan or gelatin-free profiles when blood thinners are not selected.",
      badges: ["Vegan certified", "Lichen D3", "Non-GMO"],
    },
  ],
  b12: [
    {
      asin: "B0013OXKHC",
      image: "https://m.media-amazon.com/images/I/41aqsT4ImyL._SL500_.jpg",
      brand: "Jarrow Formulas",
      title: "Methyl B-12 1,000 mcg Sublingual Lozenges (100 ct)",
      pill: "Methyl B-12",
      tone: "rose",
      fit: "default",
      why: "Methylcobalamin, sublingual for absorption — ideal for vegans, adults 50+, and metformin-risk profiles.",
      badges: ["Methylcobalamin", "Sublingual"],
    },
  ],
  omega3: [
    {
      asin: "B0011865IQ",
      image: "https://m.media-amazon.com/images/I/41+agLMJlEL._SL500_.jpg",
      brand: "Nordic Naturals",
      title: "Ultimate Omega 1,280 mg EPA+DHA, Lemon (120 Softgels)",
      pill: "Omega-3 EPA+DHA",
      tone: "teal",
      fit: "default",
      why: "High EPA+DHA per serving; third-party tested for purity and freshness.",
      badges: ["High EPA+DHA", "Purity tested"],
    },
    {
      asin: "B0096M62O6",
      image: "https://m.media-amazon.com/images/I/61MV+5ZTheL._SL500_.jpg",
      brand: "Nordic Naturals",
      title: "Algae Omega — Certified Vegan Plant-Based EPA & DHA (60 Softgels)",
      pill: "Algae EPA+DHA",
      tone: "teal",
      fit: "vegan",
      why: "Plant-based EPA+DHA from algae — the precise swap when vegan, vegetarian, or fish-free preferences are selected.",
      badges: ["Certified vegan", "EPA + DHA", "Fish-free"],
    },
  ],
  magnesium: [
    {
      asin: "B000BD0RT0",
      image: "https://m.media-amazon.com/images/I/41qGJ-V5QrL._SL500_.jpg",
      brand: "Doctor's Best",
      title: "High-Absorption Magnesium Glycinate 100 mg (240 Tabs)",
      pill: "Magnesium Glycinate",
      tone: "violet",
      fit: "default",
      why: "Chelated glycinate form — gentle on the stomach and appropriate for evening sleep-focused dosing.",
      badges: ["Glycinate", "Non-GMO"],
    },
  ],
  creatine: [
    {
      asin: "B002DYIZEO",
      image: "https://m.media-amazon.com/images/I/41xVHHY2WuL._SL500_.jpg",
      brand: "Optimum Nutrition",
      title: "Micronized Creatine Monohydrate Powder (120 servings)",
      pill: "Creatine Monohydrate",
      tone: "sky",
      fit: "default",
      why: "Pure micronized monohydrate — the form with the strongest evidence base and best value.",
      badges: ["Monohydrate", "Unflavored"],
    },
    {
      asin: "B07978VPPH",
      image: "https://m.media-amazon.com/images/I/71-lmdLaYmL._SL500_.jpg",
      brand: "Thorne",
      title: "Creatine Monohydrate Powder, NSF Certified for Sport (90 servings)",
      pill: "NSF Creatine",
      tone: "sky",
      fit: "premium",
      why: "Premium NSF Certified for Sport option for athletes who selected third-party-tested-only or premium budget.",
      badges: ["NSF Certified", "Monohydrate", "Athlete-grade"],
    },
  ],
  protein: [
    {
      asin: "B000QSNYGI",
      image: "https://m.media-amazon.com/images/I/41Yv+JFOarL._SL500_.jpg",
      brand: "Optimum Nutrition",
      title: "Gold Standard 100% Whey, Double Rich Chocolate (5 lb)",
      pill: "Whey Protein 24g",
      tone: "orange",
      fit: "default",
      why: "Informed Choice / Informed Sport tested; transparent amino profile and reliable protein density.",
      badges: ["Informed Choice", "24g protein"],
    },
    {
      asin: "B00J074W7Q",
      image: "https://m.media-amazon.com/images/I/7191gyxaAQL._SL500_.jpg",
      brand: "Orgain",
      title: "Organic Vegan Protein Powder, Vanilla Bean, 21g Plant Protein (2.03 lb)",
      pill: "Vegan Protein 21g",
      tone: "emerald",
      fit: "lactose_free",
      why: "More precise for vegan, vegetarian, lactose-free, or dairy-sensitive users — plant protein plus prebiotic fiber.",
      badges: ["Vegan", "Lactose-free", "21g protein"],
    },
  ],
  iron: [
    {
      asin: "B00ZQUDWL8",
      image: "https://m.media-amazon.com/images/I/41qacrMnumL._SL500_.jpg",
      brand: "Slow Fe",
      title: "Slow Release Iron 45 mg (60 ct)",
      pill: "Iron 45 mg",
      tone: "rose",
      fit: "safety_first",
      why: "Only after labs confirm low ferritin — extended release can reduce GI side effects.",
      badges: ["Extended release", "Clinician-directed"],
    },
  ],
  calcium: [
    {
      asin: "B07RCJY6WD",
      image: "https://m.media-amazon.com/images/I/410CTkvQr-L._SL500_.jpg",
      brand: "Citracal",
      title: "Petites Calcium Citrate + D3 (375 ct)",
      pill: "Calcium + D3",
      tone: "sky",
      fit: "default",
      why: "Calcium citrate — absorbed with or without food, paired with D3, best used to fill a measured dietary gap.",
      badges: ["Citrate form", "+ D3"],
    },
  ],
  prenatal: [
    {
      asin: "B01E4BE5U6",
      image: "https://m.media-amazon.com/images/I/318hkW+ZqeL._SL500_.jpg",
      brand: "One A Day",
      title: "Women's Prenatal — Folic Acid + Iron + DHA (90 ct)",
      pill: "Prenatal + DHA",
      tone: "rose",
      fit: "default",
      why: "Folic acid + DHA + iron in one — confirm dosing with your obstetric clinician.",
      badges: ["Folic acid", "DHA + Iron"],
    },
  ],
  electrolytes: [
    {
      asin: "B019GU4ILQ",
      image: "https://m.media-amazon.com/images/I/51UjfsQEh3L._SL500_.jpg",
      brand: "Nuun",
      title: "Sport Electrolyte Tablets — Mg / Ca / K / Cl / Na (40 servings)",
      pill: "Electrolytes",
      tone: "lime",
      fit: "default",
      why: "Full electrolyte profile with sodium + potassium + magnesium — practical for sweat-heavy sessions.",
      badges: ["No sugar", "Vegan", "Gluten-free"],
    },
  ],
  fiber: [
    {
      asin: "B0013I4WJS",
      image: "https://m.media-amazon.com/images/I/41ZReKGyIPL._SL500_.jpg",
      brand: "Metamucil",
      title: "Psyllium Husk Powder, Unflavored (114 doses)",
      pill: "Psyllium Fiber",
      tone: "emerald",
      fit: "default",
      why: "Psyllium husk — the most evidence-supported soluble fiber option for filling a real fiber gap.",
      badges: ["Psyllium", "Unflavored"],
    },
  ],
  probiotic: [
    {
      asin: "B07K98GCXM",
      image: "https://m.media-amazon.com/images/I/51JFgKjR-RL._SL500_.jpg",
      brand: "Align",
      title: "Probiotic Extra Strength — B. infantis 35624 (42 ct)",
      pill: "Probiotic 35624",
      tone: "violet",
      fit: "default",
      why: "Gastro-recommended strain with disclosed CFU — more credible than generic multi-strain blends.",
      badges: ["Single strain", "5× CFU"],
    },
  ],
  zinc: [
    {
      asin: "B0019LVAZ8",
      image: "https://m.media-amazon.com/images/I/31QL8wwKHjL._SL500_.jpg",
      brand: "Nature Made",
      title: "Zinc 30 mg Tablets — Immune Support (100 ct)",
      pill: "Zinc 30 mg",
      tone: "amber",
      fit: "default",
      why: "Short-term modest-dose use only — stay near the daily upper limit and avoid chronic stacking.",
      badges: ["USP Verified", "30 mg"],
    },
  ],
  vitamin_c: [
    {
      asin: "B0019LRY8A",
      image: "https://m.media-amazon.com/images/I/31EdsgwlavL._SL500_.jpg",
      brand: "Nature's Bounty",
      title: "Vitamin C 1,000 mg with Rose Hips (250 Caplets)",
      pill: "Vitamin C 1000",
      tone: "orange",
      fit: "default",
      why: "Simple ascorbic acid + rose hips — modest daily backup when produce intake is low.",
      badges: ["Ascorbic acid", "Rose hips"],
    },
  ],
  melatonin: [
    {
      asin: "B00C3Q5JVE",
      image: "https://m.media-amazon.com/images/I/411RXPpyA5L._SL500_.jpg",
      brand: "Natrol",
      title: "Melatonin 1 mg Fast-Dissolve, Strawberry (90 ct)",
      pill: "Melatonin 1 mg",
      tone: "violet",
      fit: "default",
      why: "Low dose (1 mg) — aligned with circadian research and safer than high-dose sleep gummies.",
      badges: ["Low dose 1mg", "Fast dissolve"],
    },
  ],
};

export function productsFor(supplementId: string): AmazonProduct[] {
  return SUPPLEMENT_PRODUCTS[supplementId] ?? [];
}

export function productFor(supplementId: string, answers?: QuizAnswers): AmazonProduct | undefined {
  const products = productsFor(supplementId);
  if (products.length === 0) return undefined;
  if (!answers) return products[0];

  const wantsVegan = answers.diet === "vegan" || answers.diet === "vegetarian" || answers.allergies.vegan;
  const wantsDairyFree = wantsVegan || answers.allergies.lactoseFree;
  const wantsPremium = answers.budget === "premium" || answers.allergies.thirdPartyTestedOnly;

  if (supplementId === "vitamin_d" && wantsVegan && !answers.medical.bloodThinners) {
    return products.find((p) => p.fit === "vegan") ?? products[0];
  }

  if (supplementId === "omega3" && wantsVegan) {
    return products.find((p) => p.fit === "vegan") ?? products[0];
  }

  if (supplementId === "protein" && wantsDairyFree) {
    return products.find((p) => p.fit === "lactose_free") ?? products[0];
  }

  if (supplementId === "creatine" && wantsPremium) {
    return products.find((p) => p.fit === "premium") ?? products[0];
  }

  return products[0];
}
