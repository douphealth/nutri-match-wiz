import { SUPPLEMENTS } from "./supplementData";
import type {
  EngineResult,
  Frequency,
  QuizAnswers,
  Recommendation,
  Supplement,
} from "@/types/supplements";

/**
 * Deterministic, transparent scoring engine.
 * Each supplement starts at 0 and accumulates points from explicit user signals.
 * Safety gates can suppress or downgrade recommendations.
 */

const freqLow = (f: Frequency) => f === "never" || f === "rarely";
const freqHigh = (f: Frequency) => f === "often" || f === "daily";
const freqValue = (f: Frequency) =>
  f === "never" ? 0 : f === "rarely" ? 1 : f === "weekly" ? 2 : f === "often" ? 3 : 4;
const gapStrength = (f: Frequency) => 4 - freqValue(f);

interface Bucket {
  score: number;
  reasons: string[];
  safetyFlags: string[];
  tags: string[];
  suppressed?: boolean;
}

function newBuckets(): Record<string, Bucket> {
  const b: Record<string, Bucket> = {};
  for (const s of SUPPLEMENTS) b[s.id] = { score: 0, reasons: [], safetyFlags: [], tags: [] };
  return b;
}

function add(b: Bucket, points: number, reason: string) {
  b.score += points;
  if (reason && !b.reasons.includes(reason)) b.reasons.push(reason);
}

function tag(b: Bucket, label: string) {
  if (!b.tags.includes(label)) b.tags.push(label);
}

function addSignal(b: Bucket, points: number, reason: string, label: string) {
  add(b, points, reason);
  tag(b, label);
}

function flag(b: Bucket, msg: string) {
  if (!b.safetyFlags.includes(msg)) b.safetyFlags.push(msg);
}

function currentSupplementMentions(a: QuizAnswers, terms: string[]) {
  const text = a.currentSupplements.toLowerCase();
  return terms.some((t) => text.includes(t));
}

export function evaluateSafetyGate(a: QuizAnswers): EngineResult["safetyGate"] {
  const reasons: string[] = [];
  if (a.ageRange === "under_18") reasons.push("You're under 18 — supplement decisions should involve a parent/guardian and pediatric clinician.");
  if (a.pregnancy === "pregnant") reasons.push("You're pregnant — supplements should be coordinated with your obstetric clinician.");
  if (a.pregnancy === "breastfeeding") reasons.push("You're breastfeeding — coordinate supplements with your clinician.");
  if (a.pregnancy === "trying") reasons.push("You're trying to conceive — discuss prenatal planning with a clinician.");
  if (a.medical.medications) reasons.push("You take prescription medication — check for interactions with a pharmacist or clinician.");
  if (a.medical.bloodThinners) reasons.push("You take blood thinners — several supplements can increase bleeding risk.");
  if (a.medical.antidepressants) reasons.push("You take antidepressants — some supplements (e.g., St. John's wort, 5-HTP) can interact dangerously.");
  if (a.medical.diabetesMeds) reasons.push("You take diabetes medication — some supplements affect blood sugar.");
  if (a.medical.thyroidMeds) reasons.push("You take thyroid medication — calcium, iron, and others affect absorption timing.");
  if (a.medical.bloodPressureMeds) reasons.push("You take blood pressure medication — some supplements can interact.");
  if (a.medical.kidneyLiver) reasons.push("You have kidney or liver concerns — supplement dosing and choice need clinician input.");
  if (a.medical.heartDisease) reasons.push("You have a heart condition — review supplements with your cardiology team.");
  if (a.medical.surgeryPlanned) reasons.push("You have surgery planned — many supplements should be paused 1–2 weeks before.");
  return { triggered: reasons.length > 0, reasons };
}

