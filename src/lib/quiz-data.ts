// Quiz step definitions for the Supplement Match wizard, plus helpers for
// turning a completed answer set into a shareable slug + URL-safe payload.
//
// The QuizAnswers shape itself lives in "@/types/supplements" and powers
// the deterministic scoring engine in `recommendation-engine.ts`.

import type { QuizAnswers, Frequency, Goal, QuizMode } from "@/types/supplements";
import { DEFAULT_ANSWERS } from "./engine";

export { DEFAULT_ANSWERS as defaultAnswers };
export type { QuizAnswers, QuizMode };

type AnswerPath = string; // dot-path like "foodIntake.oilyFish" or "medical.bloodThinners"

export type StepType =
  | "single" // pick one — auto-advances
  | "multi" // pick many
  | "boolean-multi" // multiple booleans on a nested object (e.g. medical flags)
  | "slider-freq"; // frequency slider (never -> daily)

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

export interface BooleanOption {
  path: AnswerPath;
  label: string;
  description?: string;
}

export interface QuizStep {
  id: string;
  path: AnswerPath; // top-level answer key for single/multi/slider; ignored for boolean-multi
  title: string;
  subtitle?: string;
  type: StepType;
  options?: ChoiceOption[];
  booleans?: BooleanOption[]; // for boolean-multi
  helper?: string;
  image?: string; // optional editorial image rendered in the step header
  imageAlt?: string;
  /**
   * Adaptive branching predicate. When provided and returning false, the
   * step is skipped. Safety-screen questions never define `showWhen`, so
   * they are always shown. Default = always show.
   */
  showWhen?: (a: QuizAnswers) => boolean;
  /**
   * Adaptive quiz tier:
   *  - "essential": always shown in both Fast and Advanced modes
   *  - "branch":    shown when `showWhen` matches (both modes)
   *  - "advanced":  only shown in Advanced mode (still respects `showWhen`)
   * Defaults to "essential".
   */
  tier?: "essential" | "branch" | "advanced";
  /** Safety-critical question — Fast mode and Skip controls must never hide it. */
  safety?: boolean;
  /** Plain-language rationale rendered behind a "Why we ask this" affordance. */
  why?: string;
}

// Curated, stable Unsplash photos. Tuned crop/quality params keep payload
// small and the visual register premium / editorial.
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const FREQUENCY_OPTIONS: ChoiceOption[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "weekly", label: "Weekly" },
  { value: "often", label: "Often" },
  { value: "daily", label: "Daily" },
];

