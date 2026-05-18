import type { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";

interface Props {
  title: string;
  description?: string;
  stepIndex: number;
  totalSteps: number;
  children: ReactNode;
}

export function QuizStep({ title, description, stepIndex, totalSteps, children }: Props) {
  const pct = Math.round(((stepIndex + 1) / totalSteps) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