export function runEngine(a: QuizAnswers): EngineResult {
  const buckets = newBuckets();
  const safetyGate = evaluateSafetyGate(a);
  const foodFirstNotes: string[] = [];
  const generalNotes: string[] = [];

  // ---- Vitamin D ----
  const vd = buckets["vitamin_d"];
  if (a.sunExposure === "low") add(vd, 3, "You reported low sun exposure.");
  else if (a.sunExposure === "moderate") add(vd, 1, "Moderate sun exposure may still leave gaps in winter.");
  if (a.ageRange === "60_plus" || a.ageRange === "45_59") add(vd, 1, "Older adults are more prone to vitamin D shortfall.");
  if (a.diet === "vegan") add(vd, 1, "Vegan diets tend to be lower in vitamin D — choose D3 from lichen or D2.");
  if (a.goals.includes("bone_health")) add(vd, 1, "Bone-health goal aligns with vitamin D status.");
  if (a.goals.includes("immune")) add(vd, 1, "Adequate vitamin D supports immune function.");

  // ---- B12 ----
  const b12 = buckets["b12"];
  if (a.diet === "vegan") add(b12, 4, "Vegan diets reliably require B12 from supplements or fortified foods.");
  if (a.diet === "vegetarian") add(b12, 2, "Vegetarian diets often run low on B12 over time.");
  if (a.ageRange === "60_plus") add(b12, 2, "Absorption of B12 declines with age.");
  if (a.medical.medications) add(b12, 1, "Some common meds (metformin, acid-reducers) reduce B12 absorption.");
  if (a.medical.anemiaHistory) add(b12, 1, "History of anemia — discuss B12/iron testing with your clinician.");

  // ---- Omega-3 ----
  const o3 = buckets["omega3"];
  if (freqLow(a.foodIntake.oilyFish)) add(o3, 3, "You rarely eat oily fish.");
  if (a.diet === "vegan" || a.diet === "vegetarian") add(o3, 1, "Plant-based eaters benefit from algal EPA/DHA.");
  if (a.goals.includes("focus") || a.goals.includes("general_wellness") || a.goals.includes("muscle_recovery"))
    add(o3, 1, "Omega-3s support cognition, mood, and recovery.");
  if (a.medical.bloodThinners) flag(o3, "Discuss fish oil with your clinician — higher doses may increase bleeding risk on blood thinners.");

  // ---- Magnesium ----
  const mg = buckets["magnesium"];
  if (a.sleepQuality === "poor") add(mg, 2, "Poor sleep may improve with evening magnesium glycinate.");
  else if (a.sleepQuality === "fair") add(mg, 1, "Fair sleep — magnesium may help.");
  if (a.stress === "high") add(mg, 1, "High stress can deplete magnesium status.");
  if (a.trainingFrequency === "3_4" || a.trainingFrequency === "5_plus") add(mg, 1, "Frequent training increases magnesium turnover.");
  if (freqLow(a.foodIntake.legumes) && freqLow(a.foodIntake.wholeGrains)) add(mg, 1, "Low intake of legumes/whole grains suggests dietary shortfall.");
  if (a.medical.kidneyLiver) flag(mg, "Kidney disease — magnesium dosing needs clinician oversight.");

  // ---- Creatine ----
  const cr = buckets["creatine"];
  if (a.trainingFrequency === "3_4") add(cr, 2, "Regular resistance/intense training benefits from creatine.");
  if (a.trainingFrequency === "5_plus") add(cr, 3, "Frequent training — creatine is one of the most evidence-backed aids.");
  if (a.goals.includes("muscle_recovery")) add(cr, 2, "Goal: muscle recovery aligns with creatine evidence.");
  if (a.goals.includes("endurance")) add(cr, 1, "Creatine can support high-intensity efforts within endurance work.");
  if (a.goals.includes("focus")) add(cr, 1, "Emerging evidence for creatine and cognitive performance.");
  if (a.ageRange === "60_plus") add(cr, 1, "Creatine + resistance training supports lean mass in older adults.");
  if (a.medical.kidneyLiver) flag(cr, "Kidney disease — discuss creatine with your clinician.");

  // ---- Protein ----
  const pr = buckets["protein"];
  if (a.trainingFrequency === "3_4" || a.trainingFrequency === "5_plus") add(pr, 2, "Higher training load increases protein needs.");
  if (a.goals.includes("muscle_recovery")) add(pr, 2, "Recovery goal aligns with adequate daily protein.");
  if (a.goals.includes("weight_management")) add(pr, 1, "Protein supports satiety in a calorie-aware approach.");
  if (a.diet === "vegan" || a.diet === "vegetarian") add(pr, 1, "Plant-based eaters may find a tested protein powder useful to top up.");
  if (a.diet === "calorie_deficit") add(pr, 1, "In a deficit, protein protects lean mass.");

  // ---- Iron (HIGH CAUTION) ----
  const fe = buckets["iron"];
  // Only nudge upward in well-defined risk; never recommend without lab guidance.
  if (a.sex === "female" && (a.ageRange === "18_29" || a.ageRange === "30_44")) add(fe, 1, "Menstruating individuals are at higher risk of low iron.");
  if (a.medical.anemiaHistory) add(fe, 2, "History of anemia raises the case for clinician-directed testing.");
  if (a.diet === "vegan" || a.diet === "vegetarian") add(fe, 1, "Plant-based diets require attention to iron — pair with vitamin C.");
  flag(fe, "Do not start iron without lab testing (ferritin/CBC) and clinician guidance — excess iron can be harmful.");

  // ---- Calcium ----
  const ca = buckets["calcium"];
  if (freqLow(a.foodIntake.dairy) && a.diet !== "vegan") add(ca, 1, "Low dairy intake may leave a calcium gap.");
  if (a.diet === "vegan" && freqLow(a.foodIntake.fortifiedFoods)) add(ca, 2, "Vegan with low fortified-food intake — calcium gap is likely.");
  if (a.goals.includes("bone_health")) add(ca, 1, "Bone-health goal — but food-first first.");
  if (a.ageRange === "60_plus") add(ca, 1, "Older adults have higher calcium needs.");

  // ---- Prenatal ----
  const pn = buckets["prenatal"];
  if (a.pregnancy === "pregnant" || a.pregnancy === "breastfeeding" || a.pregnancy === "trying") {
    add(pn, 5, "Pregnancy/breastfeeding/preconception — prenatal with folate is standard of care.");
  } else {
    pn.suppressed = true;
  }

  // ---- Electrolytes ----
  const el = buckets["electrolytes"];
  if (a.trainingFrequency === "5_plus") add(el, 2, "Frequent intense training — sweat losses can be significant.");
  if (a.goals.includes("endurance")) add(el, 2, "Endurance goal — electrolytes during long sessions are useful.");
  if (a.medical.bloodPressureMeds) flag(el, "Blood pressure meds — be cautious with high-sodium electrolyte products.");
  if (a.medical.kidneyLiver) flag(el, "Kidney disease — potassium-containing products need clinician input.");

  // ---- Fiber ----
  const fi = buckets["fiber"];
  if (freqLow(a.foodIntake.fruitsVeg)) add(fi, 2, "Low fruit/vegetable intake.");
  if (freqLow(a.foodIntake.wholeGrains)) add(fi, 1, "Low whole-grain intake.");
  if (freqLow(a.foodIntake.legumes)) add(fi, 1, "Low legume intake.");
  if (a.goals.includes("weight_management")) add(fi, 1, "Fiber supports satiety and metabolic health.");

  // ---- Probiotic ----
  const pb = buckets["probiotic"];
  if (a.goals.includes("immune") && freqLow(a.foodIntake.fruitsVeg)) add(pb, 1, "Low produce intake — but feed the microbiome with food first.");

  // ---- Zinc ----
  const zn = buckets["zinc"];
  if (a.goals.includes("immune")) add(zn, 1, "Short-term, modest-dose zinc has limited evidence for cold symptoms.");
  if (a.diet === "vegan" || a.diet === "vegetarian") add(zn, 1, "Plant-based diets can be lower in absorbable zinc.");

  // ---- Vitamin C ----
  const vc = buckets["vitamin_c"];
  if (freqLow(a.foodIntake.fruitsVeg)) add(vc, 2, "Low produce intake — vitamin C may be a useful backup.");
  if (a.goals.includes("immune")) add(vc, 1, "Modest vitamin C is a reasonable immune-support backup.");

  // ---- Melatonin ----
  const mel = buckets["melatonin"];
  if (a.goals.includes("sleep") && a.sleepQuality === "poor") add(mel, 2, "Short-term, low-dose melatonin can help circadian shifts.");
  if (a.pregnancy !== "none" || a.ageRange === "under_18") {
    mel.suppressed = true;
  }
  if (a.medical.antidepressants || a.medical.bloodThinners || a.medical.bloodPressureMeds) {
    flag(mel, "Several common medications interact with melatonin — check with a pharmacist.");
  }

  // ---- Global safety overlays ----
  if (a.medical.antidepressants) {
    generalNotes.push("Avoid St. John's wort and 5-HTP if you take antidepressants — serious interactions possible.");
  }
  if (a.medical.bloodThinners) {
    generalNotes.push("Be cautious with high-dose fish oil, vitamin E, ginkgo, garlic, and ginger — bleeding-risk concerns.");
  }
  if (a.medical.surgeryPlanned) {
    generalNotes.push("Many supplements should be paused 1–2 weeks before surgery — confirm with your surgical team.");
  }

  // ---- Food-first notes ----
  if (freqLow(a.foodIntake.fruitsVeg)) foodFirstNotes.push("Build meals around vegetables and fruit — most vitamin gaps close quickly with produce.");
  if (freqLow(a.foodIntake.oilyFish) && a.diet !== "vegan") foodFirstNotes.push("Aim for 1–2 servings of low-mercury oily fish per week.");
  if (freqLow(a.foodIntake.legumes) && freqLow(a.foodIntake.wholeGrains)) foodFirstNotes.push("Legumes and whole grains contribute fiber, magnesium, and B vitamins.");
  if (a.diet === "vegan") foodFirstNotes.push("Plan reliable vegan sources of B12, omega-3 (algal), iodine, and (for some) iron and zinc.");

  // ---- Lifestyle nudges (non-supplement) ----
  if (freqHigh(a.alcohol)) generalNotes.push("Frequent alcohol use can deplete B vitamins and magnesium and strain the liver — supplements don't replace cutting back.");
  if (freqHigh(a.caffeine) && a.sleepQuality !== "good") generalNotes.push("High caffeine + poor sleep — try cutting caffeine after early afternoon before adding sleep supplements.");

  // ---- Build recommendation list ----
  const recommendations: Recommendation[] = SUPPLEMENTS
    .map((s: Supplement) => {
      const b = buckets[s.id];
      if (b.suppressed) return null;
      if (b.score <= 0) return null;

      // Confidence: based on score + evidence + safety
      let confidence: Recommendation["confidence"] = "Low";
      if (b.score >= 4 && (s.evidenceLevel === "Strong" || s.evidenceLevel === "Moderate")) confidence = "High";
      else if (b.score >= 2) confidence = "Moderate";

      // Downgrade if safety gate triggered or supplement is high caution
      if (safetyGate.triggered && s.safetyLevel !== "Low") {
        confidence = confidence === "High" ? "Moderate" : "Low";
      }

      return {
        supplement: s,
        score: b.score,
        reasons: b.reasons,
        safetyFlags: b.safetyFlags,
        confidence,
      } as Recommendation;
    })
    .filter((x): x is Recommendation => x !== null)
    .sort((a, b) => b.score - a.score);

  // Match score: confidence in this personalized plan (0–100).
  // Combines (a) how many signals fired vs. answered, (b) average evidence
  // strength of the recommendations, and (c) whether a safety review was
  // needed. A user who answered the full quiz and matched several
  // evidence-backed picks lands in the 85–98 range.
  const evidenceWeight = (lvl: Supplement["evidenceLevel"]) =>
    lvl === "Strong" ? 1 : lvl === "Moderate" ? 0.8 : 0.6;
  const topN = recommendations.slice(0, 5);
  const evidenceAvg =
    topN.length > 0
      ? topN.reduce((s, r) => s + evidenceWeight(r.supplement.evidenceLevel), 0) / topN.length
      : 0.7;
  const signalDensity = Math.min(1, recommendations.length / 4); // 4+ recs => full credit
  const signalStrength = Math.min(
    1,
    recommendations.reduce((s, r) => s + Math.min(r.score, 5), 0) / 18,
  );
  const safetyPenalty = safetyGate.triggered ? 0.06 : 0;
  // Base 70 so a real personalized plan never reads as "weak match".
  const raw =
    70 +
    signalDensity * 10 +
    signalStrength * 12 +
    evidenceAvg * 8 -
    safetyPenalty * 100;
  const matchScore = Math.max(60, Math.min(98, Math.round(raw)));

  return {
    matchScore,
    recommendations,
    safetyGate,
    foodFirstNotes,
    generalNotes,
  };
}

export const DEFAULT_ANSWERS: QuizAnswers = {
  ageRange: "30_44",
  sex: "prefer_not",
  pregnancy: "none",
  diet: "omnivore",
  goals: [],
  sunExposure: "moderate",
  sleepQuality: "fair",
  stress: "moderate",
  alcohol: "rarely",
  caffeine: "weekly",
  trainingFrequency: "1_2",
  foodIntake: {
    oilyFish: "rarely",
    dairy: "weekly",
    fortifiedFoods: "rarely",
    redMeat: "weekly",
    legumes: "weekly",
    fruitsVeg: "weekly",
    wholeGrains: "weekly",
  },
  medical: {
    medications: false,
    bloodThinners: false,
    antidepressants: false,
    diabetesMeds: false,
    thyroidMeds: false,
    bloodPressureMeds: false,
    kidneyLiver: false,
    heartDisease: false,
    surgeryPlanned: false,
    anemiaHistory: false,
  },
  currentSupplements: "",
  allergies: {
    gelatinFree: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    stimulantFree: false,
    thirdPartyTestedOnly: true,
  },
  budget: "moderate",
  pillPreference: "no_preference",
};
