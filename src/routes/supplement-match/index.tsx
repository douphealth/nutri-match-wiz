import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FlaskConical, HeartPulse, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SupplementQuiz } from "@/components/supplement/SupplementQuiz";
import { FAQS } from "@/lib/supplementFaqs";

export const Route = createFileRoute("/supplement-match/")({
  head: () => ({
    meta: [
      { title: "Vitamin & Supplement Match Quiz | GearUpToFit" },
      {
        name: "description",
        content:
          "Free evidence-based vitamin and supplement quiz. Get a personalized, safety-first supplement plan with transparent scoring, food-first alternatives, and clinician guidance.",
      },
      { property: "og:title", content: "Vitamin & Supplement Match Quiz | GearUpToFit" },
      {
        property: "og:description",
        content:
          "Personalized, evidence-aware supplement recommendations with built-in safety checks. Educational only — not medical advice.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/supplement-match/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/supplement-match/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: SupplementMatchPage,
});

function SupplementMatchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/[0.06] to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <div className="space-y-6 text-center">
            <Badge variant="outline" className="mx-auto inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Evidence-aware · Safety-first
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Find Your Best-Fit Vitamins &amp; Supplements
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              Answer a quick evidence-based quiz and get a personalized, safety-first supplement plan — no hype, no
              miracle claims, no diagnosis.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { icon: FlaskConical, label: "Evidence-aware" },
                { icon: ShieldCheck, label: "Safety-first" },
                { icon: HeartPulse, label: "No diagnosis" },
                { icon: Lock, label: "Transparent scoring" },
              ].map((t) => (
                <Badge key={t.label} variant="secondary" className="gap-1.5">
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </Badge>
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <Button size="lg" asChild>
                <a href="#quiz">
                  Start Free Quiz <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="mx-auto max-w-2xl pt-2 text-xs text-muted-foreground">
              This tool is educational only. It does not diagnose, treat, cure, or prevent disease. Talk with a
              qualified healthcare professional before starting, stopping, or changing supplements.
            </p>
          </div>
        </div>
      </header>

      {/* Quiz */}
      <main id="quiz" className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <SupplementQuiz />
      </main>

      {/* Educational content */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-14 sm:py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <article className="space-y-3">
              <h2 className="text-2xl font-semibold">How the supplement quiz works</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The quiz asks about diet, lifestyle, goals, food intake, medications, and preferences. A deterministic
                local engine scores each supplement category against your answers, then applies safety gates (pregnancy,
                medications, chronic disease, planned surgery, under 18) before producing a personalized,
                evidence-aware report. Nothing is sent to a black-box AI — every recommendation cites the inputs that
                triggered it.
              </p>
            </article>
            <article className="space-y-3">
              <h2 className="text-2xl font-semibold">How to choose supplements safely</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start with food. Pick supplements only when there is a clear gap or goal. Prefer simple, single-ingredient
                products with conservative doses. Check for medication interactions with a pharmacist. Re-evaluate after
                8–12 weeks — supplements you don&apos;t need are wasted money and added risk.
              </p>
            </article>
            <article className="space-y-3">
              <h2 className="text-2xl font-semibold">Why third-party testing matters</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Dietary supplements are not FDA-approved before marketing. Independent verification — USP, NSF,
                Informed Sport, Informed Choice, ConsumerLab — confirms label accuracy and screens for contaminants and
                banned substances. For athletes, Informed Sport or NSF Certified for Sport is the standard.
              </p>
            </article>
            <article className="space-y-3">
              <h2 className="text-2xl font-semibold">Food-first vs. supplement-first</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Whole foods deliver nutrients in a matrix the body recognizes, with fiber, polyphenols, and protein along
                for the ride. Supplements are best used to fill a real, identified gap — not as a substitute for
                vegetables, sleep, training, or sun exposure.
              </p>
            </article>
            <article className="space-y-3 md:col-span-2">
              <h2 className="text-2xl font-semibold">When to talk to a clinician</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Talk with a clinician before starting supplements if you are pregnant, breastfeeding, or trying to
                conceive; under 18; taking prescription medication (especially blood thinners, antidepressants, diabetes,
                thyroid, or blood pressure medication); have kidney, liver, or heart disease; have surgery planned; have
                a history of anemia or kidney stones; or are experiencing new or severe symptoms. A pharmacist is an
                excellent (and often free) resource for interaction checks.
              </p>
            </article>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-xs text-muted-foreground">
          <p>
            <strong>Medical disclaimer.</strong> This tool is for educational purposes only and does not provide medical
            advice, diagnosis, or treatment. Supplements can interact with medications and may not be appropriate for
            everyone. Talk with a qualified healthcare professional before starting, stopping, or changing supplements.
          </p>
          <p>
            <Link to="/" className="underline-offset-2 hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
