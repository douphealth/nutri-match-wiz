import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { decodeAnswers, type QuizAnswers } from "@/lib/quiz-data";
import { runEngine } from "@/lib/recommendation-engine";
import type { Recommendation } from "@/types/supplements";
import { productFor, productsFor, amazonLink, TONE_STYLES } from "@/lib/supplement-products";
import { CredibilitySections, faqJsonLd, reviewJsonLd } from "@/components/result/CredibilitySections";
import { buildDailySchedule } from "@/lib/daily-schedule";
import { citationsFor } from "@/lib/evidence/evidence-matrix";
import type { Recommendation as RecType, RecommendationStatus } from "@/types/supplements";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";
import { downloadSupplementReport } from "@/lib/pdf-report";
import { useState } from "react";
import type { EngineResult } from "@/types/supplements";

function PdfDownloadButton({ result }: { result: EngineResult }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      size="lg"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await downloadSupplementReport(result);
        } finally {
          setLoading(false);
        }
      }}
      className="bg-gradient-primary font-semibold uppercase tracking-wider shadow-lg hover:-translate-y-0.5 transition-transform"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {loading ? "Building your livebook…" : "Download PDF livebook"}
    </Button>
  );
}

const searchSchema = z.object({ d: z.string().min(1) });

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
    const top = loaderData.result.recommendations
      .slice(0, 3)
      .map((r) => r.supplement.name.replace(/\s*\([^)]*\)/g, ""))
      .join(", ");
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
        { name: "robots", content: "noindex, follow" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd()) },
        { type: "application/ld+json", children: JSON.stringify(reviewJsonLd()) },
      ],
    };
  },
  component: ResultPage,
});

function confidenceTone(c: Recommendation["confidence"]) {
  if (c === "High") return { label: "HIGH MATCH", color: "text-primary", ring: "ring-primary/40", bg: "bg-primary/10" };
  if (c === "Moderate") return { label: "GOOD MATCH", color: "text-amber-400", ring: "ring-amber-500/30", bg: "bg-amber-500/10" };
  return { label: "WORTH CONSIDERING", color: "text-muted-foreground", ring: "ring-border", bg: "bg-muted/40" };
}

