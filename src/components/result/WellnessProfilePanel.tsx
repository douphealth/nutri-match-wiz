import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Apple,
  Dumbbell,
  Sun,
  Moon,
  Brain,
  Wallet,
  Target,
  HeartPulse,
} from "lucide-react";
import type { QuizAnswers, EngineResult, Frequency, Goal } from "@/types/supplements";

const FREQ_SCORE: Record<Frequency, number> = {
  never: 0,
  rarely: 1,
  weekly: 2,
  often: 3,
  daily: 4,
};

type AxisKey = "Energy" | "Recovery" | "Sleep" | "Focus" | "Immunity" | "Foundations";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/** Derive a 6-axis wellness profile from quiz answers + engine output. */
function buildAxes(a: QuizAnswers, r: EngineResult): { axis: AxisKey; value: number }[] {
  const goalBoost = (g: Goal) => (a.goals.includes(g) ? 22 : 0);
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
    6.25; // → 0–100

  const recCount = r.recommendations.length;
  const recLift = Math.min(recCount * 6, 24);

  return [
    {
      axis: "Energy",
      value: clamp(40 + goalBoost("energy") + trainScore * 0.25 + recLift - (stressInv < 50 ? 10 : 0)),
    },
    {
      axis: "Recovery",
      value: clamp(35 + goalBoost("muscle_recovery") + trainScore * 0.35 + sleepScore * 0.2),
    },
    {
      axis: "Sleep",
      value: clamp(sleepScore + goalBoost("sleep") - (a.caffeine === "daily" ? 12 : 0)),
    },
    {
      axis: "Focus",
      value: clamp(45 + goalBoost("focus") + stressInv * 0.3 + sleepScore * 0.15),
    },
    {
      axis: "Immunity",
      value: clamp(40 + goalBoost("immune") + sunScore * 0.25 + dietBase * 0.25),
    },
    {
      axis: "Foundations",
      value: clamp(30 + dietBase * 0.5 + goalBoost("general_wellness") + recLift),
    },
  ];
}

function dietLabel(d: QuizAnswers["diet"]) {
  return {
    omnivore: "Omnivore",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    low_carb: "Low-carb",
    calorie_deficit: "Cutting",
    restricted: "Restricted",
  }[d];
}
function trainLabel(t: QuizAnswers["trainingFrequency"]) {
  return { none: "Rest mode", "1_2": "1–2 ×/wk", "3_4": "3–4 ×/wk", "5_plus": "5+ ×/wk" }[t];
}
function topGoalLabel(goals: Goal[]) {
  if (goals.length === 0) return "General wellness";
  const map: Record<Goal, string> = {
    energy: "Energy",
    muscle_recovery: "Recovery",
    endurance: "Endurance",
    weight_management: "Weight",
    sleep: "Sleep",
    general_wellness: "Wellness",
    bone_health: "Bone health",
    immune: "Immunity",
    focus: "Focus & mood",
  };
  return map[goals[0]];
}

export function WellnessProfilePanel({
  answers,
  result,
}: {
  answers: QuizAnswers;
  result: EngineResult;
}) {
  const axes = buildAxes(answers, result);

  const stats: { icon: typeof Apple; label: string; value: string }[] = [
    { icon: Target, label: "Top goal", value: topGoalLabel(answers.goals) },
    { icon: Apple, label: "Diet", value: dietLabel(answers.diet) },
    { icon: Dumbbell, label: "Training", value: trainLabel(answers.trainingFrequency) },
    {
      icon: Moon,
      label: "Sleep",
      value: answers.sleepQuality[0].toUpperCase() + answers.sleepQuality.slice(1),
    },
    { icon: Sun, label: "Sun", value: answers.sunExposure[0].toUpperCase() + answers.sunExposure.slice(1) },
    {
      icon: Brain,
      label: "Stress",
      value: answers.stress[0].toUpperCase() + answers.stress.slice(1),
    },
    {
      icon: HeartPulse,
      label: "Safety review",
      value: result.safetyGate.triggered ? "Clinician input" : "Standard",
    },
    {
      icon: Wallet,
      label: "Budget",
      value: { low: "Lean", moderate: "Moderate", premium: "Premium" }[answers.budget],
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-4 shadow-xl backdrop-blur-sm sm:p-6"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        {/* Radar */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/60 via-background/30 to-primary/5 p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Your wellness profile
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              Live
            </div>
          </div>

          <div className="h-[300px] w-full sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={axes} outerRadius="78%">
                <defs>
                  <linearGradient id="profileFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--primary-glow)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <PolarGrid
                  stroke="hsl(var(--border) / 0.55)"
                  strokeDasharray="2 4"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#profileFill)"
                  isAnimationActive
                  animationDuration={900}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Six axes · derived from your answers
          </p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/60"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </div>
              <div className="mt-1 text-lg font-bold leading-tight text-foreground">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
