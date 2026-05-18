// Quiz step definitions for the Supplement Match wizard, plus helpers for
// turning a completed answer set into a shareable slug + URL-safe payload.
//
// The QuizAnswers shape itself lives in "@/types/supplements" and powers
// the deterministic scoring engine in `recommendation-engine.ts`.

import type { QuizAnswers, Frequency, Goal } from "@/types/supplements";
import { DEFAULT_ANSWERS } from "./supplementEngine";

export { DEFAULT_ANSWERS as defaultAnswers };
export type { QuizAnswers };

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
}

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
    options: [
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
      { value: "intersex", label: "Intersex" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
  {
    id: "pregnancy",
    path: "pregnancy",
    title: "Pregnancy status",
    subtitle: "Many supplements are inappropriate during pregnancy or breastfeeding.",
    type: "single",
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
    options: [
      { value: "poor", label: "Poor" },
      { value: "fair", label: "Fair" },
      { value: "good", label: "Good" },
    ],
  },
  {
    id: "stress",
    path: "stress",
    title: "Average stress level",
    type: "single",
    options: [
      { value: "low", label: "Low" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "High" },
    ],
  },
  {
    id: "alcohol",
    path: "alcohol",
    title: "Alcohol intake",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "caffeine",
    path: "caffeine",
    title: "Caffeine intake",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "oilyFish",
    path: "foodIntake.oilyFish",
    title: "Oily fish (salmon, sardines, mackerel)",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "dairy",
    path: "foodIntake.dairy",
    title: "Dairy",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "fruitsVeg",
    path: "foodIntake.fruitsVeg",
    title: "Fruits & vegetables",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "legumes",
    path: "foodIntake.legumes",
    title: "Legumes (beans, lentils, chickpeas)",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "wholeGrains",
    path: "foodIntake.wholeGrains",
    title: "Whole grains",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "redMeat",
    path: "foodIntake.redMeat",
    title: "Red meat",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "fortifiedFoods",
    path: "foodIntake.fortifiedFoods",
    title: "Fortified foods (plant milks, cereals)",
    type: "slider-freq",
    options: FREQUENCY_OPTIONS,
  },
  {
    id: "medical",
    path: "medical",
    title: "Do any of these apply to you?",
    subtitle: "We use these to gate high-risk recommendations.",
    type: "boolean-multi",
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
    cur = cur[keys[i]] as Record<string, unknown>;
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
    return Buffer.from(json, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeAnswers(encoded: string): QuizAnswers | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((encoded.length + 3) % 4);
    const json = typeof window === "undefined" ? Buffer.from(b64, "base64").toString("utf-8") : decodeURIComponent(escape(atob(b64)));
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

export function answeredCount(answers: QuizAnswers): number {
  return quizSteps.filter((s) => isStepAnswered(s, answers)).length;
}

export type { Frequency };
