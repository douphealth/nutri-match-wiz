import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { type QuizAnswers } from "@/lib/quiz-data";
import { runEngine } from "@/lib/engine";
import { findTopic } from "@/lib/seo-topics";
import { TopicView, buildTopicSchema, topicCanonicalUrl } from "@/components/topic/TopicView";
import { readAnswersForSlug, decodeShareParam, buildShareUrl } from "@/lib/result-storage";
import type { Recommendation, EngineResult, RecommendationStatus } from "@/types/supplements";
import type { Recommendation as RecType } from "@/types/supplements";
import { productFor, productsFor, amazonLink, TONE_STYLES } from "@/lib/supplement-products";
import {
  CredibilitySections,
  faqJsonLd,
  reviewJsonLd,
} from "@/components/result/CredibilitySections";
import { buildDailySchedule } from "@/lib/daily-schedule";
import { citationsFor } from "@/lib/evidence/evidence-matrix";
import { WellnessProfilePanel } from "@/components/result/WellnessProfilePanel";

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
  Link2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function PdfDownloadButton({ result, answers }: { result: EngineResult; answers: QuizAnswers }) {
  const [loading, setLoading] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const top = result.recommendations[0];
  const topSupplement = top?.supplement.name.replace(/\s*\([^)]*\)/g, "");
  const topProduct = top ? productFor(top.supplement.id) : undefined;
  const topBrand = topProduct?.brand;
  const primaryGoal = Array.isArray(answers?.goals) ? answers.goals[0] : undefined;
  const archetype = (result as unknown as { wellnessArchetype?: string }).wellnessArchetype;
  const reportURL = typeof window !== "undefined" ? window.location.href : undefined;

  const runDownload = async () => {
    setLoading(true);
    try {
      const { downloadSupplementReport } = await import("@/lib/pdf-report");
      await downloadSupplementReport(result);
    } finally {
      setLoading(false);
    }
  };

  const onClick = async () => {
    if (hasSubscribed()) {
      await runDownload();
      return;
    }
    setGateOpen(true);
  };

  return (
    <>
      <Button
        size="lg"
        disabled={loading}
        onClick={onClick}
        className="bg-gradient-primary font-semibold uppercase tracking-wider shadow-lg hover:-translate-y-0.5 transition-transform"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {loading ? "Building your livebook…" : "Download PDF livebook"}
      </Button>
      <EmailGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onUnlock={() => {
          setGateOpen(false);
          void runDownload();
        }}
        topSupplement={topSupplement}
        topBrand={topBrand}
        primaryGoal={primaryGoal}
        archetype={archetype}
        reportURL={reportURL}
        source="quiz_gate"
      />
    </>
  );
}

function ShareLinkButton({ slug, answers }: { slug: string; answers: QuizAnswers }) {
  const onShare = async () => {
    const url = buildShareUrl(slug, answers);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Sanitized share link copied", {
        description: "Medical, medication, and pregnancy fields were stripped before sharing.",
      });
    } catch {
      toast.error("Could not copy link");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="lg" variant="outline" className="font-semibold uppercase tracking-wider">
          <Link2 className="mr-2 h-4 w-4" />
          Create shareable link
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Heads up — privacy notice</AlertDialogTitle>
          <AlertDialogDescription>
            Anyone with the link can see a sanitized version of your match. Before we encode it, we
            strip sensitive fields: pregnancy status, medications, blood thinners, antidepressants,
            diabetes / thyroid / blood-pressure meds, kidney or liver disease, heart disease,
            planned surgery, anemia history, and your free-text supplement notes. The receiver gets
            a less precise but still useful recommendation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onShare}>Copy sanitized link</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// `?d=` is optional now — kept only for backwards compatibility with old share
// links. The default flow stores answers in sessionStorage and the URL contains
// only the slug.
const searchSchema = z.object({ d: z.string().optional() });

type LoaderTopic = {
  kind: "topic";
  slug: string;
  topic: NonNullable<ReturnType<typeof findTopic>>;
};
type LoaderResult = {
  kind: "result";
  slug: string;
  answers: QuizAnswers | null;
  result: EngineResult | null;
};
type LoaderData = LoaderTopic | LoaderResult;

