import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://gearuptofit.com/supplement-match/faq";
const TITLE = "Frequently Asked Questions — Supplement Match";
const DESCRIPTION =
  "Answers about our safety-first methodology, evidence policy, affiliate disclosure, privacy, and how the personalized supplement quiz works.";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "Is Supplement Match medical advice?",
    a: "No. Supplement Match is an educational tool and does not diagnose, treat, cure, or prevent any disease. Always consult a qualified clinician, pharmacist, or registered dietitian before starting, stopping, or changing any supplement — especially during pregnancy, breastfeeding, or when taking medications.",
  },
  {
    q: "How does the quiz produce a personalized plan?",
    a: "Your answers feed a deterministic, transparent scoring engine that weighs diet, training load, lifestyle, lab-risk markers, age, sex, life stage, and medication interactions against an evidence-aware supplement catalog. The same answers always produce the same ranking — there is no randomization and no LLM in the loop.",
  },
  {
    q: "What evidence base do you use?",
    a: "We reference the NIH Office of Dietary Supplements (ODS), the U.S. Food and Drug Administration (FDA), the American College of Obstetricians and Gynecologists (ACOG), and the International Society of Sports Nutrition (ISSN) position stands. We prefer conservative dosing ranges and prioritize food-first guidance wherever a nutrient gap can plausibly be closed with diet.",
  },
  {
    q: "How does the safety engine work?",
    a: "Before any supplement is recommended, it passes through a safety gate that suppresses or downgrades items based on age (under 18), pregnancy or breastfeeding, blood-thinner or other medication use, kidney/liver conditions, and known allergies. High-risk items like iron are never freely recommended — they are gated behind a 'test first with your clinician' flag.",
  },
  {
    q: "Why do you recommend food first?",
    a: "For most adults, a varied diet closes most nutrient gaps more safely, cheaply, and durably than supplementation. Every recommendation in your plan ships with a food-first alternative — supplements are positioned as a gap-filler, not a substitute for diet.",
  },
  {
    q: "Are the product picks neutral?",
    a: "Scoring happens before any commercial link is attached. We rank supplements purely on evidence, fit, and safety; only after ranking do we surface a hand-curated Amazon product per recommendation. See our affiliate disclosure for details.",
  },
  {
    q: "Do you store my answers?",
    a: "No. Your answers are encoded directly into the result URL — nothing is saved on a server, and no account is required. Closing the tab clears everything; sharing the URL shares the plan.",
  },
  {
    q: "Do you sell my data?",
    a: "No. We do not sell, rent, or share personal data. We do not run third-party ad trackers in the quiz or result pages.",
  },
  {
    q: "Why isn't supplement X recommended?",
    a: "Either the evidence base does not yet support it for your profile, the safety gate flagged it, or it duplicates a stronger recommendation already in your plan. The result page lists every supplement that was considered and why it was suppressed.",
  },
  {
    q: "Can I share my plan with my doctor?",
    a: "Yes — and we encourage it. The result page is designed to be printed or shared with a clinician, who can override or adjust anything based on labs and your full medical history.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
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
  component: FaqPage,
});

function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Supplement Match
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">FAQ</span>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Frequently asked
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          What people ask about Supplement Match
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Straight answers about our methodology, evidence, safety, privacy, and affiliate policy.
        </p>
      </header>

      <div className="space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-lg border border-border bg-card p-4 open:shadow-sm"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:hidden">
              <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-muted/40 p-6 md:p-8">
        <h2 className="text-xl font-semibold">Still curious?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Read the full scoring methodology, or take the 2-minute quiz to see how a real plan is
          built for your profile.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Take the quiz →
          </Link>
          <Link
            to="/methodology"
            className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Read the methodology
          </Link>
        </div>
      </section>
    </main>
  );
}
