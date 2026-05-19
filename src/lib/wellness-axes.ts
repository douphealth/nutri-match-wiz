// Shared 6-axis derivation used by WellnessProfilePanel (UI) and pdf-report (PDF).
// Single source of truth so the panel and PDF never drift.
import type { QuizAnswers, EngineResult, Frequency, Goal } from "@/types/supplements";

export type AxisKey = "Energy" | "Recovery" | "Sleep" | "Focus" | "Immunity" | "Foundations";

export interface AxisRow {
  key: AxisKey;
  value: number; // 0–100
  meaning: string;
  driver: string;
}

const FREQ_SCORE: Record<Frequency, number> = {
  never: 0,
  rarely: 1,
  weekly: 2,
  often: 3,
  daily: 4,
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

export function buildAxes(a: QuizAnswers, r: EngineResult): AxisRow[] {
  const has = (g: Goal) => a.goals.includes(g);
  const goalBoost = (g: Goal) => (has(g) ? 22 : 0);
  const trainScore = { none: 0, "1_2": 35, "3_4": 65, "5_plus": 90 }[a.trainingFrequency];
  const sleepScore = { poor: 25, fair: 55, good: 85 }[a.sleepQuality];
  const stressInv = { low: 85, moderate: 55, high: 28 }[a.stress];
  const sunScore = { low: 30, moderate: 60, high: 88 }[a.sunExposure];
  const diet = a.foodIntake;
  const dietBase =
    (FREQ_SCORE[diet.fruitsVeg] +
      FREQ_SCORE[diet.wholeGrains] +
      FREQ_SCORE[diet.legumes] +
      FREQ_SCORE[diet.oilyFish]) *
    6.25;
  const recLift = Math.min(r.recommendations.length * 6, 24);

  return [
    {
      key: "Energy",
      value: clamp(40 + goalBoost("energy") + trainScore * 0.25 + recLift - (stressInv < 50 ? 10 : 0)),
      meaning: "Steady daily output — not stimulant highs.",
      driver:
        a.stress === "high"
          ? "High stress is taxing your reserves."
          : has("energy")
            ? "Energy is a stated goal — engine prioritized it."
            : "Baseline from training + diet signals.",
    },
    {
      key: "Recovery",
      value: clamp(35 + goalBoost("muscle_recovery") + trainScore * 0.35 + sleepScore * 0.2),
      meaning: "How well you bounce back from training & life load.",
      driver:
        a.trainingFrequency === "5_plus"
          ? "5+ sessions/wk demands real recovery inputs."
          : a.sleepQuality === "poor"
            ? "Poor sleep is capping your recovery ceiling."
            : "Training volume + sleep set this baseline.",
    },
    {
      key: "Sleep",
      value: clamp(sleepScore + goalBoost("sleep") - (a.caffeine === "daily" ? 12 : 0)),
      meaning: "Quality of nightly restoration.",
      driver:
        a.caffeine === "daily"
          ? "Daily caffeine may be eroding deep sleep."
          : a.sleepQuality === "good"
            ? "Your reported sleep quality is strong."
            : "Reported sleep quality drives this score.",
    },
    {
      key: "Focus",
      value: clamp(45 + goalBoost("focus") + stressInv * 0.3 + sleepScore * 0.15),
      meaning: "Clarity, mood, cognitive endurance.",
      driver:
        a.stress === "high"
          ? "High stress is the biggest drag on focus."
          : has("focus")
            ? "Focus & mood is a goal — prioritized in scoring."
            : "Sleep + stress balance set this baseline.",
    },
    {
      key: "Immunity",
      value: clamp(40 + goalBoost("immune") + sunScore * 0.25 + dietBase * 0.25),
      meaning: "Resilience to seasonal stress & illness.",
      driver:
        a.sunExposure === "low"
          ? "Low sun exposure suggests vitamin D risk."
          : dietBase > 60
            ? "Diet diversity is supporting immune resilience."
            : "Sun exposure + diet diversity set this.",
    },
    {
      key: "Foundations",
      value: clamp(30 + dietBase * 0.5 + goalBoost("general_wellness") + recLift),
      meaning: "Whole-food nutrient base — the floor everything sits on.",
      driver:
        dietBase < 40
          ? "Diet diversity is the weakest link to address first."
          : dietBase > 70
            ? "Strong whole-food base — supplements just top off gaps."
            : "Mid-range diet diversity — room to grow.",
    },
  ];
}

export function tierForAxis(v: number): { label: string; rgb: readonly [number, number, number] } {
  if (v >= 80) return { label: "Peak", rgb: [74, 222, 128] };
  if (v >= 60) return { label: "Strong", rgb: [114, 220, 188] };
  if (v >= 40) return { label: "Building", rgb: [251, 191, 36] };
  return { label: "Needs work", rgb: [251, 113, 133] };
}

export interface ArchetypeInfo {
  name: string;
  tagline: string;
}

export function archetypeFor(axes: AxisRow[], a: QuizAnswers): ArchetypeInfo {
  const by = Object.fromEntries(axes.map((x) => [x.key, x.value])) as Record<AxisKey, number>;
  if (a.trainingFrequency === "5_plus" || by.Recovery >= 70)
    return {
      name: "The High-Output Athlete",
      tagline: "Your body is training hard — recovery and foundations are the limiters.",
    };
  if (by.Sleep < 50 || by.Focus < 50)
    return {
      name: "The Cognitive Rebuilder",
      tagline: "Sleep and focus need shoring up before chasing performance stacks.",
    };
  if (by.Immunity < 55 || by.Foundations < 50)
    return {
      name: "The Foundation Builder",
      tagline: "Lock in whole-food nutrients and daily essentials first.",
    };
  if (a.goals.includes("weight_management"))
    return {
      name: "The Body Composition Operator",
      tagline: "Calorie discipline plus targeted gap-fillers — not magic pills.",
    };
  return {
    name: "The Steady Generalist",
    tagline: "Well-rounded baseline — small, targeted additions move the needle.",
  };
}