export const Route = createFileRoute("/supplement-match/$slug")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { d } }) => ({ d }),
  loader: ({ params, deps }): LoaderData => {
    // Dispatcher: if the slug matches an SEO topic, render the canonical topic page.
    const topic = findTopic(params.slug);
    if (topic) return { kind: "topic", slug: params.slug, topic };

    // Otherwise this is a personalized result page. Try the legacy ?d= payload
    // for back-compat; the privacy-first sessionStorage path is hydrated on the client.
    const answers = deps.d ? decodeShareParam(deps.d) : null;
    const result = answers ? runEngine(answers) : null;
    return { kind: "result", slug: params.slug, answers, result };
  },
  head: ({ loaderData }) => {
    if (loaderData?.kind === "topic") {
      const t = loaderData.topic;
      const url = topicCanonicalUrl(loaderData.slug);
      return {
        meta: [
          { title: t.metaTitle },
          { name: "description", content: t.metaDescription },
          { property: "og:title", content: t.metaTitle },
          { property: "og:description", content: t.metaDescription },
          { property: "og:url", content: url },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(buildTopicSchema(t, url)) },
        ],
      };
    }
    // Personalized result page — never index.
    const top = loaderData?.result?.recommendations
      ?.slice(0, 3)
      .map((r) => r.supplement.name.replace(/\s*\([^)]*\)/g, ""))
      .join(", ");
    const title = top ? `Your Supplement Match — ${top}` : "Your Supplement Match";
    return {
      meta: [
        { title },
        {
          name: "description",
          content:
            "Your personalized, safety-first supplement plan from GearUpToFit. Private by default — answers stay on your device.",
        },
        { name: "robots", content: "noindex, nofollow" },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd()) },
        { type: "application/ld+json", children: JSON.stringify(reviewJsonLd()) },
      ],
    };
  },
  component: SupplementMatchSlugRoute,
});

function SupplementMatchSlugRoute() {
  const data = Route.useLoaderData() as LoaderData;
  if (data.kind === "topic") return <TopicView topic={data.topic} />;
  return <ResultPageClient slug={data.slug} ssrAnswers={data.answers} ssrResult={data.result} />;
}

function RetakeQuizState({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Your match isn’t on this device</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        For your privacy, results stay in this browser’s session storage rather than the URL. Take
        the 90-second quiz again to regenerate your personalized plan
        <span className="hidden sm:inline">
          {" "}
          for <code className="text-xs">{slug}</code>
        </span>
        .
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="bg-gradient-primary font-semibold uppercase tracking-wider"
        >
          <Link to="/">Retake the quiz</Link>
        </Button>
      </div>
    </div>
  );
}

function ResultPageClient({
  slug,
  ssrAnswers,
  ssrResult,
}: {
  slug: string;
  ssrAnswers: QuizAnswers | null;
  ssrResult: EngineResult | null;
}) {
  const [answers, setAnswers] = useState<QuizAnswers | null>(ssrAnswers);
  const [hydrated, setHydrated] = useState<boolean>(ssrAnswers !== null);

  useEffect(() => {
    if (answers) return;
    const stored = readAnswersForSlug(slug);
    if (stored) setAnswers(stored);
    setHydrated(true);
  }, [answers, slug]);

  const result = useMemo<EngineResult | null>(() => {
    if (ssrResult && answers === ssrAnswers) return ssrResult;
    return answers ? runEngine(answers) : null;
  }, [answers, ssrAnswers, ssrResult]);

  if (!answers || !result) {
    if (!hydrated) {
      return (
        <div className="mx-auto flex h-[60vh] max-w-md items-center justify-center px-4 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading your match…
        </div>
      );
    }
    return <RetakeQuizState slug={slug} />;
  }

  return <ResultPage slug={slug} answers={answers} result={result} />;
}

function confidenceTone(c: Recommendation["confidence"]) {
  if (c === "High")
    return {
      label: "HIGH MATCH",
      color: "text-primary",
      ring: "ring-primary/40",
      bg: "bg-primary/10",
    };
  if (c === "Moderate")
    return {
      label: "GOOD MATCH",
      color: "text-amber-400",
      ring: "ring-amber-500/30",
      bg: "bg-amber-500/10",
    };
  if (c === "Blocked")
    return {
      label: "CLINICIAN GATED",
      color: "text-destructive",
      ring: "ring-destructive/30",
      bg: "bg-destructive/10",
    };
  return {
    label: "WORTH CONSIDERING",
    color: "text-muted-foreground",
    ring: "ring-border",
    bg: "bg-muted/40",
  };
}

