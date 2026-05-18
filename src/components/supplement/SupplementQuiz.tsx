import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { QuizStep } from "./QuizStep";
import { Results } from "./Results";
import { runEngine, DEFAULT_ANSWERS } from "@/lib/supplementEngine";
import type { Frequency, Goal, QuizAnswers } from "@/types/supplements";

type Update = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "weekly", label: "Weekly" },
  { value: "often", label: "Often" },
  { value: "daily", label: "Daily" },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "energy", label: "Energy" },
  { value: "muscle_recovery", label: "Muscle recovery" },
  { value: "endurance", label: "Endurance" },
  { value: "weight_management", label: "Weight management support" },
  { value: "sleep", label: "Sleep" },
  { value: "general_wellness", label: "General wellness" },
  { value: "bone_health", label: "Bone health" },
  { value: "immune", label: "Immune support" },
  { value: "focus", label: "Focus" },
];

function Radios<T extends string>({
  value,
  onChange,
  options,
  name,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  name: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as T)} className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <Label
          key={o.value}
          htmlFor={`${name}-${o.value}`}
          className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card p-3 transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <RadioGroupItem id={`${name}-${o.value}`} value={o.value} />
          <span className="text-sm">{o.label}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}

function FreqRow({ label, value, onChange }: { label: string; value: Frequency; onChange: (v: Frequency) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex flex-wrap gap-1">
        {FREQ_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-md border px-3 py-1 text-xs transition ${
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span className="text-sm">{label}</span>
    </Label>
  );
}

export function SupplementQuiz() {
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const update: Update = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));

  const toggleGoal = (g: Goal) => {
    setAnswers((a) => ({
      ...a,
      goals: a.goals.includes(g) ? a.goals.filter((x) => x !== g) : [...a.goals, g],
    }));
  };

  const result = useMemo(() => (submitted ? runEngine(answers) : null), [submitted, answers]);

  const steps = [
    {
      title: "About you",
      description: "We use this to tailor safety checks and dietary context.",
      content: (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Age range</Label>
            <Radios
              name="age"
              value={answers.ageRange}
              onChange={(v) => update("ageRange", v)}
              options={[
                { value: "under_18", label: "Under 18" },
                { value: "18_29", label: "18–29" },
                { value: "30_44", label: "30–44" },
                { value: "45_59", label: "45–59" },
                { value: "60_plus", label: "60+" },
              ]}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sex assigned at birth</Label>
            <Radios
              name="sex"
              value={answers.sex}
              onChange={(v) => update("sex", v)}
              options={[
                { value: "female", label: "Female" },
                { value: "male", label: "Male" },
                { value: "intersex", label: "Intersex" },
                { value: "prefer_not", label: "Prefer not to say" },
              ]}
            />
          </div>
          <div className="space-y-3 sm:col-span-2">
            <Label className="text-sm font-medium">Pregnancy status</Label>
            <Radios
              name="preg"
              value={answers.pregnancy}
              onChange={(v) => update("pregnancy", v)}
              options={[
                { value: "none", label: "None of the below" },
                { value: "pregnant", label: "Pregnant" },
                { value: "breastfeeding", label: "Breastfeeding" },
                { value: "trying", label: "Trying to conceive" },
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Diet & goals",
      description: "Diet patterns and goals strongly influence which nutrients matter most.",
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Diet pattern</Label>
            <Radios
              name="diet"
              value={answers.diet}
              onChange={(v) => update("diet", v)}
              options={[
                { value: "omnivore", label: "Omnivore" },
                { value: "vegetarian", label: "Vegetarian" },
                { value: "vegan", label: "Vegan" },
                { value: "pescatarian", label: "Pescatarian" },
                { value: "low_carb", label: "Low-carb / keto" },
                { value: "calorie_deficit", label: "Calorie deficit" },
                { value: "restricted", label: "Restricted (allergies/medical)" },
              ]}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fitness & wellness goals (select all that apply)</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {GOAL_OPTIONS.map((g) => (
                <CheckRow
                  key={g.value}
                  label={g.label}
                  checked={answers.goals.includes(g.value)}
                  onChange={() => toggleGoal(g.value)}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Lifestyle",
      description: "Sleep, stress, sun, and training shape micronutrient needs.",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sun exposure</Label>
            <Radios
              name="sun"
              value={answers.sunExposure}
              onChange={(v) => update("sunExposure", v)}
              options={[
                { value: "low", label: "Low (mostly indoors)" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "High" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Sleep quality</Label>
            <Radios
              name="sleep"
              value={answers.sleepQuality}
              onChange={(v) => update("sleepQuality", v)}
              options={[
                { value: "poor", label: "Poor" },
                { value: "fair", label: "Fair" },
                { value: "good", label: "Good" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Stress level</Label>
            <Radios
              name="stress"
              value={answers.stress}
              onChange={(v) => update("stress", v)}
              options={[
                { value: "low", label: "Low" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "High" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Training frequency</Label>
            <Radios
              name="train"
              value={answers.trainingFrequency}
              onChange={(v) => update("trainingFrequency", v)}
              options={[
                { value: "none", label: "None" },
                { value: "1_2", label: "1–2 / week" },
                { value: "3_4", label: "3–4 / week" },
                { value: "5_plus", label: "5+ / week" },
              ]}
            />
          </div>
          <FreqRow label="Alcohol" value={answers.alcohol} onChange={(v) => update("alcohol", v)} />
          <FreqRow label="Caffeine" value={answers.caffeine} onChange={(v) => update("caffeine", v)} />
        </div>
      ),
    },
    {
      title: "Food intake",
      description: "Roughly how often do you eat each of these?",
      content: (
        <div className="grid gap-3">
          {(
            [
              ["oilyFish", "Oily fish (salmon, sardines, mackerel)"],
              ["dairy", "Dairy / calcium-rich foods"],
              ["fortifiedFoods", "Fortified foods (plant milks, cereals)"],
              ["redMeat", "Red meat"],
              ["legumes", "Legumes (beans, lentils, tofu)"],
              ["fruitsVeg", "Fruits and vegetables"],
              ["wholeGrains", "Whole grains"],
            ] as const
          ).map(([k, label]) => (
            <FreqRow
              key={k}
              label={label}
              value={answers.foodIntake[k]}
              onChange={(v) => update("foodIntake", { ...answers.foodIntake, [k]: v })}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Medical safety screen",
      description: "Honest answers here help us avoid dangerous recommendations.",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["medications", "I take prescription medication"],
              ["bloodThinners", "I take blood thinners (e.g., warfarin, apixaban)"],
              ["antidepressants", "I take antidepressants"],
              ["diabetesMeds", "I take diabetes medication"],
              ["thyroidMeds", "I take thyroid medication"],
              ["bloodPressureMeds", "I take blood pressure medication"],
              ["kidneyLiver", "I have kidney or liver disease"],
              ["heartDisease", "I have heart disease"],
              ["surgeryPlanned", "I have surgery planned in the next 8 weeks"],
              ["anemiaHistory", "I have a history of anemia"],
            ] as const
          ).map(([k, label]) => (
            <CheckRow
              key={k}
              label={label}
              checked={answers.medical[k]}
              onChange={(v) => update("medical", { ...answers.medical, [k]: v })}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Current supplements & preferences",
      description: "We'll factor in what you already take and how you like to take supplements.",
      content: (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current">Current supplements (one per line, e.g. “Vitamin D 1000 IU”)</Label>
            <Textarea
              id="current"
              rows={4}
              value={answers.currentSupplements}
              onChange={(e) => update("currentSupplements", e.target.value)}
              placeholder="Vitamin D3 1000 IU&#10;Magnesium glycinate 200 mg"
            />
          </div>
          <div className="space-y-2">
            <Label>Preferences</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["gelatinFree", "Gelatin-free"],
                  ["vegan", "Vegan"],
                  ["glutenFree", "Gluten-free"],
                  ["lactoseFree", "Lactose-free"],
                  ["stimulantFree", "Stimulant-free"],
                  ["thirdPartyTestedOnly", "Third-party tested only (USP/NSF/Informed Sport)"],
                ] as const
              ).map(([k, label]) => (
                <CheckRow
                  key={k}
                  label={label}
                  checked={answers.allergies[k]}
                  onChange={(v) => update("allergies", { ...answers.allergies, [k]: v })}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Budget</Label>
              <Radios
                name="budget"
                value={answers.budget}
                onChange={(v) => update("budget", v)}
                options={[
                  { value: "low", label: "Low" },
                  { value: "moderate", label: "Moderate" },
                  { value: "premium", label: "Premium" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Pill preference</Label>
              <Radios
                name="pill"
                value={answers.pillPreference}
                onChange={(v) => update("pillPreference", v)}
                options={[
                  { value: "capsule", label: "Capsule / tablet" },
                  { value: "powder", label: "Powder" },
                  { value: "gummy", label: "Gummy" },
                  { value: "liquid", label: "Liquid" },
                  { value: "no_preference", label: "No preference" },
                ]}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (submitted && result) {
    return (
      <Results
        result={result}
        answers={answers}
        onRestart={() => {
          setSubmitted(false);
          setStep(0);
        }}
      />
    );
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <QuizStep
          title={current.title}
          description={current.description}
          stepIndex={step}
          totalSteps={steps.length}
        >
          {current.content}
        </QuizStep>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAnswers(DEFAULT_ANSWERS);
                setStep(0);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            {isLast ? (
              <Button type="button" onClick={() => setSubmitted(true)}>
                See my results
              </Button>
            ) : (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
