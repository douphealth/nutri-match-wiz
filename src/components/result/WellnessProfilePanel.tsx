import { motion } from "framer-motion";
import {
  Apple,
  Dumbbell,
  Sun,
  Moon,
  Brain,
  Wallet,
  Target,
  HeartPulse,
  Flame,
  Activity,
  BedDouble,
  Sparkles,
  ShieldCheck,
  Leaf,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { QuizAnswers, EngineResult, Frequency, Goal } from "@/types/supplements";

// ---------------------------------------------------------------------------
// Axis derivation
// ---------------------------------------------------------------------------

const FREQ_SCORE: Record<Frequency, number> = {
  never: 0,
  rarely: 1,
  weekly: 2,
  often: 3,
  daily: 4,
};

type AxisKey = "Energy" | "Recovery" | "Sleep" | "Focus" | "Immunity" | "Foundations";

interface AxisRow {
  key: AxisKey;
  value: number; // 0–100
  icon: LucideIcon;
  meaning: string; // what the axis measures
  driver: string; // why the user scored where they did
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

function buildAxes(a: QuizAnswers, r: EngineResult): AxisRow[] {
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
      icon: Flame,
      value: clamp(
        40 + goalBoost("energy") + trainScore * 0.25 + recLift - (stressInv < 50 ? 10 : 0),
      ),
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
      icon: Activity,
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
      icon: BedDouble,
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
      icon: Brain,
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
      icon: ShieldCheck,
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
      icon: Leaf,
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

// ---------------------------------------------------------------------------
// Archetype
// ---------------------------------------------------------------------------

function archetype(axes: AxisRow[], a: QuizAnswers) {
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

function tier(v: number) {
  if (v >= 80) return { label: "Peak", color: "text-emerald-400", bar: "from-emerald-400 to-emerald-300" };
  if (v >= 60) return { label: "Strong", color: "text-primary", bar: "from-primary to-primary-glow" };
  if (v >= 40) return { label: "Building", color: "text-amber-400", bar: "from-amber-400 to-amber-300" };
  return { label: "Needs work", color: "text-rose-400", bar: "from-rose-400 to-rose-300" };
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const dietLabel = (d: QuizAnswers["diet"]) =>
  ({
    omnivore: "Omnivore",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    low_carb: "Low-carb",
    calorie_deficit: "Cutting",
    restricted: "Restricted",
  })[d];

const trainLabel = (t: QuizAnswers["trainingFrequency"]) =>
  ({ none: "Rest mode", "1_2": "1–2 ×/wk", "3_4": "3–4 ×/wk", "5_plus": "5+ ×/wk" })[t];

const topGoalLabel = (goals: Goal[]) => {
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
};
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WellnessProfilePanel({
  answers,
  result,
}: {
  answers: QuizAnswers;
  result: EngineResult;
}) {
  const axes = buildAxes(answers, result);
  const arche = archetype(axes, answers);
  const overall = Math.round(axes.reduce((s, a) => s + a.value, 0) / axes.length);
  const strongest = [...axes].sort((a, b) => b.value - a.value)[0];
  const weakest = [...axes].sort((a, b) => a.value - b.value)[0];

  const lifestyle: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Target, label: "Top goal", value: topGoalLabel(answers.goals) },
    { icon: Apple, label: "Diet", value: dietLabel(answers.diet) },
    { icon: Dumbbell, label: "Training", value: trainLabel(answers.trainingFrequency) },
    { icon: Moon, label: "Sleep", value: cap(answers.sleepQuality) },
    { icon: Sun, label: "Sun", value: cap(answers.sunExposure) },
    { icon: HeartPulse, label: "Stress", value: cap(answers.stress) },
    {
      icon: ShieldCheck,
      label: "Safety",
      value: result.safetyGate.triggered ? "Clinician" : "Standard",
    },
    {
      icon: Wallet,
      label: "Budget",
      value: { low: "Lean", moderate: "Moderate", premium: "Premium" }[answers.budget],
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-5 shadow-2xl backdrop-blur-md sm:p-8"
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
      />

      {/* Hero header */}
      <header className="relative mb-7 flex flex-col gap-5 border-b border-border/50 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Your wellness profile
          </div>
          <h2
            className="mt-3 font-bold leading-[1.02] tracking-tight text-foreground"
            style={{ fontSize: "clamp(1.65rem, 3.4vw, 2.6rem)" }}
          >
            <span className="text-gradient">{arche.name}</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {arche.tagline}
          </p>
        </div>

        <div className="flex items-center gap-5 sm:gap-7">
          <ScoreRing value={overall} label="Overall" />
          <div className="hidden h-14 w-px bg-border/60 sm:block" />
          <div className="space-y-1.5">
            <MiniStat
              tint="emerald"
              label="Strongest"
              value={strongest.key}
              detail={`${strongest.value}/100`}
            />
            <MiniStat
              tint="amber"
              label="Focus on next"
              value={weakest.key}
              detail={`${weakest.value}/100`}
            />
          </div>
        </div>
      </header>

      {/* Radar + per-axis breakdown */}
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Radar */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/80 via-background/40 to-primary/10 p-4 sm:p-6">
          {/* corner accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.18),transparent_55%)]"
          />
          <div className="relative mb-2 flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Six-axis radar
            </div>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              0–100 scale
            </span>
          </div>

          <div className="relative">
            <SixAxisRadar axes={axes} />
          </div>

          <div className="relative mt-1 flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Derived from your goals, sleep, training, diet & stress signals.
          </div>
        </div>

        {/* Per-axis explainer cards */}
        <div className="grid gap-3">
          {axes.map(({ key, value, icon: Icon, meaning, driver }) => {
            const t = tier(value);
            return (
              <div
                key={key}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.9} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                        {key}
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold tabular-nums text-foreground">
                          {value}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          /100
                        </span>
                        <span
                          className={`ml-1 rounded-md border border-current/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${t.color}`}
                        >
                          {t.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${t.bar} transition-all`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground/80">{meaning}</span>{" "}
                  <span className="text-muted-foreground">{driver}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifestyle strip */}
      <div className="relative mt-7">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px flex-1 bg-border/60" />
          The inputs behind your profile
          <span className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {lifestyle.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/60"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </div>
                <div className="truncate text-sm font-bold text-foreground">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function ScoreRing({ value, label }: { value: number; label: string }) {
  const circ = 2 * Math.PI * 30;
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="-rotate-90">
        <circle cx="36" cy="36" r="30" stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
        <circle
          cx="36"
          cy="36"
          r="30"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circ} ${circ}`}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-glow)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

function MiniStat({
  tint,
  label,
  value,
  detail,
}: {
  tint: "emerald" | "amber";
  label: string;
  value: string;
  detail: string;
}) {
  const dot = tint === "emerald" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <div className="leading-tight">
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="text-xs font-bold text-foreground">
          {value} <span className="text-muted-foreground tabular-nums">· {detail}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SixAxisRadar — hand-crafted SVG radar
// ---------------------------------------------------------------------------

function SixAxisRadar({ axes }: { axes: AxisRow[] }) {
  // Wider canvas + horizontal padding so long labels ("FOUNDATIONS", "RECOVERY")
  // never clip on the left/right edges.
  const W = 620;
  const H = 500;
  const cx = W / 2;
  const cy = H / 2 + 6;
  const R = 150; // outer ring radius
  const rings = [0.25, 0.5, 0.75, 1];
  const n = axes.length;
  // start at top, clockwise
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  const ringPath = (r: number) =>
    axes
      .map((_, i) => {
        const p = point(i, r);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  const dataPoints = axes.map((a, i) => point(i, (a.value / 100) * R));
  const dataPath =
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ") + " Z";

  // label radius outside outer ring
  const labelR = R + 44;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto block h-auto w-full max-w-[620px]"
      role="img"
      aria-label="Six-axis wellness radar"
    >

      <defs>
        {/* Frosted polygon fill */}
        <radialGradient id="radarFill" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity={0.55} />
          <stop offset="55%" stopColor="var(--primary)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.08} />
        </radialGradient>
        {/* Stroke gradient */}
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary-glow)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        {/* Ring sheen */}
        <radialGradient id="ringSheen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Spoke gradient */}
        <linearGradient id="spokeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--border) / 0.05)" />
          <stop offset="50%" stopColor="hsl(var(--border) / 0.55)" />
          <stop offset="100%" stopColor="hsl(var(--border) / 0.05)" />
        </linearGradient>
        {/* Soft glow */}
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer sheen disk */}
      <circle cx={cx} cy={cy} r={R + 10} fill="url(#ringSheen)" />

      {/* Concentric rings */}
      {rings.map((t, idx) => (
        <path
          key={idx}
          d={ringPath(R * t)}
          fill="none"
          stroke="hsl(var(--border) / 0.55)"
          strokeWidth={idx === rings.length - 1 ? 1.25 : 0.75}
          strokeDasharray={idx === rings.length - 1 ? "0" : "2 5"}
        />
      ))}

      {/* Radial scale labels (25/50/75/100) along the top spoke */}
      {rings.map((t, idx) => (
        <text
          key={`s-${idx}`}
          x={cx + 4}
          y={cy - R * t + 3}
          fontSize={8.5}
          fill="hsl(var(--muted-foreground))"
          fontWeight={600}
          letterSpacing={0.4}
          opacity={0.7}
        >
          {Math.round(t * 100)}
        </text>
      ))}

      {/* Spokes */}
      {axes.map((_, i) => {
        const p = point(i, R);
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="url(#spokeGrad)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon — animated draw-in */}
      <motion.path
        d={dataPath}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth={2.25}
        strokeLinejoin="round"
        filter="url(#softGlow)"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Crisp inner stroke (no glow) for definition */}
      <path
        d={dataPath}
        fill="none"
        stroke="var(--primary)"
        strokeOpacity={0.9}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Vertex dots + value bubbles */}
      {axes.map((a, i) => {
        const p = dataPoints[i];
        const outer = point(i, labelR);
        const valueBubble = point(i, (a.value / 100) * R + 14);
        const t = tier(a.value);
        const dotColor =
          a.value >= 80
            ? "rgb(74 222 128)"
            : a.value >= 60
              ? "var(--primary)"
              : a.value >= 40
                ? "rgb(251 191 36)"
                : "rgb(251 113 133)";
        return (
          <g key={`v-${i}`}>
            {/* glow halo */}
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={9}
              fill={dotColor}
              opacity={0.18}
              filter="url(#dotGlow)"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
            {/* outer ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r={5.5}
              fill="hsl(var(--background))"
              stroke={dotColor}
              strokeWidth={1.75}
            />
            {/* inner dot */}
            <circle cx={p.x} cy={p.y} r={2.25} fill={dotColor} />

            {/* axis label cluster outside */}
            <g
              transform={`translate(${outer.x},${outer.y})`}
              textAnchor={
                Math.abs(outer.x - cx) < 4 ? "middle" : outer.x > cx ? "start" : "end"
              }
            >
              <text
                y={-4}
                fill="hsl(var(--foreground))"
                fontSize={11.5}
                fontWeight={700}
                letterSpacing={0.5}
              >
                {a.key.toUpperCase()}
              </text>
              <text
                y={10}
                fill={dotColor}
                fontSize={11}
                fontWeight={700}
                opacity={0.95}
              >
                {a.value}
                <tspan fill="hsl(var(--muted-foreground))" fontSize={8.5} fontWeight={600}>
                  {" "}
                  · {t.label}
                </tspan>
              </text>
            </g>

            {/* mini value bubble next to vertex (skip when too close to label) */}
            <g pointerEvents="none">
              <rect
                x={valueBubble.x - 12}
                y={valueBubble.y - 8}
                width={24}
                height={14}
                rx={7}
                fill="hsl(var(--background) / 0.9)"
                stroke={dotColor}
                strokeOpacity={0.4}
                strokeWidth={0.75}
              />
              <text
                x={valueBubble.x}
                y={valueBubble.y + 2.5}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight={700}
                fill={dotColor}
              >
                {a.value}
              </text>
            </g>
          </g>
        );
      })}

      {/* Center hub */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="hsl(var(--background))"
        stroke="var(--primary)"
        strokeWidth={1.25}
      />
      <circle cx={cx} cy={cy} r={1.5} fill="var(--primary)" />
    </svg>
  );
}
