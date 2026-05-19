import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Activity,
  ShieldCheck,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const STEPS = [
  { icon: Brain, label: "Parsing your wellness signals", detail: "29 inputs · 6 health axes" },
  { icon: Activity, label: "Mapping nutrient gaps", detail: "Diet × training × lifestyle" },
  { icon: ShieldCheck, label: "Running safety checks", detail: "Medications · pregnancy · allergies" },
  { icon: FlaskConical, label: "Scoring 80+ supplements", detail: "Evidence-weighted ranking" },
  { icon: Sparkles, label: "Compiling your personalized stack", detail: "Sequencing dose & timing" },
];

interface Props {
  onDone: () => void;
  /** total duration in ms */
  durationMs?: number;
}

export default function AnalyzingScreen({ onDone, durationMs = 3200 }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = durationMs / STEPS.length;
    const tick = 30;
    const start = Date.now();

    const stepTimer = setInterval(() => {
      setActiveStep((s) => Math.min(STEPS.length - 1, s + 1));
    }, stepInterval);

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);
      if (elapsed >= durationMs) {
        clearInterval(progressTimer);
        clearInterval(stepTimer);
        onDone();
      }
    }, tick);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [durationMs, onDone]);

  return (
    <div className="relative isolate flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-10 h-[280px] w-[280px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 p-8 sm:p-10"
      >
        {/* Orbital animation */}
        <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
          </motion.div>
          <motion.div
            className="absolute inset-3 rounded-full border border-primary/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/80" />
          </motion.div>
          <motion.div
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-[0_0_40px_-5px_var(--primary)]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="h-7 w-7 text-primary-foreground" />
          </motion.div>
        </div>

        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Analyzing your profile
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Finding your <span className="text-gradient">supplement match</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crunching your answers across evidence, safety, and personal goals.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Processing</span>
            <span className="tabular-nums text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-primary"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.03 }}
            />
          </div>
        </div>

        {/* Step list */}
        <ul className="mt-7 space-y-2">
          {STEPS.map((s, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            const Icon = s.icon;
            return (
              <li
                key={s.label}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  active
                    ? "border-primary/40 bg-primary/5 shadow-[0_0_24px_-12px_var(--primary)]"
                    : done
                    ? "border-border/40 bg-card/30 opacity-70"
                    : "border-border/30 bg-card/10 opacity-50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    done
                      ? "bg-primary/15 text-primary"
                      : active
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.span
                        key="done"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.span>
                    ) : active ? (
                      <motion.span
                        key="active"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 1 }}>
                        <Icon className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm font-semibold ${
                      active ? "text-foreground" : "text-foreground/80"
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{s.detail}</div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Evidence-aware · Safety-first · Commission-blind ranking
        </div>
      </motion.div>
    </div>
  );
}
