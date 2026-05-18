// Hand-curated Amazon product picks per supplement id.
// Each entry references a real, well-known, third-party-tested product.
// Affiliate tag is read from VITE_AMAZON_AFFILIATE_TAG; falls back to "gearuptofit-20".
// Product images are served by Amazon's affiliate image widget — stable & ASIN-keyed.

export interface AmazonProduct {
  asin: string;
  brand: string;
  title: string;
  why: string; // why this specific SKU
  badges?: string[]; // e.g. ["USP Verified", "Third-party tested"]
}

const TAG =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AMAZON_AFFILIATE_TAG) ||
  "gearuptofit-20";

export function amazonImage(asin: string, size: 250 | 160 | 500 = 250): string {
  // Amazon affiliate image widget — public, ASIN-keyed, no API key required.
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL${size}_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=${TAG}`;
}

export function amazonLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}&linkCode=ogi&th=1&psc=1`;
}

export const SUPPLEMENT_PRODUCTS: Record<string, AmazonProduct> = {
  vitamin_d: {
    asin: "B0032BH76O",
    brand: "NOW Foods",
    title: "Vitamin D-3 5,000 IU, Structural Support, Softgels (240 ct)",
    why: "D3 (cholecalciferol), GMP-tested, conservative per-cap dose so you can titrate.",
    badges: ["GMP tested", "D3 cholecalciferol"],
  },
  b12: {
    asin: "B0013OXKHC",
    brand: "Jarrow Formulas",
    title: "Methyl B-12 1,000 mcg, Sublingual Lozenges (100 ct)",
    why: "Methylcobalamin, sublingual for absorption — ideal for vegans, 50+ and metformin users.",
    badges: ["Methylcobalamin", "Sublingual"],
  },
  omega3: {
    asin: "B0011865IQ",
    brand: "Nordic Naturals",
    title: "Ultimate Omega, 1,280 mg EPA+DHA, Lemon (120 Softgels)",
    why: "High EPA+DHA per softgel; IFOS 5-star tested for purity and freshness.",
    badges: ["IFOS 5★", "High EPA+DHA"],
  },
  magnesium: {
    asin: "B000BD0RT0",
    brand: "Doctor's Best",
    title: "High Absorption Magnesium Glycinate Lysinate, 100 mg (240 Tablets)",
    why: "Chelated glycinate form — gentle on the stomach, good for evening sleep dose.",
    badges: ["Glycinate", "Non-GMO"],
  },
  creatine: {
    asin: "B002DYIZEO",
    brand: "Optimum Nutrition",
    title: "Micronized Creatine Monohydrate Powder, Unflavored (120 servings)",
    why: "Pure micronized monohydrate — the form with the strongest evidence base.",
    badges: ["Monohydrate", "Unflavored"],
  },
  protein: {
    asin: "B000QSNYGI",
    brand: "Optimum Nutrition",
    title: "Gold Standard 100% Whey Protein Powder, Double Rich Chocolate (5 lb)",
    why: "Informed Choice / Informed Sport tested; transparent amino profile.",
    badges: ["Informed Choice", "24g protein"],
  },
  iron: {
    asin: "B00DD6IGYI",
    brand: "Slow Fe",
    title: "Slow Release Iron Tablets, 45 mg (60 ct)",
    why: "Only after labs confirm low ferritin — extended-release reduces GI side effects.",
    badges: ["Extended release", "Clinician-directed"],
  },
  calcium: {
    asin: "B000GG87WA",
    brand: "Citracal",
    title: "Petites Calcium Citrate + D3, Small Easy-to-Swallow Tablets (200 ct)",
    why: "Calcium citrate — absorbed with or without food, paired with D3.",
    badges: ["Citrate form", "+ D3"],
  },
  prenatal: {
    asin: "B00B6N1QCG",
    brand: "One A Day",
    title: "Women's Prenatal 1 Multivitamin with Folic Acid, DHA & Iron (60+60 ct)",
    why: "Folic acid + DHA + iron in one — confirm dosing with your obstetric clinician.",
    badges: ["Folic acid", "DHA"],
  },
  electrolytes: {
    asin: "B07VFV4WT5",
    brand: "LMNT",
    title: "Recharge Electrolyte Drink Mix, Citrus Salt (30 sticks)",
    why: "Transparent label: 1,000 mg Na / 200 mg K / 60 mg Mg, zero sugar.",
    badges: ["No sugar", "Transparent dosing"],
  },
  fiber: {
    asin: "B003D4F0US",
    brand: "Metamucil",
    title: "Psyllium Husk Fiber Powder, Sugar-Free Orange (114 servings)",
    why: "Pure psyllium husk — the most evidence-supported soluble fiber.",
    badges: ["Psyllium", "Sugar-free"],
  },
  probiotic: {
    asin: "B0011UEXBC",
    brand: "Culturelle",
    title: "Daily Probiotic, 10 Billion CFU Lactobacillus rhamnosus GG (30 ct)",
    why: "Single, well-studied strain (LGG) with disclosed CFU — strain-specific evidence.",
    badges: ["LGG strain", "10B CFU"],
  },
  zinc: {
    asin: "B000GFSV58",
    brand: "Nature's Bounty",
    title: "Zinc 50 mg Caplets, Immune Support (250 ct)",
    why: "Short-term modest-dose use only — split tabs to stay near the daily upper limit.",
    badges: ["Modest dose", "Short-term"],
  },
  vitamin_c: {
    asin: "B0019LRY8A",
    brand: "Nature's Bounty",
    title: "Vitamin C 1,000 mg with Rose Hips (250 Caplets)",
    why: "Simple ascorbic acid + rose hips — modest daily dose to fill a produce gap.",
    badges: ["Ascorbic acid", "Rose hips"],
  },
  melatonin: {
    asin: "B005HG9ESG",
    brand: "Natrol",
    title: "Melatonin 1 mg Fast Dissolve Tablets, Strawberry (90 ct)",
    why: "Low dose (1 mg) — the dose actually supported by circadian research.",
    badges: ["Low dose 1mg", "Fast dissolve"],
  },
};

export function productFor(supplementId: string): AmazonProduct | undefined {
  return SUPPLEMENT_PRODUCTS[supplementId];
}