export const quizSteps: QuizStep[] = [
  {
    id: "ageRange",
    path: "ageRange",
    title: "Your age range",
    subtitle: "Helps us screen for life-stage-specific risks.",
    type: "single",
    tier: "essential",
    safety: true,
    why: "Under-18 and 60+ flows trigger different safety gates and dosing notes (e.g. creatine, melatonin, vitamin D).",
    image: U("1521146764736-56c929d59c83"),
    imageAlt: "People of different ages running together at sunset",
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_29", label: "18 – 29" },
      { value: "30_44", label: "30 – 44" },
      { value: "45_59", label: "45 – 59" },
      { value: "60_plus", label: "60 +" },
    ],
  },
  {
    id: "sex",
    path: "sex",
    title: "Sex assigned at birth",
    subtitle: "Influences iron, folate, and other recommendations.",
    type: "single",
    tier: "essential",
    safety: true,
    why: "Iron, folate, and pregnancy screens depend on biological sex.",
    image: U("1573496359142-b8d87734a5a2"),
    imageAlt: "Diverse group of adults standing together",
    options: [
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
      { value: "intersex", label: "Intersex" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
  {
    showWhen: (a) =>
      a.sex === "female" &&
      (a.ageRange === "18_29" || a.ageRange === "30_44" || a.ageRange === "45_59"),
    id: "pregnancy",
    path: "pregnancy",
    title: "Pregnancy status",
    subtitle: "Many supplements are inappropriate during pregnancy or breastfeeding.",
    type: "single",
    tier: "branch",
    safety: true,
    why: "Pregnancy and breastfeeding contraindicate several common supplements (e.g. high-dose vitamin A, melatonin, many adaptogens).",
    image: U("1519791883288-dc8bd696e667"),
    imageAlt: "Soft natural light portrait, prenatal wellness",
    options: [
      { value: "none", label: "Not applicable" },
      { value: "trying", label: "Trying to conceive" },
      { value: "pregnant", label: "Pregnant" },
      { value: "breastfeeding", label: "Breastfeeding" },
    ],
  },
  {
    id: "diet",
    path: "diet",
    title: "How would you describe your diet?",
    type: "single",
    tier: "essential",
    why: "Vegan/vegetarian patterns shift B12, iron, omega-3, and zinc risk.",
    image: U("1490645935967-10de6ba17061"),
    imageAlt: "Colorful nourish bowls of whole foods",
    options: [
      { value: "omnivore", label: "Omnivore" },
      { value: "pescatarian", label: "Pescatarian" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "low_carb", label: "Low-carb / keto" },
      { value: "calorie_deficit", label: "Calorie deficit" },
      { value: "restricted", label: "Medically restricted" },
    ],
  },
  {
    id: "goals",
    path: "goals",
    title: "What are your top goals?",
    subtitle: "Pick up to four — we score with all of them.",
    type: "multi",
    tier: "essential",
    why: "Goals drive the scoring weights; without them we default to general wellness.",
    image: U("1517836357463-d25dfeac3438"),
    imageAlt: "Athlete training, focused on performance goals",
    options: [
      { value: "energy", label: "More energy" },
      { value: "muscle_recovery", label: "Muscle & recovery" },
      { value: "endurance", label: "Endurance" },
      { value: "weight_management", label: "Weight management" },
      { value: "sleep", label: "Better sleep" },
      { value: "general_wellness", label: "General wellness" },
      { value: "bone_health", label: "Bone health" },
      { value: "immune", label: "Immune support" },
      { value: "focus", label: "Focus & mood" },
    ],
  },
  {
    id: "trainingFrequency",
    path: "trainingFrequency",
    title: "How often do you train?",
    type: "single",
    tier: "essential",
    why: "Training volume changes protein, creatine, and electrolyte priorities.",
    image: U("1534438327276-14e5300c3a48"),
    imageAlt: "Strength training in a modern gym",
    options: [
      { value: "none", label: "Not currently" },
      { value: "1_2", label: "1 – 2 ×/week" },
      { value: "3_4", label: "3 – 4 ×/week" },
      { value: "5_plus", label: "5 +/week" },
    ],
  },
  {
    id: "sunExposure",
    path: "sunExposure",
    title: "Typical daily sun exposure",
    type: "single",
    tier: "essential",
    why: "Low sun + indoor lifestyle is the strongest driver of vitamin D deficiency risk.",
    image: U("1506905925346-21bda4d32df4"),
    imageAlt: "Warm sunlight over an outdoor landscape",
    options: [
      { value: "low", label: "Low (mostly indoors)" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "High (outdoors most days)" },
    ],
  },
  {
    id: "sleepQuality",
    path: "sleepQuality",
    title: "How is your sleep, honestly?",
    type: "single",
    tier: "essential",
    why: "Sleep quality gates magnesium, glycine, and melatonin recommendations.",
    image: U("1520206183501-b80df61043c2"),
    imageAlt: "Calm bedroom with soft linen, restful sleep",
    options: [
      { value: "poor", label: "Poor" },
      { value: "fair", label: "Fair" },
      { value: "good", label: "Good" },
    ],
  },
  {
    showWhen: (a) =>
      a.goals.includes("sleep") ||
      a.goals.includes("focus") ||
      a.goals.includes("general_wellness") ||
      a.goals.includes("energy"),
    id: "stress",
    path: "stress",
    title: "Average stress level",
    type: "single",
    tier: "branch",
    why: "High stress + sleep/focus goals raise the priority of adaptogens and magnesium glycinate.",
    image: U("1499209974431-9dddcece7f88"),
    imageAlt: "Person meditating, mindful breathing",
    options: [
      { value: "low", label: "Low" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "High" },
    ],
  },
  {
    showWhen: (a) =>
      a.ageRange !== "under_18" && a.pregnancy !== "pregnant" && a.pregnancy !== "breastfeeding",
    id: "alcohol",
    path: "alcohol",
    title: "Alcohol intake",
    type: "slider-freq",
    tier: "advanced",
    image: U("1514362545857-3bc16c4c7d1b"),
    imageAlt: "Glass of wine on a wooden table",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) =>
      a.goals.includes("sleep") ||
      a.goals.includes("focus") ||
      a.goals.includes("energy") ||
      a.sleepQuality !== "good",
    id: "caffeine",
    path: "caffeine",
    title: "Caffeine intake",
    type: "slider-freq",
    tier: "branch",
    why: "Daily caffeine, especially after 2pm, suppresses deep sleep and changes magnesium / theanine guidance.",
    image: U("1495474472287-4d71bcdd2085"),
    imageAlt: "Pour-over coffee, morning ritual",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) => a.diet !== "vegan",
    id: "oilyFish",
    path: "foodIntake.oilyFish",
    title: "Oily fish (salmon, sardines, mackerel)",
    type: "slider-freq",
    tier: "branch",
    why: "Oily fish ≥2×/wk usually covers EPA/DHA needs without an omega-3 capsule.",
    image: U("1467003909585-2f8a72700288"),
    imageAlt: "Fresh salmon fillet, omega-3 source",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) => a.diet !== "vegan",
    id: "dairy",
    path: "foodIntake.dairy",
    title: "Dairy",
    type: "slider-freq",
    tier: "advanced",
    image: U("1550583724-b2692b85b150"),
    imageAlt: "Glass of milk and fresh dairy",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "fruitsVeg",
    path: "foodIntake.fruitsVeg",
    title: "Fruits & vegetables",
    type: "slider-freq",
    tier: "branch",
    why: "Sets the whole-food foundation score — most other supplement scoring builds on top of it.",
    image: U("1610348725531-843dff563e2c"),
    imageAlt: "Vibrant assortment of fruits and vegetables",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) =>
      a.diet === "vegan" ||
      a.diet === "vegetarian" ||
      a.goals.includes("weight_management") ||
      a.goals.includes("general_wellness"),
    id: "legumes",
    path: "foodIntake.legumes",
    title: "Legumes (beans, lentils, chickpeas)",
    type: "slider-freq",
    tier: "advanced",
    image: U("1515543904379-3d757afe72e4"),
    imageAlt: "Assorted dried beans and lentils",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) =>
      a.goals.includes("weight_management") ||
      a.goals.includes("general_wellness") ||
      a.goals.includes("energy"),
    id: "wholeGrains",
    path: "foodIntake.wholeGrains",
    title: "Whole grains",
    type: "slider-freq",
    tier: "advanced",
    image: U("1509440159596-0249088772ff"),
    imageAlt: "Whole grain bread and oats",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) =>
      a.diet === "omnivore" ||
      a.diet === "pescatarian" ||
      a.diet === "low_carb" ||
      a.diet === "restricted",
    id: "redMeat",
    path: "foodIntake.redMeat",
    title: "Red meat",
    type: "slider-freq",
    tier: "advanced",
    image: U("1558030006-450675393462"),
    imageAlt: "Cut of red meat on a board",
    options: FREQUENCY_OPTIONS,
  },
  {
    showWhen: (a) => a.diet === "vegan" || a.diet === "vegetarian",
    id: "fortifiedFoods",
    path: "foodIntake.fortifiedFoods",
    title: "Fortified foods (plant milks, cereals)",
    type: "slider-freq",
    tier: "branch",
    why: "Fortified foods are the easiest non-supplement source of B12, iodine, and (sometimes) D for plant-based diets.",
    image: U("1559656914-a30970c1affd"),
    imageAlt: "Bowl of fortified breakfast cereal",
    options: FREQUENCY_OPTIONS,
  },

  // ---------------------------------------------------------------------
  // Branch: plant-based deeper dive (B12 / iron / omega-3 history)
  // ---------------------------------------------------------------------
  {
    showWhen: (a) => a.diet === "vegan" || a.diet === "vegetarian",
    id: "plantBasedLabs",
    path: "fatigueLabs",
    title: "Plant-based labs & supplements",
    subtitle: "Helps us avoid recommending things you already cover.",
    type: "boolean-multi",
    tier: "branch",
    why: "Vegans & vegetarians often need B12, iron/ferritin, and algal omega-3 — but only when current intake or labs say so.",
    image: U("1471864190281-a93a3070b6de"),
    imageAlt: "Lab sample tubes and notes on a clean surface",
    booleans: [
      { path: "fatigueLabs.b12TestedLow", label: "I've had a low B12 result before" },
      { path: "fatigueLabs.ironTestedLow", label: "I've had low iron / ferritin before" },
      { path: "fatigueLabs.vitDTestedLow", label: "I've had a low vitamin D result before" },
    ],
    helper: "None apply? Skip and continue.",
  },

  // ---------------------------------------------------------------------
  // Branch: endurance / runners
  // ---------------------------------------------------------------------
  {
    showWhen: (a) => a.goals.includes("endurance") || a.trainingFrequency === "5_plus",
    id: "enduranceLongSession",
    path: "endurance.longSessionMin",
    title: "Longest typical training session",
    type: "single",
    tier: "branch",
    why: "Sessions over 90 minutes shift the priority toward carbs, electrolytes, and sodium — not pills.",
    image: U("1502904550040-7534597429ae"),
    imageAlt: "Aerial view of runners on a track in a long session",
    options: [
      { value: "under_45", label: "Under 45 min" },
      { value: "45_90", label: "45 – 90 min" },
      { value: "90_plus", label: "90 min +" },
    ],
  },
  {
    showWhen: (a) => a.goals.includes("endurance") || a.trainingFrequency === "5_plus",
    id: "enduranceSweat",
    path: "endurance.sweatRate",
    title: "How much do you sweat in training?",
    type: "single",
    tier: "branch",
    why: "High sweat losses point to electrolytes / sodium replacement before flashy ergogenic aids.",
    image: U("1517438476312-10d79c077509"),
    imageAlt: "Athlete after a hard session",
    options: [
      { value: "low", label: "Light" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "Heavy — soaked kit" },
    ],
  },
  {
    showWhen: (a) => a.goals.includes("endurance") || a.trainingFrequency === "5_plus",
    id: "enduranceConditions",
    path: "endurance",
    title: "Endurance specifics",
    subtitle: "Helps us tune electrolytes, fueling, and GI tolerance.",
    type: "boolean-multi",
    tier: "advanced",
    why: "Heat exposure, cramps, and GI distress all change which fueling/electrolyte stack actually works.",
    image: U("1571019613454-1cb2f99b2d8b"),
    imageAlt: "Runner training in hot conditions",
    booleans: [
      { path: "endurance.heatExposure", label: "I often train in heat or humidity" },
      { path: "endurance.crampHistory", label: "I get cramps during long sessions" },
      { path: "endurance.giIssues", label: "I get GI issues with mid-session fueling" },
    ],
    helper: "None apply? Skip and continue.",
  },

  // ---------------------------------------------------------------------
  // Branch: strength / muscle
  // ---------------------------------------------------------------------
  {
    showWhen: (a) => a.goals.includes("muscle_recovery"),
    id: "proteinIntake",
    path: "strength.proteinIntake",
    title: "Daily protein, honestly",
    type: "single",
    tier: "branch",
    why: "If protein is already ≥1.6 g/kg/day, a whey/casein shake adds little — recovery comes from training and sleep.",
    image: U("1607532941433-304659e8198a"),
    imageAlt: "Lean protein meal on a plate",
    options: [
      { value: "low", label: "Low (< 1 g/kg)" },
      { value: "moderate", label: "Moderate (1 – 1.6 g/kg)" },
      { value: "high", label: "High (≥ 1.6 g/kg)" },
    ],
  },
  {
    showWhen: (a) => a.goals.includes("muscle_recovery"),
    id: "creatineHistory",
    path: "strength.creatineHistory",
    title: "Creatine history",
    type: "single",
    tier: "advanced",
    why: "Current users don't need a loading phase; never-tried users get a different onboarding script.",
    image: U("1517248135467-4c7edcad34c4"),
    imageAlt: "Scoop of creatine monohydrate powder",
    options: [
      { value: "never", label: "Never tried" },
      { value: "past", label: "Tried in the past" },
      { value: "current", label: "Currently taking" },
    ],
  },

  // ---------------------------------------------------------------------
  // Branch: sleep deep dive
  // ---------------------------------------------------------------------
  {
    showWhen: (a) => a.goals.includes("sleep") || a.sleepQuality === "poor",
    id: "sleepDetail",
    path: "sleepDetail",
    title: "Sleep environment",
    subtitle: "We tune magnesium, glycine, and melatonin timing accordingly.",
    type: "boolean-multi",
    tier: "branch",
    why: "Late caffeine and shift work / jet lag are the #1 reversible drivers of poor sleep before any supplement.",
    image: U("1531746020798-e6953c6e8e04"),
    imageAlt: "Calm bedroom at night",
    booleans: [
      { path: "sleepDetail.caffeineAfter2pm", label: "I regularly have caffeine after 2pm" },
      { path: "sleepDetail.shiftWorkOrJetLag", label: "Shift work or frequent jet lag" },
    ],
    helper: "None apply? Skip and continue.",
  },

  // ---------------------------------------------------------------------
  // Branch: fatigue / low energy — labs flagged
  // ---------------------------------------------------------------------
  {
    showWhen: (a) =>
      (a.goals.includes("energy") && a.diet !== "vegan" && a.diet !== "vegetarian") ||
      a.sleepQuality === "poor",
    id: "fatigueLabsGeneral",
    path: "fatigueLabs",
    title: "Past lab flags",
    subtitle: "Lets us prioritize labs over guesswork.",
    type: "boolean-multi",
    tier: "advanced",
    why: "Persistent fatigue is most often vitamin D, B12, iron/ferritin, or thyroid — testing beats supplementing blind.",
    image: U("1559757175-5700dde675bc"),
    imageAlt: "Tired person at a kitchen table",
    booleans: [
      { path: "fatigueLabs.vitDTestedLow", label: "Low vitamin D in a past test" },
      { path: "fatigueLabs.b12TestedLow", label: "Low B12 in a past test" },
      { path: "fatigueLabs.ironTestedLow", label: "Low iron / ferritin in a past test" },
      { path: "fatigueLabs.thyroidFlagged", label: "Thyroid flagged by a clinician" },
    ],
    helper: "None apply? Skip and continue.",
  },

  // ---------------------------------------------------------------------
  // Safety: medical screen (always shown)
  // ---------------------------------------------------------------------
  {
    id: "medical",
    path: "medical",
    title: "Do any of these apply to you?",
    subtitle: "We use these to gate high-risk recommendations.",
    type: "boolean-multi",
    tier: "essential",
    safety: true,
    why: "These flags drive every safety gate — blood thinners + omega-3, SSRIs + 5-HTP, kidney/liver + creatine, etc.",
    image: U("1584036561566-baf8f5f1b144"),
    imageAlt: "Prescription medication on a clinical surface",
    booleans: [
      { path: "medical.medications", label: "I take prescription medication" },
      { path: "medical.bloodThinners", label: "Blood thinners (warfarin, DOACs)" },
      { path: "medical.antidepressants", label: "Antidepressants / SSRIs" },
      { path: "medical.diabetesMeds", label: "Diabetes medication" },
      { path: "medical.thyroidMeds", label: "Thyroid medication" },
      { path: "medical.bloodPressureMeds", label: "Blood pressure medication" },
      { path: "medical.kidneyLiver", label: "Kidney or liver disease" },
      { path: "medical.heartDisease", label: "Heart disease" },
      { path: "medical.surgeryPlanned", label: "Surgery planned in the next 30 days" },
      { path: "medical.anemiaHistory", label: "History of anemia" },
    ],
    helper: "None of the above? Skip and continue.",
  },
  {
    id: "allergies",
    path: "allergies",
    title: "Preferences",
    subtitle: "We'll filter recommendations to match.",
    type: "boolean-multi",
    tier: "advanced",
    image: U("1607619056574-7b8d3ee536b2"),
    imageAlt: "Premium capsules on a minimal surface",
    booleans: [
      { path: "allergies.vegan", label: "Vegan formulas only" },
      { path: "allergies.gelatinFree", label: "Gelatin-free" },
      { path: "allergies.glutenFree", label: "Gluten-free" },
      { path: "allergies.lactoseFree", label: "Lactose-free" },
      { path: "allergies.stimulantFree", label: "Stimulant-free" },
      { path: "allergies.thirdPartyTestedOnly", label: "Third-party tested only" },
    ],
  },
  {
    id: "budget",
    path: "budget",
    title: "Monthly supplement budget",
    type: "single",
    tier: "essential",
    image: U("1554224155-6726b3ff858f"),
    imageAlt: "Minimal flatlay representing personal budget",
    options: [
      { value: "low", label: "Lean (< $25)" },
      { value: "moderate", label: "Moderate ($25 – $75)" },
      { value: "premium", label: "Premium ($75 +)" },
    ],
  },
];

