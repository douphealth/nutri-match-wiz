// Hand-curated Amazon product picks per supplement id.
// Every ASIN has been verified to return a real product image from Amazon's
// stable image CDN at https://m.media-amazon.com/images/P/{ASIN}.01.L.jpg
// (the public, no-auth Amazon product image endpoint).
// Affiliate tag is read from VITE_AMAZON_AFFILIATE_TAG; falls back to "gearuptofit-20".

export interface AmazonProduct {
  asin: string;
  brand: string;
  title: string;
  why: string;
  badges?: string[];
}

const TAG =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AMAZON_AFFILIATE_TAG) ||
  "gearuptofit-20";

/**
 * Returns Amazon's stable, public product-image URL for an ASIN.
 * This `images/P/{ASIN}.01.L.jpg` endpoint is the canonical CDN path
 * Amazon serves to its own product pages — high resolution, no auth.
 */
export function amazonImage(asin: string, _size: 250 | 160 | 500 = 250): string {
  return `https://m.media-amazon.com/images/P/${asin}.01.L.jpg`;
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
    title: "Gold Standard 100% Whey Protein, Double Rich Chocolate (5 lb)",
    why: "Informed Choice / Informed Sport tested; transparent amino profile.",
    badges: ["Informed Choice", "24g protein"],
  },
  iron: {
    asin: "B00ZQUDWL8",
    brand: "Slow Fe",
    title: "Slow Release Iron Tablets, 45 mg (60 ct)",
    why: "Only after labs confirm low ferritin — extended-release reduces GI side effects.",
    badges: ["Extended release", "Clinician-directed"],
  },
  calcium: {
    asin: "B07RCJY6WD",
    brand: "Citracal",
    title: "Petites Calcium Citrate + D3, Easy-to-Swallow Caplets (375 ct)",
    why: "Calcium citrate — absorbed with or without food, paired with D3.",
    badges: ["Citrate form", "+ D3"],
  },
  prenatal: {
    asin: "B01E4BE5U6",
    brand: "One A Day",
    title: "Women's Prenatal Multivitamin — Folic Acid, Iron, DHA (90 ct)",
    why: "Folic acid + DHA + iron in one — confirm dosing with your obstetric clinician.",
    badges: ["Folic acid", "DHA + Iron"],
  },
  electrolytes: {
    asin: "B019GU4ILQ",
    brand: "Nuun",
    title: "Sport Electrolyte Tablets — Mg, Ca, K, Cl, Na (4-Pack, 40 servings)",
    why: "Full electrolyte profile with sodium + potassium + magnesium — no sugar.",
    badges: ["No sugar", "Vegan · Gluten-free"],
  },
  fiber: {
    asin: "B0013I4WJS",
    brand: "Metamucil",
    title: "Psyllium Husk Powder, Unflavored Original Texture (114 doses)",
    why: "Pure psyllium husk — the most evidence-supported soluble fiber.",
    badges: ["Psyllium", "Unflavored"],
  },
  probiotic: {
    asin: "B07K98GCXM",
    brand: "Align",
    title: "Probiotic Extra Strength, B. infantis 35624 (42 Capsules)",
    why: "Gastro-recommended strain (B. infantis 35624) with disclosed CFU — strain-specific evidence.",
    badges: ["Single strain", "5× CFU"],
  },
  zinc: {
    asin: "B0019LVAZ8",
    brand: "Nature Made",
    title: "Zinc 30 mg Tablets, Immune Support (100 ct)",
    why: "Short-term modest-dose use only — stay near the daily upper limit.",
    badges: ["USP Verified", "30 mg"],
  },
  vitamin_c: {
    asin: "B0019LRY8A",
    brand: "Nature's Bounty",
    title: "Vitamin C 1,000 mg with Rose Hips (250 Caplets)",
    why: "Simple ascorbic acid + rose hips — modest daily dose to fill a produce gap.",
    badges: ["Ascorbic acid", "Rose hips"],
  },
  melatonin: {
    asin: "B00C3Q5JVE",
    brand: "Natrol",
    title: "Melatonin 1 mg Fast Dissolve Tablets, Strawberry (90 ct)",
    why: "Low dose (1 mg) — the dose actually supported by circadian research.",
    badges: ["Low dose 1mg", "Fast dissolve"],
  },
};

export function productFor(supplementId: string): AmazonProduct | undefined {
  return SUPPLEMENT_PRODUCTS[supplementId];
}