function ResultPage() {
  const data = Route.useLoaderData() as {
    slug: string;
    answers: QuizAnswers;
    result: ReturnType<typeof runEngine>;
  };
  const { matchScore, recommendations, safetyGate, foodFirstNotes, generalNotes, personalizationProfile, notRecommended, clinicianCallouts } = data.result;
  const top = recommendations[0];
  const productCandidates = recommendations.reduce((sum, rec) => sum + productsFor(rec.supplement.id).length, 0);

  return (
    <div className="relative isolate">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px]">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">

        {/* Hero score */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-strong relative mb-10 overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-12 sm:py-14"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Your Supplement Match
          </div>
          <h1
            className="mt-3 font-bold uppercase leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
          >
            <span className="block text-foreground">Your personalized</span>
            <span className="block text-gradient">stack is ready</span>
          </h1>

          <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <div className="flex flex-col items-center">
              <div className="relative">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" className="text-border" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(matchScore / 100) * 326.7} 326.7`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--primary-glow)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-foreground tabular-nums">{matchScore}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Match score
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-start sm:text-left">
              <Stat label="Top picks" value={String(recommendations.length)} />
              <Stat label="Weighted signals" value={String(personalizationProfile?.signalCount ?? recommendations.length)} />
              <Stat
                label="Top recommendation"
                value={top ? top.supplement.name.replace(/\s*\([^)]*\)/g, "") : "Food-first only"}
              />
              <Stat label="Safety review" value={safetyGate.triggered ? "Clinician input" : "Standard"} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PdfDownloadButton result={data.result} />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Livebook · Product images · Print-ready
            </span>
          </div>
        </motion.header>

        {personalizationProfile && (
          <section className="mb-8 grid gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 sm:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Personalization engine</div>
              <h2 className="mt-1 text-xl font-bold text-foreground">{personalizationProfile.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{personalizationProfile.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {personalizationProfile.differentiators.map((item) => (
                  <span key={item} className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              <MiniMetric label="Product candidates" value={String(productCandidates)} />
              <MiniMetric label="Affiliate tag" value="papalex-20" />
              <MiniMetric label="Ranking bias" value="Commission-blind" />
            </div>
          </section>
        )}

        {/* Safety gate */}
        {safetyGate.triggered && (
          <Card className="mb-8 border-destructive/40 bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">Talk with a clinician before starting anything new</CardTitle>
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

        {/* Daily schedule */}
        <DailyScheduleSection recs={recommendations} answers={data.answers} />

        {/* Recommendations */}
        <section className="mt-10 space-y-5">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Based on your answers, no specific supplements rose above the baseline.
                Food-first wins. See your food-first plan below.
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec, i) => (
              <SupplementCard key={rec.supplement.id} rec={rec} rank={i + 1} answers={data.answers} />
            ))
          )}
        </section>

        {/* Food-first + lifestyle */}
        {(foodFirstNotes.length > 0 || generalNotes.length > 0) && (
          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            {foodFirstNotes.length > 0 && (
              <Card className="glass border-primary/20">
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Food-first plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="ml-5 list-disc space-y-1.5 text-sm text-muted-foreground">
                    {foodFirstNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {generalNotes.length > 0 && (
              <Card className="glass">
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Lifestyle notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="ml-5 list-disc space-y-1.5 text-sm text-muted-foreground">
                    {generalNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Credibility: sources, testimonials, reading, tools, kit, FAQ */}
        <CredibilitySections />

        {/* Disclosure */}
        <div className="mt-12 rounded-2xl border border-border/60 bg-card/40 p-5 text-center text-xs text-muted-foreground">
          Educational only. Not medical advice. Product links are Amazon affiliate links
          — ranking is commission-blind and computed before any product is attached.{" "}
          <Link to="/methodology" className="underline hover:text-primary">How this is scored</Link>{" "}
          ·{" "}
          <Link to="/affiliate-disclosure" className="underline hover:text-primary">Affiliate disclosure</Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/30 p-3">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SupplementCard({ rec, rank, answers }: { rec: Recommendation; rank: number; answers: QuizAnswers }) {
  const product = productFor(rec.supplement.id, answers);
  const candidateCount = productsFor(rec.supplement.id).length;
  const tone = confidenceTone(rec.confidence);
  const cleanName = rec.supplement.name.replace(/\s*\([^)]*\)/g, "");
  const isTop = rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(rank * 0.04, 0.3) }}
    >
      <Card
        className={`glass overflow-hidden border-border/60 ${
          isTop ? "ring-1 ring-primary/40 glow-primary-sm" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  isTop ? "bg-gradient-primary text-primary-foreground glow-primary-sm" : "bg-secondary text-foreground"
                }`}
              >
                {rank}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg leading-tight">{cleanName}</CardTitle>
                  {isTop && (
                    <Badge className="gap-1 bg-gradient-primary text-primary-foreground">
                      <Award className="h-3 w-3" /> Top pick
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rec.supplement.category} · Evidence{" "}
                  <span className="font-semibold text-foreground">{rec.supplement.evidenceLevel}</span>{" "}
                  · Safety{" "}
                  <span className="font-semibold text-foreground">{rec.supplement.safetyLevel}</span>
                </p>
              </div>
            </div>
            <div className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone.color} ${tone.ring} ${tone.bg}`}>
              {tone.label}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">{rec.supplement.resultCopy}</p>

          <div className="rounded-xl border border-border/60 bg-background/30 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Signal precision</span>
              <span className="text-xs font-bold text-primary tabular-nums">{rec.precisionScore ?? Math.round(rec.score * 10)} / 100</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, rec.precisionScore ?? rec.score * 10)}%` }} />
            </div>
            {rec.personalizationTags && rec.personalizationTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rec.personalizationTags.slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-md border border-border/70 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Amazon product card */}
          {product && (
            <div className="group/prod relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card-elevated/80 via-card-elevated/40 to-card-elevated/20 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] transition-all hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)]">
              <div aria-hidden className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl ${TONE_STYLES[product.tone].bg}`} />
              <div className="relative mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <Star className="h-3 w-3 fill-current" /> Editor's Pick on Amazon
                </div>
                <div className="hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline-flex">
                  {candidateCount} curated pick{candidateCount === 1 ? "" : "s"} · papalex-20
                </div>
              </div>
              <div className="relative flex flex-col gap-5 sm:flex-row">
                <a
                  href={amazonLink(product.asin)}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className={`group relative flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-3 ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:h-44 sm:w-44`}
                  aria-label={`${product.brand} ${product.title} — view on Amazon`}
                >
                  <div className={`absolute inset-0 opacity-60 ${TONE_STYLES[product.tone].bg}`} aria-hidden />
                  <img
                    src={product.image}
                    alt={`${product.brand} ${product.title}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:scale-[1.06]"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = "none";
                      const parent = img.parentElement;
                      if (parent && !parent.querySelector(".img-fallback")) {
                        const fb = document.createElement("div");
                        fb.className = "img-fallback relative z-10 flex flex-col items-center justify-center text-center px-3";
                        fb.innerHTML = `<div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">${product.brand}</div><div class="mt-1 text-base font-extrabold text-slate-900 leading-tight">${product.pill}</div>`;
                        parent.appendChild(fb);
                      }
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-1.5 z-10 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-700/80">
                    View on Amazon →
                  </div>
                </a>
                <div className="flex flex-1 flex-col gap-2.5">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      {product.brand}
                    </div>
                    <a
                      href={amazonLink(product.asin)}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      className="text-base font-semibold leading-snug text-foreground hover:text-primary"
                    >
                      {product.title}
                    </a>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{product.why}</p>
                  {product.badges && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          <CheckCircle2 className="h-3 w-3" /> {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className="mt-1 w-full bg-gradient-primary font-semibold uppercase tracking-wider shadow-md transition-transform hover:-translate-y-0.5 sm:w-fit"
                  >
                    <a
                      href={amazonLink(product.asin)}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                    >
                      View on Amazon
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      <ArrowRight className="ml-0.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}


          {/* Why we recommended */}
          {rec.reasons.length > 0 && (
            <details className="group rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Why we recommended this ({rec.reasons.length})
                </span>
                <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
                <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
              </summary>
              <ul className="mt-3 ml-5 list-disc space-y-1 text-muted-foreground">
                {rec.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </details>
          )}

          {/* What to look for */}
          {rec.supplement.whatToLookFor.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-card/30 p-3">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                What to look for on the label
              </div>
              <ul className="grid gap-1 text-xs text-foreground/90 sm:grid-cols-2">
                {rec.supplement.whatToLookFor.map((x) => (
                  <li key={x} className="flex items-start gap-1.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety flags */}
          {rec.safetyFlags.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
              <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Safety notes
              </div>
              <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
                {rec.safetyFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Food-first */}
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
            <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Food-first: </span>
              {rec.supplement.foodFirstAdvice}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DailyScheduleSection({ recs, answers }: { recs: RecType[]; answers: QuizAnswers }) {
  if (recs.length === 0) return null;
  const schedule = buildDailySchedule(recs, answers);
  if (schedule.totalDoses === 0) return null;
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Your daily protocol
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Take this, at this time, with this.
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A clinician-style timeline built from your answers — dose, form, timing, and food pairing.
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doses / day</div>
          <div className="text-3xl font-bold text-primary tabular-nums">{schedule.totalDoses}</div>
        </div>
      </div>
      <ol className="relative ml-2 border-l border-border/60 pl-5">
        {schedule.bySlot.map((slot) => (
          <li key={slot.slot} className="relative mb-5">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-gradient-primary ring-4 ring-background" />
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {slot.label}
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {slot.doses.length} item{slot.doses.length > 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="space-y-3">
                {slot.doses.map((d, idx) => (
                  <div key={idx} className="grid gap-1 rounded-xl border border-border/40 bg-background/30 p-3 sm:grid-cols-[1.4fr_1fr]">
                    <div>
                      <div className="text-sm font-bold text-foreground">{d.supplementName}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{d.dose}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{d.notes}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:items-start sm:justify-end">
                      <span className="rounded-md border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {d.form}
                      </span>
                      <span className="rounded-md border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {d.withFood}
                      </span>
                      <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {d.cadence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {(schedule.globalSeparations.length > 0 || schedule.trainingDayAdjustments.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {schedule.globalSeparations.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Timing separations</span>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                {schedule.globalSeparations.map((s) => (<li key={s}>{s}</li>))}
              </ul>
            </div>
          )}
          {schedule.trainingDayAdjustments.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Training-day adjustments</span>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                {schedule.trainingDayAdjustments.map((s) => (<li key={s}>{s}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
