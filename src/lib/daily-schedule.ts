import type { QuizAnswers, Recommendation } from "@/types/supplements";

export type TimeSlot =
  | "morning"
  | "with_breakfast"
  | "midday"
  | "with_lunch"
  | "pre_workout"
  | "post_workout"
  | "with_dinner"
  | "evening";

export const SLOT_LABEL: Record<TimeSlot, string> = {
  morning: "Morning (on waking)",
  with_breakfast: "With breakfast",
  midday: "Midday",
  with_lunch: "With lunch",
  pre_workout: "30–60 min pre-workout",
  post_workout: "Within 60 min post-workout",
  with_dinner: "With dinner",
  evening: "Evening (30–60 min before bed)",
};

export const SLOT_ORDER: TimeSlot[] = [
  "morning",
  "with_breakfast",
  "midday",
  "with_lunch",
  "pre_workout",
  "post_workout",
  "with_dinner",
  "evening",
];

export interface DoseStep {
  slot: TimeSlot;
  dose: string;
  form: string;
  withFood: "with food" | "empty stomach" | "either";
  cadence: "Daily" | "5×/week" | "Training days" | "As needed" | "Short-term only";
  notes: string;
}

export interface ProtocolBlueprint {
  steps: DoseStep[];
  weeklyNotes?: string[];
  separationWarnings?: string[];
  startProtocol?: string;
}

