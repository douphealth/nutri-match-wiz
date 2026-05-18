import { motion } from "framer-motion";

interface Props {
  currentStep: number;
  totalSteps: number;
  progress: number; // 0–100
}

export default function QuizProgress({ currentStep, totalSteps, progress }: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
