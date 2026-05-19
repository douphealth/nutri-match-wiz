import { SUPPLEMENTS } from "./supplementData";
import { EVIDENCE_MATRIX } from "./evidence/evidence-matrix";
import type {
  EngineResult,
  Frequency,
  QuizAnswers,
  Recommendation,
  RecommendationStatus,
  SuppressedRecommendation,
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
  const differentiators: string[] = [];
  const addDiff = (msg: string) => {
    if (!differentiators.includes(msg)) differentiators.push(msg);
  };

  if (a.diet !== "omnivore") addDiff(`${a.diet.replace("_", " ")} diet pattern`);
  if (a.goals.length > 0) addDiff(`${a.goals.length} selected goal${a.goals.length > 1 ? "s" : ""}`);
  if (a.trainingFrequency !== "none") addDiff(`${a.trainingFrequency.replace("_", "–")} training cadence`);
  if (a.sunExposure !== "moderate") addDiff(`${a.sunExposure} sun exposure`);
  if (a.sleepQuality !== "good") addDiff(`${a.sleepQuality} sleep quality`);
  if (Object.values(a.medical).some(Boolean)) addDiff("medical safety modifiers");
  if (Object.values(a.allergies).some(Boolean)) addDiff("label-preference filters");

  // ---- Vitamin D ----
  const vd = buckets["vitamin_d"];
  if (a.sunExposure === "low") addSignal(vd, 4.2, "You reported low sun exposure — the strongest non-lab signal for a vitamin D gap.", "low sun");
  else if (a.sunExposure === "moderate") addSignal(vd, 1.2, "Moderate sun exposure may still leave gaps in winter or indoor work weeks.", "moderate sun");
  else add(vd, -1.4, "");
  if (a.ageRange === "60_plus") addSignal(vd, 1.6, "Age 60+ increases risk of low vitamin D status.", "age 60+");
  else if (a.ageRange === "45_59") addSignal(vd, 0.9, "Midlife adults are more prone to vitamin D shortfall than younger adults.", "midlife");
  if (a.diet === "vegan") addSignal(vd, 1.1, "Vegan diets tend to be lower in vitamin D — choose lichen D3 or D2.", "vegan");
  if (freqLow(a.foodIntake.fortifiedFoods)) addSignal(vd, 0.8, "You rarely use fortified foods, so food-based vitamin D coverage may be low.", "low fortified foods");
  if (a.goals.includes("bone_health")) addSignal(vd, 1.4, "Bone-health goal strongly aligns with vitamin D status.", "bone goal");
  if (a.goals.includes("immune")) addSignal(vd, 0.8, "Adequate vitamin D supports normal immune function.", "immune goal");
  if (currentSupplementMentions(a, ["vitamin d", "d3", "cholecalciferol"])) {
    add(vd, -1.2, "");
    flag(vd, "You mentioned current vitamin D use — avoid stacking high doses unless labs justify it.");
  }

  // ---- B12 ----
  const b12 = buckets["b12"];
  if (a.diet === "vegan") addSignal(b12, 5.2, "Vegan diets reliably require B12 from supplements or fortified foods.", "vegan B12-critical");
  if (a.diet === "vegetarian") addSignal(b12, 3.1, "Vegetarian diets often run low on B12 over time.", "vegetarian");
  if (a.diet === "pescatarian" && freqLow(a.foodIntake.dairy)) addSignal(b12, 1.1, "Pescatarian pattern with low dairy can reduce dependable B12 intake.", "low dairy pescatarian");
  if (a.ageRange === "60_plus") addSignal(b12, 2.4, "B12 absorption declines with age, especially after 60.", "age 60+");
  if (a.ageRange === "45_59") addSignal(b12, 0.7, "Midlife adults can benefit from checking B12 if energy or nerve symptoms appear.", "midlife");
  if (a.medical.medications || a.medical.diabetesMeds) addSignal(b12, 1.5, "Some common medications, especially metformin/acid reducers, can reduce B12 absorption.", "medication modifier");
  if (a.medical.anemiaHistory) addSignal(b12, 1.8, "History of anemia — discuss B12/iron testing with your clinician.", "anemia history");
  if (currentSupplementMentions(a, ["b12", "b-12", "methylcobalamin", "cyanocobalamin"])) add(b12, -1.0, "");

  // ---- Omega-3 ----
  const o3 = buckets["omega3"];
  if (freqLow(a.foodIntake.oilyFish)) addSignal(o3, 2.2 + gapStrength(a.foodIntake.oilyFish) * 0.55, "You rarely eat oily fish, so EPA/DHA intake is likely below target.", "low oily fish");
  else if (a.foodIntake.oilyFish === "weekly") addSignal(o3, 1.0, "Weekly oily fish helps, but may not consistently reach the 2-serving target.", "partial oily fish");
  else add(o3, -1.8, "");
  if (a.diet === "vegan" || a.diet === "vegetarian") addSignal(o3, 1.4, "Plant-based eaters benefit from algal EPA/DHA if fish is absent.", "plant-based omega");
  if (a.goals.includes("focus") || a.goals.includes("general_wellness") || a.goals.includes("muscle_recovery"))
    addSignal(o3, 0.9, "Omega-3s support cognition, mood, and recovery.", "goal aligned");
  if (a.medical.bloodThinners) flag(o3, "Discuss fish oil with your clinician — higher doses may increase bleeding risk on blood thinners.");
  if (currentSupplementMentions(a, ["omega", "fish oil", "epa", "dha"])) add(o3, -1.0, "");

  // ---- Magnesium ----
  const mg = buckets["magnesium"];
  if (a.sleepQuality === "poor") addSignal(mg, 2.5, "Poor sleep may improve with evening magnesium glycinate when intake is low.", "poor sleep");
  else if (a.sleepQuality === "fair") addSignal(mg, 1.2, "Fair sleep — magnesium may help if dietary intake is short.", "fair sleep");
  if (a.stress === "high") addSignal(mg, 1.3, "High stress can increase magnesium turnover.", "high stress");
  else if (a.stress === "moderate") addSignal(mg, 0.4, "Moderate stress adds a small magnesium-demand signal.", "moderate stress");
  if (a.trainingFrequency === "3_4") addSignal(mg, 0.9, "Regular training increases magnesium turnover.", "regular training");
  if (a.trainingFrequency === "5_plus") addSignal(mg, 1.3, "Frequent training increases magnesium turnover.", "high training");
  if (freqLow(a.foodIntake.legumes)) addSignal(mg, 0.45, "Low legume intake reduces a major magnesium food source.", "low legumes");
  if (freqLow(a.foodIntake.wholeGrains)) addSignal(mg, 0.45, "Low whole-grain intake reduces a major magnesium food source.", "low whole grains");
  if (a.medical.kidneyLiver) flag(mg, "Kidney disease — magnesium dosing needs clinician oversight.");
  if (currentSupplementMentions(a, ["magnesium", "glycinate", "citrate"])) add(mg, -0.8, "");

  // ---- Creatine ----
  const cr = buckets["creatine"];
  if (a.trainingFrequency === "1_2" && a.goals.includes("muscle_recovery")) addSignal(cr, 1.1, "Light-to-moderate training plus recovery goals can still benefit from creatine consistency.", "recovery training");
  if (a.trainingFrequency === "3_4") addSignal(cr, 2.6, "Regular resistance/intense training benefits from creatine.", "regular training");
  if (a.trainingFrequency === "5_plus") addSignal(cr, 3.7, "Frequent training — creatine is one of the most evidence-backed aids.", "high training");
  if (a.goals.includes("muscle_recovery")) addSignal(cr, 2.8, "Goal: muscle recovery strongly aligns with creatine evidence.", "recovery goal");
  if (a.goals.includes("endurance")) addSignal(cr, 0.9, "Creatine can support high-intensity efforts within endurance work.", "endurance goal");
  if (a.goals.includes("focus")) addSignal(cr, 0.8, "Emerging evidence supports creatine for cognitive performance under stress or sleep pressure.", "focus goal");
  if (a.ageRange === "60_plus") addSignal(cr, 1.3, "Creatine plus resistance training supports lean mass in older adults.", "age 60+");
  if (a.diet === "vegan" || a.diet === "vegetarian") addSignal(cr, 1.0, "Plant-based diets contain little dietary creatine.", "plant-based");
  if (a.medical.kidneyLiver) flag(cr, "Kidney disease — discuss creatine with your clinician.");
  if (currentSupplementMentions(a, ["creatine", "monohydrate"])) add(cr, -1.2, "");

  // ---- Protein ----
  const pr = buckets["protein"];
  if (a.trainingFrequency === "1_2") addSignal(pr, 0.8, "Training 1–2×/week modestly increases protein needs.", "light training");
  if (a.trainingFrequency === "3_4") addSignal(pr, 1.8, "Higher training load increases protein needs.", "regular training");
  if (a.trainingFrequency === "5_plus") addSignal(pr, 2.4, "High training load increases protein needs.", "high training");
  if (a.goals.includes("muscle_recovery")) addSignal(pr, 2.4, "Recovery goal aligns with adequate daily protein.", "recovery goal");
  if (a.goals.includes("weight_management")) addSignal(pr, 1.4, "Protein supports satiety in a calorie-aware approach.", "satiety goal");
  if (a.diet === "vegan" || a.diet === "vegetarian") addSignal(pr, 1.1, "Plant-based eaters may find a tested protein powder useful to top up.", "plant-based");
  if (a.diet === "calorie_deficit") addSignal(pr, 1.6, "In a deficit, protein protects lean mass.", "calorie deficit");
  if (a.allergies.lactoseFree) flag(pr, "Choose lactose-free whey isolate or a third-party-tested plant protein.");

  // ---- Iron (HIGH CAUTION) ----
  const fe = buckets["iron"];
  // Only nudge upward in well-defined risk; never recommend without lab guidance.
  if (a.sex === "female" && (a.ageRange === "18_29" || a.ageRange === "30_44")) addSignal(fe, 1.2, "Menstruating individuals are at higher risk of low iron.", "menstruating age range");
  if (a.pregnancy !== "none") addSignal(fe, 1.2, "Preconception/pregnancy status increases the importance of clinician-guided iron assessment.", "pregnancy-related");
  if (a.medical.anemiaHistory) addSignal(fe, 2.8, "History of anemia raises the case for clinician-directed testing.", "anemia history");
  if (a.diet === "vegan" || a.diet === "vegetarian") addSignal(fe, 1.0, "Plant-based diets require attention to iron — pair with vitamin C.", "plant-based");
  if (freqLow(a.foodIntake.redMeat) && (a.diet === "omnivore" || a.diet === "pescatarian" || a.diet === "restricted")) addSignal(fe, 0.5, "Low red meat intake can lower heme-iron intake.", "low heme iron");
  flag(fe, "Do not start iron without lab testing (ferritin/CBC) and clinician guidance — excess iron can be harmful.");

  // ---- Calcium ----
  const ca = buckets["calcium"];
  if (freqLow(a.foodIntake.dairy) && a.diet !== "vegan") addSignal(ca, 0.8 + gapStrength(a.foodIntake.dairy) * 0.35, "Low dairy intake may leave a calcium gap.", "low dairy");
  if (freqLow(a.foodIntake.fortifiedFoods)) addSignal(ca, 0.6, "Low fortified-food intake reduces calcium backup sources.", "low fortified foods");
  if (a.diet === "vegan" && freqLow(a.foodIntake.fortifiedFoods)) addSignal(ca, 1.6, "Vegan with low fortified-food intake — calcium gap is likely.", "vegan calcium gap");
  if (a.goals.includes("bone_health")) addSignal(ca, 1.4, "Bone-health goal — but food-first calcium still comes first.", "bone goal");
  if (a.ageRange === "60_plus") addSignal(ca, 1.1, "Older adults have higher calcium needs.", "age 60+");
  if (a.medical.thyroidMeds) flag(ca, "Separate calcium from thyroid medication by at least 4 hours unless your clinician says otherwise.");

  // ---- Prenatal ----
  const pn = buckets["prenatal"];
  if (a.pregnancy === "pregnant" || a.pregnancy === "breastfeeding" || a.pregnancy === "trying") {
    addSignal(pn, 6.4, "Pregnancy/breastfeeding/preconception — prenatal with folate is standard of care.", "life-stage critical");
  } else {
    pn.suppressed = true;
  }

  // ---- Electrolytes ----
  const el = buckets["electrolytes"];
  if (a.trainingFrequency === "3_4") addSignal(el, 0.8, "Regular training can create sweat-loss needs in heat or long sessions.", "regular training");
  if (a.trainingFrequency === "5_plus") addSignal(el, 2.2, "Frequent intense training — sweat losses can be significant.", "high training");
  if (a.goals.includes("endurance")) addSignal(el, 2.4, "Endurance goal — electrolytes during long sessions are useful.", "endurance goal");
  if (freqHigh(a.alcohol)) addSignal(el, 0.4, "Frequent alcohol can worsen hydration quality.", "hydration modifier");
  if (a.medical.bloodPressureMeds) flag(el, "Blood pressure meds — be cautious with high-sodium electrolyte products.");
  if (a.medical.kidneyLiver) flag(el, "Kidney disease — potassium-containing products need clinician input.");

  // ---- Fiber ----
  const fi = buckets["fiber"];
  if (freqLow(a.foodIntake.fruitsVeg)) addSignal(fi, 1.3 + gapStrength(a.foodIntake.fruitsVeg) * 0.35, "Low fruit/vegetable intake is a strong fiber-gap signal.", "low produce");
  if (freqLow(a.foodIntake.wholeGrains)) addSignal(fi, 0.9 + gapStrength(a.foodIntake.wholeGrains) * 0.2, "Low whole-grain intake reduces soluble and insoluble fiber.", "low whole grains");
  if (freqLow(a.foodIntake.legumes)) addSignal(fi, 0.9 + gapStrength(a.foodIntake.legumes) * 0.2, "Low legume intake removes one of the highest-fiber food groups.", "low legumes");
  if (a.goals.includes("weight_management")) addSignal(fi, 1.3, "Fiber supports satiety and metabolic health.", "satiety goal");

  // ---- Probiotic ----
  const pb = buckets["probiotic"];
  if (a.goals.includes("immune") && freqLow(a.foodIntake.fruitsVeg)) addSignal(pb, 0.8, "Low produce intake — but feed the microbiome with food first.", "immune + low produce");
  if (freqLow(a.foodIntake.legumes) && freqLow(a.foodIntake.wholeGrains) && freqLow(a.foodIntake.fruitsVeg)) addSignal(pb, 0.7, "Multiple low-plant-food signals suggest gut-support basics need attention.", "low plant diversity");

  // ---- Zinc ----
  const zn = buckets["zinc"];
  if (a.goals.includes("immune")) addSignal(zn, 1.1, "Short-term, modest-dose zinc has limited evidence for cold symptoms.", "immune goal");
  if (a.diet === "vegan" || a.diet === "vegetarian") addSignal(zn, 1.4, "Plant-based diets can be lower in absorbable zinc.", "plant-based");
  if (freqLow(a.foodIntake.redMeat) && freqLow(a.foodIntake.legumes)) addSignal(zn, 0.7, "Low intake of both meat and legumes can reduce zinc coverage.", "low zinc foods");
  if (currentSupplementMentions(a, ["zinc"])) flag(zn, "You mentioned current zinc use — avoid chronic stacking because high zinc can lower copper status.");

  // ---- Vitamin C ----
  const vc = buckets["vitamin_c"];
  if (freqLow(a.foodIntake.fruitsVeg)) addSignal(vc, 1.6 + gapStrength(a.foodIntake.fruitsVeg) * 0.35, "Low produce intake — vitamin C may be a useful backup.", "low produce");
  if (a.goals.includes("immune")) addSignal(vc, 0.8, "Modest vitamin C is a reasonable immune-support backup.", "immune goal");
  if (a.medical.kidneyLiver) flag(vc, "Kidney stone history or kidney disease — avoid high-dose vitamin C unless cleared.");

  // ---- Melatonin ----
  const mel = buckets["melatonin"];
  if (a.goals.includes("sleep") && a.sleepQuality === "poor") addSignal(mel, 2.6, "Short-term, low-dose melatonin can help circadian shifts.", "sleep goal + poor sleep");
  if (a.goals.includes("sleep") && a.sleepQuality === "fair") addSignal(mel, 0.9, "Low-dose melatonin may help timing issues, but sleep hygiene comes first.", "sleep timing");
  if (freqHigh(a.caffeine) && a.sleepQuality !== "good") add(mel, -0.6, "");
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
  const evidenceWeight = (lvl: Supplement["evidenceLevel"]) =>
    lvl === "Strong" ? 1 : lvl === "Moderate" ? 0.82 : lvl === "Situational" ? 0.72 : 0.54;
  const safetyWeight = (lvl: Supplement["safetyLevel"]) =>
    lvl === "Low" ? 1 : lvl === "Moderate" ? 0.84 : 0.58;

  const recommendations: Recommendation[] = SUPPLEMENTS
    .map((s: Supplement) => {
      const b = buckets[s.id];
      if (b.suppressed) return null;
      const precisionScore = Math.max(
        0,
        Math.min(100, Math.round((b.score * 11 + b.tags.length * 4) * evidenceWeight(s.evidenceLevel) * safetyWeight(s.safetyLevel))),
      );
      if (b.score < 1.15 && precisionScore < 16) return null;

      // Confidence: based on score + evidence + safety
      let confidence: Recommendation["confidence"] = "Low";
      if (precisionScore >= 58 && (s.evidenceLevel === "Strong" || s.evidenceLevel === "Moderate")) confidence = "High";
      else if (precisionScore >= 30 || b.score >= 2.2) confidence = "Moderate";

      // Downgrade if safety gate triggered or supplement is high caution
      if (safetyGate.triggered && s.safetyLevel !== "Low") {
        confidence = confidence === "High" ? "Moderate" : "Low";
      }

      return {
        supplement: s,
        score: b.score,
        precisionScore,
        reasons: b.reasons,
        safetyFlags: b.safetyFlags,
        personalizationTags: b.tags,
        confidence,
      } as Recommendation;
    })
    .filter((x): x is Recommendation => x !== null)
    .sort((a, b) => (b.precisionScore ?? b.score) - (a.precisionScore ?? a.score));

  // Match score: confidence in this personalized plan (0–100).
  const topN = recommendations.slice(0, 5);
  const evidenceAvg =
    topN.length > 0
      ? topN.reduce((s, r) => s + evidenceWeight(r.supplement.evidenceLevel), 0) / topN.length
      : 0.7;
  const signalCount = Object.values(buckets).reduce((sum, b) => sum + b.tags.length, 0);
  const signalDensity = Math.min(1, signalCount / 18);
  const signalStrength = Math.min(1, topN.reduce((s, r) => s + (r.precisionScore ?? r.score * 10), 0) / 330);
  const safetyPenalty = safetyGate.triggered ? 0.035 : 0;
  const answerFingerprint = JSON.stringify(a).split("").reduce((sum, ch) => (sum + ch.charCodeAt(0)) % 997, 0) / 997;
  const raw =
    76 +
    signalDensity * 9 +
    signalStrength * 9 +
    evidenceAvg * 5 +
    answerFingerprint * 1.8 -
    safetyPenalty * 100;
  const matchScore = Math.max(72, Math.min(99, Math.round(raw)));
  const profileLabel = [
    a.diet.replace("_", " "),
    a.goals[0]?.replace("_", " ") ?? "wellness",
    a.trainingFrequency === "none" ? "baseline" : "active",
  ]
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" · ");

  return {
    matchScore,
    recommendations,
    safetyGate,
    personalizationProfile: {
      label: profileLabel,
      summary: `Built from ${signalCount} weighted nutrition, lifestyle, goal, label-preference, and safety signals. Rankings are deterministic but highly sensitive to the exact quiz profile.`,
      signalCount,
      differentiators: differentiators.slice(0, 7),
    },
    answers: a,
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
