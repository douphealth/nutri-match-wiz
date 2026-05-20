import { useState } from "react";
import { ChevronDown, ArrowRight, BookOpen, Sparkles } from "lucide-react";

/**
 * SEO landing section for https://gearuptofit.com/supplement-match/
 * Semantic H1/H2s, curated internal links to GearUpToFit posts, FAQ.
 * JSON-LD for this section is emitted from the route head() in src/routes/index.tsx
 * to avoid duplicate/competing tag injection on this TanStack Start stack.
 */

const SITE = "https://gearuptofit.com";

export const RECOMMENDED_POSTS = [
  {
    title: "Best Pre-Workout Supplements: A Science-Backed Guide",
    url: `${SITE}/best-pre-workout-supplements/`,
    excerpt:
      "Caffeine, beta-alanine, citrulline — what actually moves the needle on training performance, and what doesn't.",
    category: "Supplements",
    image: `${SITE}/wp-content/uploads/pre-workout-guide.jpg`,
    datePublished: "2025-02-10",
    dateModified: "2025-05-12",
  },
  {
    title: "Creatine Monohydrate: Dosing, Timing & Myths",
    url: `${SITE}/creatine-monohydrate-guide/`,
    excerpt:
      "The most-researched legal performance supplement on earth. Here's how to use it for strength, hypertrophy and endurance.",
    category: "Supplements",
    image: `${SITE}/wp-content/uploads/creatine-guide.jpg`,
    datePublished: "2025-01-18",
    dateModified: "2025-04-20",
  },
  {
    title: "Protein Powder: Whey vs Casein vs Plant-Based",
    url: `${SITE}/protein-powder-comparison/`,
    excerpt:
      "Pick the right protein for your goal, digestion and training timing — without overpaying for marketing.",
    category: "Nutrition",
    image: `${SITE}/wp-content/uploads/protein-comparison.jpg`,
    datePublished: "2025-03-05",
    dateModified: "2025-05-18",
  },
  {
    title: "Electrolytes & Hydration for Runners",
    url: `${SITE}/electrolytes-hydration-runners/`,
    excerpt:
      "Sodium, potassium, magnesium — when supplementation actually helps endurance, and when plain water is fine.",
    category: "Running",
    image: `${SITE}/wp-content/uploads/electrolytes-runners.jpg`,
    datePublished: "2025-02-22",
    dateModified: "2025-05-01",
  },
  {
    title: "Vitamin D, Omega-3 & Magnesium: The Foundational Three",
    url: `${SITE}/foundational-supplements-vitamin-d-omega-3-magnesium/`,
    excerpt:
      "Three supplements with strong evidence for general health, recovery, and sleep — and how to dose them safely.",
    category: "Health",
    image: `${SITE}/wp-content/uploads/foundational-three.jpg`,
    datePublished: "2025-01-30",
    dateModified: "2025-04-28",
  },
  {
    title: "Fat Burners: What Works, What's Hype, What's Risky",
    url: `${SITE}/fat-burners-guide/`,
    excerpt:
      "An evidence-first breakdown of thermogenics, appetite suppressants, and the few ingredients with real human data.",
    category: "Supplements",
    image: `${SITE}/wp-content/uploads/fat-burners-guide.jpg`,
    datePublished: "2025-03-14",
    dateModified: "2025-05-15",
  },
];

export const FAQS = [
  {
    q: "How does the Supplement Match quiz work?",
    a: "Supplement Match asks about your training goal, diet, training volume, sleep, and budget, then recommends supplement categories backed by peer-reviewed research — never random products.",
  },
  {
    q: "Is Supplement Match free to use?",
    a: "Yes. Supplement Match is 100% free and requires no account. Your answers stay in your browser.",
  },
  {
    q: "Does GearUpToFit sell the supplements it recommends?",
    a: "No. GearUpToFit is an independent recommendation engine. Some outbound links may be affiliate links, but every recommendation is chosen on evidence first.",
  },
  {
    q: "Is this medical advice?",
    a: "No. Supplement Match is educational. If you take medication, are pregnant, or have a medical condition, consult a qualified clinician before starting any supplement.",
  },
  {
    q: "Which supplements have the strongest evidence?",
    a: "Creatine monohydrate, whey/casein protein, caffeine, vitamin D (if deficient), omega-3, and electrolytes for endurance athletes have the strongest human evidence for the goals they target.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-card/70"
      >
        <span className="text-sm font-semibold text-foreground sm:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          {a}
        </div>
      )}
    </div>
  );
}

export default function SupplementMatchSEO() {
  return (
    <section aria-label="About Supplement Match" className="border-t border-border/60 bg-background">
      {/* Intro */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Free · Science-Backed · 2-Minute Quiz
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Supplement Match — Personalized,{" "}
          <span className="text-primary">Evidence-First</span> Recommendations
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tell us your training goal, diet, and budget. We'll recommend the supplements with the
          strongest human research for <em>your</em> situation — no fluff, no upsells, no random
          "stacks". Built by GearUpToFit's editorial team using peer-reviewed sources and ISSN
          position stands.
        </p>
      </div>

      {/* Recommended reading */}
      <div className="border-t border-border/60 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mb-8 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Recommended Reading
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RECOMMENDED_POSTS.map((p) => (
              <article
                key={p.url}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {p.category}
                  </span>
                  <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary">
                    <a href={p.url} rel="noopener">
                      {p.title}
                    </a>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </p>
                  <a
                    href={p.url}
                    rel="noopener"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                  >
                    Read article <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Supplement Match FAQ
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Honest answers about how the quiz works and what the science actually supports.
          </p>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
