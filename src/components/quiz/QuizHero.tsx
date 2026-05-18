import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, HeartPulse, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  onStart: () => void;
}

const TRUST_BADGES = [
  { icon: FlaskConical, label: "Evidence-aware" },
  { icon: ShieldCheck, label: "Safety-first" },
  { icon: HeartPulse, label: "No diagnosis" },
  { icon: Lock, label: "Transparent scoring" },
];

export default function QuizHero({ onStart }: Props) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-12 text-center sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Evidence-aware · Safety-first
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        Find Your Best-Fit Vitamins &amp; Supplements
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
      >
        A free 90-second quiz that scores 15+ evidence-aware supplements against your diet,
        training, lifestyle, and medications — then ranks the safest, most useful matches.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <Badge key={label} variant="secondary" className="gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Badge>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button size="lg" onClick={onStart} className="group">
          Start the free quiz
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </motion.div>

      <p className="max-w-xl text-xs text-muted-foreground">
        Educational only. Not medical advice. Talk with a qualified clinician, pharmacist,
        or registered dietitian before starting, stopping, or changing supplements.
      </p>
    </section>
  );
}
