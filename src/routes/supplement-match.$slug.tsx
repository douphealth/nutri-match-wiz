// Stage 1 placeholder for the personalized result page.
// Stage 2 will replace this with the full report (per-supplement breakdown,
// food-first plan, PDF download, share, compare links). For now, it decodes
// the URL payload, re-runs the deterministic engine, and renders the ranked
// list so the quiz-to-result flow works end-to-end.

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { decodeAnswers } from "@/lib/quiz-data";
import { runEngine } from "@/lib/recommendation-engine";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

const searchSchema = z.object({
  d: z.string().min(1),
});

export const Route = createFileRoute("/supplement-match/$slug")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { d } }) => ({ d }),
  loader: ({ params, deps }) => {
    const answers = decodeAnswers(deps.d);
    if (!answers) throw notFound();
    const result = runEngine(answers);
    return { slug: params.slug, answers, result };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Your Supplement Match" }] };
    const top = loaderData.result.recommendations.slice(0, 3).map((r) => r.supplement.name).join(", ");
    const title = `Your Supplement Match — ${top || "Personalized Plan"}`;
    const description = top
      ? `Your evidence-aware top picks: ${top}. Safety-first, food-first, transparently scored.`
      : "Your personalized, safety-first supplement plan from GearUpToFit.";
    const url = `https://gearuptofit.com/supplement-match/${loaderData.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex, follow" }, // personalized — don't index
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ResultPage,
});

function ResultPage() {
  const { result } = Route.useLoaderData();
  const { matchScore, recommendations, safetyGate, foodFirstNotes, generalNotes } = result;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Retake the quiz
          </Link>
        </Button>
      </div>

      <header className="mb-8 text-center">
        <Badge variant="outline" className="mb-3">Personalized · Evidence-aware</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Supplement Match</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Match score <span className="font-semibold text-foreground">{matchScore}/100</span> · {recommendations.length} matches
        </p>
      </header>

      {safetyGate.triggered && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Talk with a clinician before acting</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
              {safetyGate.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Based on your answers, no specific supplements rose above the baseline. Food-first wins.
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, i) => (
            <Card key={rec.supplement.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-lg">
                    {i + 1}. {rec.supplement.name}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rec.supplement.category} · Evidence: {rec.supplement.evidenceLevel} · Safety: {rec.supplement.safetyLevel}
                  </p>
                </div>
                <Badge
                  variant={rec.confidence === "High" ? "default" : rec.confidence === "Moderate" ? "secondary" : "outline"}
                >
                  {rec.confidence}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{rec.supplement.resultCopy}</p>
                {rec.reasons.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-muted-foreground">
                      Why we recommended this ({rec.reasons.length})
                    </summary>
                    <ul className="mt-2 ml-5 list-disc space-y-1 text-muted-foreground">
                      {rec.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {rec.safetyFlags.length > 0 && (
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
                    <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> Safety notes
                    </div>
                    <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
                      {rec.safetyFlags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  <strong>Food-first:</strong> {rec.supplement.foodFirstAdvice}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {(foodFirstNotes.length > 0 || generalNotes.length > 0) && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {foodFirstNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Food-first plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                  {foodFirstNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {generalNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lifestyle notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                  {generalNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Educational only. Not medical advice. <Link to="/methodology" className="underline">How this is scored</Link>{" "}
        · <Link to="/affiliate-disclosure" className="underline">Affiliate disclosure</Link>
      </p>
    </div>
  );
}