function ResultPage({
  slug,
  answers,
  result,
}: {
  slug: string;
  answers: QuizAnswers;
  result: EngineResult;
}) {
  const data = { slug, answers, result };
  const {
    matchScore,
    recommendations,
    safetyGate,
    foodFirstNotes,
    generalNotes,
    personalizationProfile,
    notRecommended,
    clinicianCallouts,
  } = data.result;
  const top = recommendations[0];
  const productCandidates = recommendations.reduce(
    (sum, rec) => sum + productsFor(rec.supplement.id).length,
    0,
  );
  const clinicianGuidance = [
    ...(safetyGate.triggered ? safetyGate.reasons : []),
    ...(clinicianCallouts ?? []),
  ].filter((item, index, list) => item && list.indexOf(item) === index);

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
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-border"
                  />
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
                  <div className="text-4xl font-bold text-foreground tabular-nums">
                    {matchScore}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Match score
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-start sm:text-left">
              <Stat label="Top picks" value={String(recommendations.length)} />
              <Stat
                label="Weighted signals"
                value={String(personalizationProfile?.signalCount ?? recommendations.length)}
              />
              <Stat
                label="Top recommendation"
                value={top ? top.supplement.name.replace(/\s*\([^)]*\)/g, "") : "Food-first only"}
              />
              <Stat
                label="Safety review"
                value={safetyGate.triggered ? "Clinician input" : "Standard"}
              />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PdfDownloadButton result={data.result} />
            <ShareLinkButton slug={data.slug} answers={data.answers} />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Livebook · Product images · Print-ready
            </span>
          </div>
        </motion.header>

        {personalizationProfile && (
          <section className="mb-8 grid gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 sm:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Personalization engine
              </div>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                {personalizationProfile.label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {personalizationProfile.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {personalizationProfile.differentiators.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Wellness profile (radar + stat cards) */}
        <WellnessProfilePanel answers={data.answers} result={data.result} />

        {/* Safety gate + clinician callouts */}
        {clinicianGuidance.length > 0 && (
          <Card className="mb-8 border-destructive/40 bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">
                Talk with a clinician or pharmacist before starting anything new
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                {clinicianGuidance.map((item) => (
                  <li key={item}>{item}</li>
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
                Based on your answers, no specific supplements rose above the baseline. Food-first
                wins. See your food-first plan below.
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec, i) => (
              <SupplementCard
                key={rec.supplement.id}
                rec={rec}
                rank={i + 1}
                answers={data.answers}
              />
            ))
          )}
        </section>

        {/* Not recommended today */}
        {notRecommended && notRecommended.length > 0 && (
          <section className="mt-10">
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Transparency
              </div>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                Not recommended for you today
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We deliberately excluded these — here's why.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {notRecommended.map((n) => (
                <div
                  key={n.supplementId}
                  className="rounded-xl border border-border/60 bg-card/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {n.supplementName}
                    </span>
                    <StatusBadge status={n.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{n.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

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

        {/* Quality checklist — what to demand from any supplement brand */}
        <section className="mt-10">
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Quality checklist
            </div>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              What a high-quality supplement looks like
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply this to every product on this page — and every product we did not pick.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                t: "Third-party tested",
                d: "USP Verified, NSF Certified for Sport, or Informed Choice / Informed Sport on the label.",
              },
              {
                t: "No proprietary blends",
                d: "Every active ingredient lists an exact mg or mcg dose — never hidden behind a 'blend'.",
              },
              {
                t: "Disclosed form",
                d: "Methylcobalamin not generic B12, magnesium glycinate not oxide, D3 not D2, EPA+DHA totals printed.",
              },
              {
                t: "Allergen + diet fit",
                d: "Vegan, gluten-free, lactose-free, gelatin-free flags match your profile — not just marketing.",
              },
              {
                t: "Conservative dose",
                d: "Per-capsule dose lets you titrate up with labs instead of mega-dosing on day one.",
              },
              {
                t: "Honest claims",
                d: "No 'cures', no 'detox', no before/after photos. FDA/FTC-aligned structure-function language only.",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{x.t}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Credibility: sources, testimonials, reading, tools, kit, FAQ */}
        <CredibilitySections />

        {/* Privacy + Disclosure */}
        <div className="mt-12 space-y-2 rounded-2xl border border-border/60 bg-card/40 p-5 text-center text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Privacy:</span> your answers stay on
            this device unless you choose to create a shareable link or export a PDF. Shareable
            links are sanitized — medical, medication, and pregnancy fields are stripped.
          </p>
          <p>
            Educational only. Not medical advice. Product links are Amazon affiliate links — ranking
            is commission-blind and computed before any product is attached.{" "}
            <Link to="/methodology" className="underline hover:text-primary">
              How this is scored
            </Link>{" "}
            ·{" "}
            <Link to="/affiliate-disclosure" className="underline hover:text-primary">
              Affiliate disclosure
            </Link>
          </p>
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
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

const STATUS_META: Record<RecommendationStatus, { label: string; cls: string }> = {
  recommended: { label: "Recommended", cls: "bg-primary/15 text-primary ring-primary/30" },
  consider: { label: "Consider", cls: "bg-sky-500/15 text-sky-300 ring-sky-500/30" },
  food_first: {
    label: "Food-first",
    cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  },
  test_first: { label: "Test first", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  clinician_only: {
    label: "Clinician only",
    cls: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  },
  not_recommended: { label: "Not recommended", cls: "bg-muted text-muted-foreground ring-border" },
  avoid: { label: "Avoid", cls: "bg-destructive/15 text-destructive ring-destructive/30" },
};

function StatusBadge({ status }: { status: RecommendationStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function SupplementCard({
  rec,
  rank,
  answers,
}: {
  rec: Recommendation;
  rank: number;
  answers: QuizAnswers;
}) {
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
                  isTop
                    ? "bg-gradient-primary text-primary-foreground glow-primary-sm"
                    : "bg-secondary text-foreground"
                }`}
              >
                {rank}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg leading-tight">{cleanName}</CardTitle>
                  {rec.status && <StatusBadge status={rec.status} />}
                  {isTop && (
                    <Badge className="gap-1 bg-gradient-primary text-primary-foreground">
                      <Award className="h-3 w-3" /> Top pick
                    </Badge>
                  )}
                </div>
                {rec.statusReason && (
                  <p className="mt-1 text-xs italic text-amber-300/90">{rec.statusReason}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {rec.supplement.category} · Evidence{" "}
                  <span className="font-semibold text-foreground">
                    {rec.supplement.evidenceLevel}
                  </span>{" "}
                  · Safety{" "}
                  <span className="font-semibold text-foreground">
                    {rec.supplement.safetyLevel}
                  </span>
                </p>
              </div>
            </div>
            <div
              className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone.color} ${tone.ring} ${tone.bg}`}
            >
              {tone.label}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">{rec.supplement.resultCopy}</p>

          <div className="rounded-xl border border-border/60 bg-background/30 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Signal precision
              </span>
              <span className="text-xs font-bold text-primary tabular-nums">
                {rec.precisionScore ?? Math.round(rec.score * 10)} / 100
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-primary"
                style={{ width: `${Math.min(100, rec.precisionScore ?? rec.score * 10)}%` }}
              />
            </div>
            {rec.personalizationTags && rec.personalizationTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rec.personalizationTags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border/70 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Amazon product card */}
          {product && (
            <div className="group/prod relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card-elevated/80 via-card-elevated/40 to-card-elevated/20 p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] transition-all hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)]">
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl ${TONE_STYLES[product.tone].bg}`}
              />
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
                  className="group relative flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card p-2 ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:h-44 sm:w-44"
                  aria-label={`${product.brand} ${product.title} — view on Amazon`}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={`${product.brand} ${product.title}`}
                      className="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center px-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {product.brand}
                      </div>
                      <div className="mt-1 text-base font-extrabold leading-tight text-foreground">
                        {product.pill}
                      </div>
                    </div>
                  )}
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

          {/* Sources */}
          {(() => {
            const cites = citationsFor(rec.supplement.id);
            if (cites.length === 0) return null;
            return (
              <div className="rounded-lg border border-border/60 bg-background/30 p-3 text-xs">
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Sources
                </div>
                <ul className="space-y-1">
                  {cites.map((c) => (
                    <li key={c.url}>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-foreground/90 hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="underline-offset-2 hover:underline">{c.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
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
            A clinician-style timeline built from your answers — dose, form, timing, and food
            pairing.
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Doses / day
          </div>
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
                  <div
                    key={idx}
                    className="grid gap-1 rounded-xl border border-border/40 bg-background/30 p-3 sm:grid-cols-[1.4fr_1fr]"
                  >
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
                <span className="text-xs font-bold uppercase tracking-wider">
                  Timing separations
                </span>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                {schedule.globalSeparations.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {schedule.trainingDayAdjustments.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Training-day adjustments
                </span>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
                {schedule.trainingDayAdjustments.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