function basePlan(id: string, a: QuizAnswers): ProtocolBlueprint | null {
  const training = a.trainingFrequency;
  const trains = training !== "none";
  const preferPM = a.sleepQuality !== "good";

  switch (id) {
    case "vitamin_d":
      return {
        steps: [
          {
            slot: "with_breakfast",
            dose: a.sunExposure === "low" || a.ageRange === "60_plus" ? "1000–2000 IU (25–50 mcg) D3" : "800–1000 IU (20–25 mcg) D3",
            form: "Softgel or drops",
            withFood: "with food",
            cadence: "Daily",
            notes: "Fat-soluble — pairs best with a meal containing healthy fat.",
          },
        ],
        weeklyNotes: [
          "Test 25(OH)D after 8–12 weeks; aim for 30–50 ng/mL unless your clinician sets another target.",
        ],
        startProtocol: "Start at the lower end for 4 weeks, then reassess via labs before increasing.",
      };

    case "b12":
      return {
        steps: [
          {
            slot: "morning",
            dose: a.diet === "vegan" ? "500–1000 mcg methylcobalamin" : "250–500 mcg methylcobalamin",
            form: "Sublingual lozenge or capsule",
            withFood: "either",
            cadence: a.diet === "vegan" ? "Daily" : "5×/week",
            notes: "Best absorbed away from large mineral doses (calcium, iron).",
          },
        ],
        weeklyNotes: [
          "Recheck serum B12 + MMA at 3–6 months if symptoms (fatigue, tingling) persist.",
        ],
        startProtocol: "Loading not needed for oral maintenance — steady daily dose is more reliable.",
      };

    case "omega3":
      return {
        steps: [
          {
            slot: "with_dinner",
            dose: "1–2 g combined EPA + DHA (read the back label, not front)",
            form: "Triglyceride-form fish oil or algal oil",
            withFood: "with food",
            cadence: "Daily",
            notes: "Refrigerate after opening; fishy burps mean it has oxidized — replace it.",
          },
        ],
        weeklyNotes: [
          "Eat oily fish 1–2× weekly if possible — supplements top up, they don't replace whole-food omega-3.",
        ],
        startProtocol: a.medical.bloodThinners
          ? "Discuss with your clinician before exceeding 1 g/day combined EPA+DHA."
          : "Start at 1 g/day for 2 weeks; titrate if tolerated.",
      };

    case "magnesium":
      return {
        steps: [
          {
            slot: "evening",
            dose: "200–400 mg elemental magnesium glycinate",
            form: "Capsule (glycinate or bisglycinate for sleep, citrate for regularity)",
            withFood: "either",
            cadence: "Daily",
            notes: preferPM
              ? "Pair with your wind-down routine — helps if poor sleep is a driver."
              : "Evening dose supports muscle relaxation and overnight recovery.",
          },
        ],
        weeklyNotes: ["If loose stools occur, split the dose or switch form (glycinate is gentlest)."],
        startProtocol: "Start at 200 mg for 5 nights, then increase by 100 mg if needed.",
      };

    case "creatine":
      return {
        steps: trains
          ? [
              {
                slot: "post_workout",
                dose: "3–5 g creatine monohydrate",
                form: "Micronized powder, dissolved in water or a recovery drink",
                withFood: "with food",
                cadence: "Daily",
                notes: "Post-workout with carbs has a small absorption edge; on rest days, any time works.",
              },
            ]
          : [
              {
                slot: "with_breakfast",
                dose: "3–5 g creatine monohydrate",
                form: "Micronized powder",
                withFood: "with food",
                cadence: "Daily",
                notes: "Consistency matters more than timing — saturate the muscle pool over ~3 weeks.",
              },
            ],
        weeklyNotes: ["Drink water throughout the day. No loading phase needed at 5 g/day."],
        startProtocol: "Skip the 20 g loading phase — 5 g/day reaches saturation in ~21 days with fewer GI complaints.",
      };

    case "protein":
      return {
        steps: trains
          ? [
              {
                slot: "post_workout",
                dose: "25–40 g protein (whey isolate, casein, or pea+rice blend)",
                form: "Shake or smoothie",
                withFood: "either",
                cadence: "Training days",
                notes: "Aim for total daily protein of 1.6–2.2 g per kg bodyweight, split into 3–4 meals.",
              },
            ]
          : [
              {
                slot: "with_breakfast",
                dose: "20–30 g protein",
                form: "Shake or added to oatmeal/yogurt",
                withFood: "either",
                cadence: "Daily",
                notes: "Use to plug the smallest protein meal of your day — usually breakfast.",
              },
            ],
        weeklyNotes: ["Track total daily protein for one week — the gap is usually breakfast or snacks."],
      };

    case "iron":
      return {
        steps: [
          {
            slot: "morning",
            dose: "18–25 mg elemental iron (bisglycinate is gentler) — only if labs confirm need",
            form: "Capsule",
            withFood: "empty stomach",
            cadence: "Daily",
            notes: "Take with 100–200 mg vitamin C; avoid coffee, tea, calcium, and dairy within 2 hours.",
          },
        ],
        weeklyNotes: [
          "Alternate-day dosing (Mon/Wed/Fri) often raises ferritin as fast as daily, with fewer GI side effects.",
          "Recheck ferritin + CBC at 8–12 weeks.",
        ],
        startProtocol: "Do not start without baseline ferritin + CBC and clinician approval.",
      };

    case "calcium":
      return {
        steps: [
          {
            slot: "with_lunch",
            dose: "500 mg calcium citrate",
            form: "Capsule or chew (citrate absorbs without stomach acid)",
            withFood: "with food",
            cadence: "Daily",
            notes: "Cap single doses at 500–600 mg — higher doses don't absorb well.",
          },
        ],
        weeklyNotes: ["Food-first: dairy, fortified plant milks, tofu, leafy greens. Most adults don't need a supplement if diet covers it."],
        separationWarnings: a.medical.thyroidMeds
          ? ["Separate from thyroid medication by at least 4 hours."]
          : undefined,
      };

    case "prenatal":
      return {
        steps: [
          {
            slot: "with_breakfast",
            dose: "1 serving prenatal (look for 400–800 mcg folate as 5-MTHF, 150 mcg iodine, choline, B12)",
            form: "Capsule or chewable",
            withFood: "with food",
            cadence: "Daily",
            notes: "If iron causes nausea, split the dose or move to dinner.",
          },
        ],
        weeklyNotes: ["Continue throughout breastfeeding. Coordinate dose changes with your OB or midwife."],
      };

    case "electrolytes":
      return {
        steps: [
          {
            slot: trains ? "pre_workout" : "midday",
            dose: "1 sachet (≈500–1000 mg sodium, ~200 mg potassium, ~60 mg magnesium) in 500 ml water",
            form: "Powder stick",
            withFood: "either",
            cadence: trains ? "Training days" : "As needed",
            notes: "Use on hot days, long sessions (>60 min), or after sauna. Plain water is fine otherwise.",
          },
        ],
        weeklyNotes: a.medical.bloodPressureMeds
          ? ["High-sodium products can interact with BP medication — pick a low-sodium variant or discuss with your clinician."]
          : ["Skip on light days — over-sodiating is a real thing."],
      };

    case "fiber":
      return {
        steps: [
          {
            slot: "evening",
            dose: "5 g psyllium husk in 300 ml water",
            form: "Powder",
            withFood: "either",
            cadence: "Daily",
            notes: "Drink immediately — it gels fast. Increases satiety and feeds gut microbes.",
          },
        ],
        weeklyNotes: ["Food-first: aim for 25–35 g total fiber/day from beans, oats, fruit, vegetables, nuts."],
        startProtocol: "Start at 3 g/day for a week to let your gut adjust, then scale up.",
      };

    case "probiotic":
      return {
        steps: [
          {
            slot: "morning",
            dose: "1 capsule (10–50 billion CFU, multi-strain)",
            form: "Capsule",
            withFood: "either",
            cadence: "Daily",
            notes: "Pick a brand that lists strains by full name (e.g., L. rhamnosus GG) and a CFU at expiration.",
          },
        ],
        weeklyNotes: ["Feed the microbiome with fiber and fermented foods — probiotics work best with prebiotics."],
        startProtocol: "Trial for 6–8 weeks; if no symptom change, stop or switch strain.",
      };

    case "zinc":
      return {
        steps: [
          {
            slot: "with_dinner",
            dose: "8–15 mg zinc bisglycinate or picolinate (short-term)",
            form: "Capsule or lozenge (during colds)",
            withFood: "with food",
            cadence: "Short-term only",
            notes: "Avoid chronic high doses (>40 mg/day) — they can lower copper status.",
          },
        ],
        weeklyNotes: ["Limit ongoing supplementation to ≤12 weeks unless directed; food-first via meat, shellfish, legumes."],
      };

    case "vitamin_c":
      return {
        steps: [
          {
            slot: "with_breakfast",
            dose: "200–500 mg vitamin C (split if higher)",
            form: "Capsule or chew",
            withFood: "either",
            cadence: "Daily",
            notes: "Pairs well with plant-based iron meals (citrus + lentils, etc.).",
          },
        ],
        weeklyNotes: ["Food-first via citrus, peppers, berries, kiwi — easy to hit 200 mg from food alone."],
      };

    case "melatonin":
      return {
        steps: [
          {
            slot: "evening",
            dose: "0.3–1 mg melatonin (start low — more isn't better)",
            form: "Sublingual or fast-release tablet",
            withFood: "either",
            cadence: "Short-term only",
            notes: "Take 30–60 min before target bedtime. Pair with dim light + screens off.",
          },
        ],
        weeklyNotes: [
          "Use for circadian shifts (jet lag, shift changes) — not as a nightly sedative.",
          "If you need it >2 weeks, address sleep hygiene and stimulant timing first.",
        ],
      };

    default:
      return null;
  }
}

