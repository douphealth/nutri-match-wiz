// Hand-curated Amazon product picks per supplement id.
// Affiliate tag: papalex-20
//
// IMPORTANT: Amazon's public `/images/P/{ASIN}.01.L.jpg` endpoint reliably
// returns product images only for books. For everything else (vitamins,
// powders, capsules) it returns a 1x1 transparent placeholder — which is
// why earlier versions showed empty product tiles. The Product Advertising
// API requires server-side auth we cannot use here.
//
// Instead we render a designed, branded product tile per supplement using
// a `tone` (CSS gradient palette key) and short pill copy. It looks
// premium and is 100% reliable across every product.

export interface AmazonProduct {
  asin: string;
  brand: string;
  title: string;
  why: string;
  image: string; // real Amazon CDN product image URL
  pill: string; // short label rendered prominently on the tile
  tone: "amber" | "violet" | "teal" | "emerald" | "rose" | "sky" | "lime" | "orange";
  badges?: string[];
}

const TAG = "papalex-20";

export function amazonLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}&linkCode=ogi&th=1&psc=1`;
}

// Kept for API stability — some callers still import it. Returns empty so
// callers fall back to the branded tile (recommended).
export function amazonImage(_asin: string, _size: 250 | 160 | 500 = 250): string {
  return "";
}

export const TONE_STYLES: Record<AmazonProduct["tone"], { bg: string; ring: string; text: string }> = {
  amber:   { bg: "bg-gradient-to-br from-amber-400/25 via-amber-500/15 to-orange-600/10",  ring: "ring-amber-400/40",  text: "text-amber-200" },
  violet:  { bg: "bg-gradient-to-br from-violet-400/25 via-violet-500/15 to-fuchsia-600/10", ring: "ring-violet-400/40", text: "text-violet-200" },
  teal:    { bg: "bg-gradient-to-br from-teal-400/25 via-cyan-500/15 to-blue-600/10",      ring: "ring-teal-400/40",   text: "text-teal-200" },
  emerald: { bg: "bg-gradient-to-br from-emerald-400/25 via-emerald-500/15 to-green-600/10", ring: "ring-emerald-400/40", text: "text-emerald-200" },
  rose:    { bg: "bg-gradient-to-br from-rose-400/25 via-pink-500/15 to-red-600/10",       ring: "ring-rose-400/40",   text: "text-rose-200" },
  sky:     { bg: "bg-gradient-to-br from-sky-400/25 via-blue-500/15 to-indigo-600/10",     ring: "ring-sky-400/40",    text: "text-sky-200" },
  lime:    { bg: "bg-gradient-to-br from-lime-400/25 via-green-500/15 to-emerald-600/10",  ring: "ring-lime-400/40",   text: "text-lime-200" },
  orange:  { bg: "bg-gradient-to-br from-orange-400/25 via-red-500/15 to-rose-600/10",     ring: "ring-orange-400/40", text: "text-orange-200" },
};

export const SUPPLEMENT_PRODUCTS: Record<string, AmazonProduct> = {
  vitamin_d: {
    asin: "B0032BH76O",
    brand: "NOW Foods",
    title: "Vitamin D-3 5,000 IU Softgels (240 ct)",
    pill: "Vitamin D3",
    tone: "amber",
    why: "D3 (cholecalciferol), GMP-tested, conservative per-cap dose so you can titrate.",
    badges: ["GMP tested", "D3 cholecalciferol"],
  },
  b12: {
    asin: "B0013OXKHC",
    brand: "Jarrow Formulas",
    title: "Methyl B-12 1,000 mcg Sublingual Lozenges (100 ct)",
    pill: "Methyl B-12",
    tone: "rose",
    why: "Methylcobalamin, sublingual for absorption — ideal for vegans, 50+ and metformin users.",
    badges: ["Methylcobalamin", "Sublingual"],
  },
  omega3: {
    asin: "B0011865IQ",
    brand: "Nordic Naturals",
    title: "Ultimate Omega 1,280 mg EPA+DHA, Lemon (120 Softgels)",
    pill: "Omega-3 EPA+DHA",
    tone: "teal",
    why: "High EPA+DHA per softgel; IFOS 5-star tested for purity and freshness.",
    badges: ["IFOS 5★", "High EPA+DHA"],
  },
  magnesium: {
    asin: "B000BD0RT0",
    brand: "Doctor's Best",
    title: "High-Absorption Magnesium Glycinate 100 mg (240 Tabs)",
    pill: "Magnesium Glycinate",
    tone: "violet",
    why: "Chelated glycinate form — gentle on the stomach, good for evening sleep dose.",
    badges: ["Glycinate", "Non-GMO"],
  },
  creatine: {
    asin: "B002DYIZEO",
    brand: "Optimum Nutrition",
    title: "Micronized Creatine Monohydrate Powder (120 servings)",
    pill: "Creatine Monohydrate",
    tone: "sky",
    why: "Pure micronized monohydrate — the form with the strongest evidence base.",
    badges: ["Monohydrate", "Unflavored"],
  },
  protein: {
    asin: "B000QSNYGI",
    brand: "Optimum Nutrition",
    title: "Gold Standard 100% Whey, Double Rich Chocolate (5 lb)",
    pill: "Whey Protein 24g",
    tone: "orange",
    why: "Informed Choice / Informed Sport tested; transparent amino profile.",
    badges: ["Informed Choice", "24g protein"],
  },
  iron: {
    asin: "B00ZQUDWL8",
    brand: "Slow Fe",
    title: "Slow Release Iron 45 mg (60 ct)",
    pill: "Iron 45 mg",
    tone: "rose",
    why: "Only after labs confirm low ferritin — extended-release reduces GI side effects.",
    badges: ["Extended release", "Clinician-directed"],
  },
  calcium: {
    asin: "B07RCJY6WD",
    brand: "Citracal",
    title: "Petites Calcium Citrate + D3 (375 ct)",
    pill: "Calcium + D3",
    tone: "sky",
    why: "Calcium citrate — absorbed with or without food, paired with D3.",
    badges: ["Citrate form", "+ D3"],
  },
  prenatal: {
    asin: "B01E4BE5U6",
    brand: "One A Day",
    title: "Women's Prenatal — Folic Acid + Iron + DHA (90 ct)",
    pill: "Prenatal + DHA",
    tone: "rose",
    why: "Folic acid + DHA + iron in one — confirm dosing with your obstetric clinician.",
    badges: ["Folic acid", "DHA + Iron"],
  },
  electrolytes: {
    asin: "B019GU4ILQ",
    brand: "Nuun",
    title: "Sport Electrolyte Tablets — Mg / Ca / K / Cl / Na (40 servings)",
    pill: "Electrolytes",
    tone: "lime",
    why: "Full electrolyte profile with sodium + potassium + magnesium — no sugar.",
    badges: ["No sugar", "Vegan · Gluten-free"],
  },
  fiber: {
    asin: "B0013I4WJS",
    brand: "Metamucil",
    title: "Psyllium Husk Powder, Unflavored (114 doses)",
    pill: "Psyllium Fiber",
    tone: "emerald",
    why: "Pure psyllium husk — the most evidence-supported soluble fiber.",
    badges: ["Psyllium", "Unflavored"],
  },
  probiotic: {
    asin: "B07K98GCXM",
    brand: "Align",
    title: "Probiotic Extra Strength — B. infantis 35624 (42 ct)",
    pill: "Probiotic 35624",
    tone: "violet",
    why: "Gastro-recommended strain (B. infantis 35624) with disclosed CFU — strain-specific evidence.",
    badges: ["Single strain", "5× CFU"],
  },
  zinc: {
    asin: "B0019LVAZ8",
    brand: "Nature Made",
    title: "Zinc 30 mg Tablets — Immune Support (100 ct)",
    pill: "Zinc 30 mg",
    tone: "amber",
    why: "Short-term modest-dose use only — stay near the daily upper limit.",
    badges: ["USP Verified", "30 mg"],
  },
  vitamin_c: {
    asin: "B0019LRY8A",
    brand: "Nature's Bounty",
    title: "Vitamin C 1,000 mg with Rose Hips (250 Caplets)",
    pill: "Vitamin C 1000",
    tone: "orange",
    why: "Simple ascorbic acid + rose hips — modest daily dose to fill a produce gap.",
    badges: ["Ascorbic acid", "Rose hips"],
  },
  melatonin: {
    asin: "B00C3Q5JVE",
    brand: "Natrol",
    title: "Melatonin 1 mg Fast-Dissolve, Strawberry (90 ct)",
    pill: "Melatonin 1 mg",
    tone: "violet",
    why: "Low dose (1 mg) — the dose actually supported by circadian research.",
    badges: ["Low dose 1mg", "Fast dissolve"],
  },
};

export function productFor(supplementId: string): AmazonProduct | undefined {
  return SUPPLEMENT_PRODUCTS[supplementId];
}
