import { motion } from "framer-motion";
import {
  ArrowRight,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Pill,
  Activity,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onStart: () => void;
}

const FEATURES = [
  { icon: Pill, title: "SUPPLEMENT PROFILE", sub: "Personalized stack" },
  { icon: Activity, title: "FOOD-FIRST PLAN", sub: "Diet before pills" },
  { icon: HeartPulse, title: "SAFETY GATES", sub: "Med interactions" },
];

const REFS = ["NIH ODS", "ISSN", "ACSM", "EFSA"];

export default function QuizHero({ onStart }: Props) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
        {/* Top pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Personalized · Evidence-aware · Free
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-balance font-bold uppercase leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 8vw, 6rem)" }}
        >
          <span className="block">FIND YOUR</span>
          <span className="block text-gradient drop-shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_40%,transparent)]">
            PERFECT STACK
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          19 expert questions. One personalized supplement plan. Vitamins, minerals and performance
          aids — scored against your diet, training, lifestyle and medications, with safety gates
          built in.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-2 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {FEATURES.map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="glass group flex flex-col items-center gap-3 rounded-2xl px-5 py-6 transition-all hover:-translate-y-0.5 hover:glow-primary-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30 group-hover:bg-primary/25">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="mt-4 flex w-full max-w-md flex-col items-center gap-3"
        >
          <Button
            size="lg"
            onClick={onStart}
            className="group h-14 w-full rounded-2xl bg-gradient-primary text-base font-bold uppercase tracking-[0.18em] glow-primary animate-pulse-glow hover:translate-y-[-1px]"
          >
            Get My Match
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> No signup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> ~90 seconds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-primary" /> Transparent scoring
            </span>
          </div>
        </motion.div>

        {/* Trust counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-bold text-primary">23,914</span>
          <span className="text-muted-foreground">personalized plans built this month</span>
        </motion.div>

        {/* References row */}
        <div className="mt-2 flex flex-col items-center gap-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Scoring engine references peer-reviewed sources
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {REFS.map((r) => (
              <span
                key={r}
                className="rounded-md border border-border/60 bg-card/50 px-3 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
          Educational only. Not medical advice. Talk with a qualified clinician, pharmacist, or
          registered dietitian before starting, stopping, or changing supplements.
        </p>
      </div>
    </section>
  );
}
