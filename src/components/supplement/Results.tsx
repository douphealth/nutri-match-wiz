import {
  Award,
  CheckCircle2,
  Download,
  Leaf,
  ListChecks,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SafetyWarnings } from "./SafetyWarnings";
import { RED_FLAG_INGREDIENTS } from "@/lib/supplementData";
import type { EngineResult, QuizAnswers, Recommendation } from "@/types/supplements";

interface Props {
  result: EngineResult;
  answers: QuizAnswers;
  onRestart: () => void;
}

function confidenceColor(c: Recommendation["confidence"]) {
  if (c === "High") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (c === "Moderate") return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
  return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
}

function safetyColor(s: string) {
  if (s === "Low") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (s === "Moderate") return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
}

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const s = rec.supplement;
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Top match #{rank}
            </div>
            <CardTitle className="text-xl">{s.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{s.category}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={confidenceColor(rec.confidence)}>
              {rec.confidence} confidence
            </Badge>
            <Badge variant="outline">{s.evidenceLevel} evidence</Badge>
            <Badge variant="outline" className={safetyColor(s.safetyLevel)}>
              {s.safetyLevel} caution
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{s.resultCopy}</p>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="why">
            <AccordionTrigger className="text-sm">Why this matched you</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                {rec.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="benefits">
            <AccordionTrigger className="text-sm">Potential benefits</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-foreground/80">{s.typicalUseCase}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="safety">
            <AccordionTrigger className="text-sm">Safety checks &amp; who should ask a clinician first</AccordionTrigger>
            <AccordionContent className="space-y-3">
              {rec.safetyFlags.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700 dark:text-amber-400">
                  {rec.safetyFlags.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              <div className="text-sm">
                <p className="font-medium">Contraindications</p>
                <ul className="list-disc pl-5 text-foreground/80">
                  {s.contraindications.length ? s.contraindications.map((x, i) => <li key={i}>{x}</li>) : <li>None commonly noted at typical doses.</li>}
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium">Medication interactions to know</p>
                <ul className="list-disc pl-5 text-foreground/80">
                  {s.medicationInteractions.length ? s.medicationInteractions.map((x, i) => <li key={i}>{x}</li>) : <li>No major common interactions at typical doses — confirm with a pharmacist.</li>}
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium">Avoid if</p>
                <ul className="list-disc pl-5 text-foreground/80">
                  {s.avoidIf.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="food">
            <AccordionTrigger className="text-sm">Food-first alternative</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-foreground/80">{s.foodFirstAdvice}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="label">
            <AccordionTrigger className="text-sm">What to look for on the label</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                {s.whatToLookFor.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function Results({ result, answers, onRestart }: Props) {
  const top = result.recommendations.slice(0, 3);
  const others = result.recommendations.slice(3);

  const downloadReport = () => {
    const lines: string[] = [];
    lines.push("GearUpToFit — Vitamin & Supplement Match Report");
    lines.push("");
    lines.push(`Match score: ${result.matchScore}/100`);
    lines.push("");
    lines.push("EDUCATIONAL ONLY — not medical advice. Talk to a qualified clinician before changing supplements.");
    lines.push("");
    if (result.safetyGate.triggered) {
      lines.push("Safety notes:");
      result.safetyGate.reasons.forEach((r) => lines.push("- " + r));
      lines.push("");
    }
    result.recommendations.forEach((r, i) => {
      lines.push(`${i + 1}. ${r.supplement.name} — ${r.confidence} confidence (${r.supplement.evidenceLevel} evidence, ${r.supplement.safetyLevel} caution)`);
      r.reasons.forEach((reason) => lines.push("   • " + reason));
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "supplement-match-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareResult = async () => {
    const text = `My GearUpToFit Supplement Match score: ${result.matchScore}/100. Top picks: ${top.map((t) => t.supplement.name).join(", ")}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Supplement Match", text });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="space-y-8">
      {/* Score */}
      <Card className="border-border/60">
        <CardContent className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Award className="h-4 w-4" /> Your Match Score
              </div>
              <h2 className="text-3xl font-semibold">{result.matchScore}/100</h2>
              <p className="text-sm text-muted-foreground">
                Based on {result.recommendations.length} relevant supplement categories evaluated against your answers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={shareResult}>
                Share
              </Button>
              <Button variant="outline" onClick={downloadReport}>
                <Download className="mr-2 h-4 w-4" /> Download report
              </Button>
              <Button variant="ghost" onClick={onRestart}>
                <RotateCcw className="mr-2 h-4 w-4" /> Retake quiz
              </Button>
            </div>
          </div>
          <Progress value={result.matchScore} />
          <p className="text-xs text-muted-foreground">
            Educational only — this report does not diagnose, treat, cure, or prevent any disease. Always talk
            with a qualified clinician, pharmacist, or registered dietitian before starting, stopping, or
            changing supplements.
          </p>
        </CardContent>
      </Card>

      {/* Safety gate */}
      {result.safetyGate.triggered && (
        <SafetyWarnings reasons={result.safetyGate.reasons} variant="gate" />
      )}

      {/* Top 3 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Top recommended supplement categories</h2>
        </div>
        {top.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="space-y-2 p-6">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">No supplements clearly indicated.</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your answers don't strongly justify supplementation right now. Focus on food-first habits below
                and re-check if your training, diet, or lifestyle changes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {top.map((rec, i) => (
              <RecommendationCard key={rec.supplement.id} rec={rec} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* Other relevant */}
      {others.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Other relevant options</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((rec) => (
              <Card key={rec.supplement.id} className="border-border/60">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-base">{rec.supplement.name}</CardTitle>
                    <Badge variant="outline" className={confidenceColor(rec.confidence)}>
                      {rec.confidence}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{rec.supplement.resultCopy}</p>
                  <p className="text-xs text-muted-foreground">
                    {rec.supplement.evidenceLevel} evidence · {rec.supplement.safetyLevel} caution
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Food-first */}
      {result.foodFirstNotes.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="h-5 w-5 text-emerald-600" /> Food-first alternatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
              {result.foodFirstNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Red flags */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <XCircle className="h-5 w-5 text-rose-600" /> Red flags to avoid on labels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid list-disc gap-1 pl-5 text-sm text-foreground/80 sm:grid-cols-2">
            {RED_FLAG_INGREDIENTS.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Note: dietary supplements are <strong>not</strong> FDA-approved before marketing — any product claiming
            “FDA approved” is a red flag.
          </p>
        </CardContent>
      </Card>

      {/* Questions for clinician */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" /> Questions to ask your clinician
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
            <li>Based on my history and medications, are any of these supplements unsafe for me?</li>
            <li>Should we test relevant labs (e.g., 25(OH)D, B12, ferritin) before starting anything?</li>
            <li>What dose is appropriate for my situation, and for how long?</li>
            <li>How will we know if it's helping — what should we re-check?</li>
            <li>Should any supplements be paused before procedures, pregnancy plans, or new meds?</li>
          </ul>
        </CardContent>
      </Card>

      {/* General notes */}
      {result.generalNotes.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" /> Notes for your situation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
              {result.generalNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        Quiz inputs used: diet “{answers.diet}”, training “{answers.trainingFrequency}”, sleep “{answers.sleepQuality}”,
        sun “{answers.sunExposure}”. Scoring is fully deterministic and based on your answers — no AI hallucination, no
        hidden ranking.
      </p>
    </div>
  );
}