// ----------------------------------------------------------------------------
// Path helpers
// ----------------------------------------------------------------------------

export function getByPath(obj: QuizAnswers, path: AnswerPath): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

export function setByPath(obj: QuizAnswers, path: AnswerPath, value: unknown): QuizAnswers {
  const keys = path.split(".");
  const next: QuizAnswers = JSON.parse(JSON.stringify(obj));
  let cur: Record<string, unknown> = next as unknown as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null || typeof cur[k] !== "object") {
      cur[k] = {};
    }
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// ----------------------------------------------------------------------------
// Slug + share-URL encoding
// ----------------------------------------------------------------------------

function dietWord(d: QuizAnswers["diet"]) {
  switch (d) {
    case "vegan":
      return "vegan";
    case "vegetarian":
      return "vegetarian";
    case "pescatarian":
      return "pescatarian";
    case "low_carb":
      return "low-carb";
    case "calorie_deficit":
      return "cutting";
    case "restricted":
      return "restricted";
    default:
      return "omnivore";
  }
}

function goalWord(goals: Goal[]) {
  if (goals.length === 0) return "wellness";
  const order: Goal[] = [
    "muscle_recovery",
    "endurance",
    "weight_management",
    "energy",
    "sleep",
    "focus",
    "immune",
    "bone_health",
    "general_wellness",
  ];
  const top = order.find((g) => goals.includes(g)) ?? goals[0];
  return top.replace(/_/g, "-");
}