export function buildProtocol(rec: Recommendation, a: QuizAnswers): ProtocolBlueprint | null {
  return basePlan(rec.supplement.id, a);
}

export interface ScheduledDose extends DoseStep {
  supplementId: string;
  supplementName: string;
}

export interface DailySchedule {
  bySlot: { slot: TimeSlot; label: string; doses: ScheduledDose[] }[];
  totalDoses: number;
  trainingDayAdjustments: string[];
  globalSeparations: string[];
}

export function buildDailySchedule(
  recs: Recommendation[],
  a: QuizAnswers,
): DailySchedule {
  const bucket: Record<string, ScheduledDose[]> = {};
  const trainingDayAdjustments: string[] = [];
  const globalSeparations: string[] = [];

  for (const rec of recs) {
    const proto = buildProtocol(rec, a);
    if (!proto) continue;
    for (const step of proto.steps) {
      const name = rec.supplement.name.replace(/\s*\([^)]*\)/g, "");
      (bucket[step.slot] ||= []).push({
        ...step,
        supplementId: rec.supplement.id,
        supplementName: name,
      });
      if (step.cadence === "Training days" && a.trainingFrequency === "none") {
        trainingDayAdjustments.push(`${name}: skip on non-training days.`);
      }
    }
  }

  if (a.medical.thyroidMeds) {
    globalSeparations.push("Separate calcium, iron, and magnesium from thyroid medication by 4+ hours.");
  }
  if (a.medical.medications) {
    globalSeparations.push("If you take any prescription medication, separate supplements by 2+ hours unless told otherwise.");
  }
  if (recs.some((r) => r.supplement.id === "iron")) {
    globalSeparations.push("Keep iron away from coffee, tea, dairy, and calcium by 2 hours; pair with vitamin C.");
  }

  const bySlot = SLOT_ORDER.filter((s) => bucket[s]?.length).map((slot) => ({
    slot,
    label: SLOT_LABEL[slot],
    doses: bucket[slot],
  }));

  const totalDoses = bySlot.reduce((sum, s) => sum + s.doses.length, 0);
  return { bySlot, totalDoses, trainingDayAdjustments, globalSeparations };
}
