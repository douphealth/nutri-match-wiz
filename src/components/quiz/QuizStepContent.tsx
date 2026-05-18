import type { QuizAnswers } from "@/types/supplements";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { QuizStep } from "@/lib/quiz-data";
import { getByPath, setByPath } from "@/lib/quiz-data";
import { cn } from "@/lib/utils";

interface Props {
  step: QuizStep;
  answers: QuizAnswers;
  setAnswers: (next: QuizAnswers) => void;
  onAutoAdvance?: () => void;
}

export default function QuizStepContent({ step, answers, setAnswers, onAutoAdvance }: Props) {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{step.title}</h2>
        {step.subtitle && <p className="text-sm text-muted-foreground sm:text-base">{step.subtitle}</p>}
      </header>

      {step.type === "single" && step.options && (
        <SingleChoice
          step={step}
          answers={answers}
          setAnswers={setAnswers}
          onAutoAdvance={onAutoAdvance}
        />
      )}

      {step.type === "multi" && step.options && (
        <MultiChoice step={step} answers={answers} setAnswers={setAnswers} />
      )}

      {step.type === "slider-freq" && step.options && (
        <FrequencyChoice
          step={step}
          answers={answers}
          setAnswers={setAnswers}
          onAutoAdvance={onAutoAdvance}
        />
      )}

      {step.type === "boolean-multi" && step.booleans && (
        <BooleanGrid step={step} answers={answers} setAnswers={setAnswers} />
      )}

      {step.helper && (
        <p className="text-center text-xs text-muted-foreground">{step.helper}</p>
      )}
    </div>
  );
}

function SingleChoice({ step, answers, setAnswers, onAutoAdvance }: Props) {
  const current = getByPath(answers, step.path) as string | undefined;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {step.options!.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setAnswers(setByPath(answers, step.path, opt.value));
              if (onAutoAdvance) setTimeout(onAutoAdvance, 220);
            }}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              "hover:border-primary/60 hover:bg-accent/40",
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-card",
            )}
          >
            <div className="text-sm font-medium">{opt.label}</div>
            {opt.description && (
              <div className="mt-1 text-xs text-muted-foreground">{opt.description}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({ step, answers, setAnswers }: Props) {
  const current = (getByPath(answers, step.path) as string[]) ?? [];
  const toggle = (value: string) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setAnswers(setByPath(answers, step.path, next));
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {step.options!.map((opt) => {
        const active = current.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
              "hover:border-primary/60 hover:bg-accent/40",
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-card",
            )}
          >
            <span className="text-sm font-medium">{opt.label}</span>
            <span
              className={cn(
                "ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {active && (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FrequencyChoice({ step, answers, setAnswers, onAutoAdvance }: Props) {
  const current = (getByPath(answers, step.path) as string) ?? "weekly";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {step.options!.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setAnswers(setByPath(answers, step.path, opt.value));
                if (onAutoAdvance) setTimeout(onAutoAdvance, 220);
              }}
              className={cn(
                "rounded-lg border p-3 text-center text-xs font-medium transition-all",
                "hover:border-primary/60 hover:bg-accent/40",
                active
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BooleanGrid({ step, answers, setAnswers }: Props) {
  return (
    <Card className="divide-y divide-border/60 overflow-hidden p-0">
      {step.booleans!.map((b) => {
        const checked = Boolean(getByPath(answers, b.path));
        return (
          <Label
            key={b.path}
            className={cn(
              "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
              checked && "bg-primary/5",
            )}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setAnswers(setByPath(answers, b.path, Boolean(v)))}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{b.label}</div>
              {b.description && (
                <div className="mt-0.5 text-xs text-muted-foreground">{b.description}</div>
              )}
            </div>
          </Label>
        );
      })}
    </Card>
  );
}