function ageWord(a: QuizAnswers["ageRange"]) {
  switch (a) {
    case "under_18":
      return "teen";
    case "18_29":
      return "20s";
    case "30_44":
      return "30s";
    case "45_59":
      return "50s";
    case "60_plus":
      return "60-plus";
  }
}

export function generateSlug(a: QuizAnswers): string {
  const parts = [dietWord(a.diet), goalWord(a.goals), a.sex, ageWord(a.ageRange)];
  return parts
    .filter(Boolean)
    .join("-")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

// URL-safe base64 of compact JSON. Keeps everything client-decodable so the
// shared result page can re-score deterministically without a DB.
export function encodeAnswers(a: QuizAnswers): string {
  const json = JSON.stringify(a);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeAnswers(encoded: string): QuizAnswers | null {
  try {
    const b64 =
      encoded.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((encoded.length + 3) % 4);
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as QuizAnswers;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Per-step completion check used by navigation
// ----------------------------------------------------------------------------

export function isStepAnswered(step: QuizStep, answers: QuizAnswers): boolean {
  switch (step.type) {
    case "single":
    case "slider-freq": {
      const v = getByPath(answers, step.path);
      return typeof v === "string" && v.length > 0;
    }
    case "multi": {
      const v = getByPath(answers, step.path);
      return Array.isArray(v) && v.length > 0;
    }
    case "boolean-multi":
      // Always considered answered — none-of-the-above is valid.
      return true;
  }
}

/** A user is "high-risk" if pregnancy/breastfeeding or any hard medical flag fires.
 *  High-risk flows are kept short: essential + safety questions only, branch
 *  steps are still respected, advanced steps are dropped even in Advanced mode. */
export function isHighRisk(a: QuizAnswers): boolean {
  if (a.pregnancy === "pregnant" || a.pregnancy === "breastfeeding") return true;
  const m = a.medical;
  return Boolean(
    m.bloodThinners ||
      m.antidepressants ||
      m.kidneyLiver ||
      m.heartDisease ||
      m.surgeryPlanned,
  );
}

/** Steps that should be shown for the current answer set + mode. */
export function visibleSteps(answers: QuizAnswers, mode: QuizMode = "fast"): QuizStep[] {
  const highRisk = isHighRisk(answers);
  return quizSteps.filter((s) => {
    if (s.showWhen && !s.showWhen(answers)) return false;
    const tier = s.tier ?? "essential";
    if (tier === "essential") return true;
    if (s.safety) return true; // safety questions are always shown
    if (highRisk && tier === "advanced") return false; // short flow for high-risk
    if (tier === "branch") return true; // branches respect showWhen above
    // tier === "advanced"
    return mode === "advanced";
  });
}

export function answeredCount(answers: QuizAnswers, mode: QuizMode = "fast"): number {
  return visibleSteps(answers, mode).filter((s) => isStepAnswered(s, answers)).length;
}

export type { Frequency };
