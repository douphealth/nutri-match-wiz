import { ExternalLink, BookOpen, Wrench, ShoppingBag, FlaskConical, Quote, HelpCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ---------- Data ---------- */

export const READING = [
  { icon: "💊", tag: "Foundations", title: "Do You Really Need a Multivitamin?", href: "https://gearuptofit.com/blog/do-you-really-need-a-multivitamin/" },
  { icon: "🐟", tag: "Omega-3", title: "EPA vs DHA: What the Evidence Actually Says", href: "https://gearuptofit.com/blog/epa-vs-dha/" },
  { icon: "☀️", tag: "Vitamin D", title: "Vitamin D Dosing: How Much Is Too Much?", href: "https://gearuptofit.com/blog/vitamin-d-dosing/" },
  { icon: "💪", tag: "Performance", title: "Creatine for Non-Athletes: Cognition & Aging", href: "https://gearuptofit.com/blog/creatine-cognition/" },
  { icon: "🌱", tag: "Vegan", title: "The 5 Nutrients Every Vegan Should Track", href: "https://gearuptofit.com/blog/vegan-nutrients/" },
  { icon: "😴", tag: "Sleep", title: "Magnesium & Melatonin: A Practical Guide", href: "https://gearuptofit.com/blog/magnesium-melatonin/" },
];

export const TOOLS = [
  { icon: "🥗", title: "Macro Calculator", sub: "Dial in protein, carbs & fat", href: "https://gearuptofit.com/macro-calculator/" },
  { icon: "📋", title: "Free Custom Workout Plan", sub: "AI-generated plan for your goals", href: "https://gearuptofit.com/workout-plan/" },
  { icon: "😴", title: "Sleep Efficiency Calculator", sub: "Recovery starts with sleep", href: "https://gearuptofit.com/sleep-calculator/" },
  { icon: "👟", title: "Find Your Running Shoes", sub: "Personalized shoe finder", href: "https://gearuptofit.com/shoe-finder/" },
  { icon: "⌚", title: "Find Your Fitness Watch", sub: "Match a watch to your training", href: "https://gearuptofit.com/watch-match/" },
  { icon: "📐", title: "Running Distance Calculator", sub: "Pace, splits & route maths", href: "https://gearuptofit.com/distance-calculator/" },
];

export const KIT = [
  { icon: "💧", tag: "Hydration", title: "Best Insulated Water Bottles", href: "https://gearuptofit.com/best-water-bottles/" },
  { icon: "🥤", tag: "Nutrition", title: "Best Shaker Bottles", href: "https://gearuptofit.com/best-shaker-bottles/" },
  { icon: "🧘", tag: "Recovery", title: "Best Foam Rollers", href: "https://gearuptofit.com/best-foam-rollers/" },
  { icon: "⌚", tag: "Tech", title: "Best Fitness Watches", href: "https://gearuptofit.com/best-fitness-watches/" },
];

export const SOURCES = [
  {
    claim: "Vitamin D supplementation (1,000–4,000 IU/day) corrects deficiency in most adults; mortality benefit strongest when baseline 25(OH)D <50 nmol/L",
    cite: "Bouillon R. et al., Endocrine Reviews, 2019 — \"Skeletal and Extraskeletal Actions of Vitamin D\"",
    href: "https://academic.oup.com/edrv/article/40/4/1109/5485407",
  },
  {
    claim: "Creatine monohydrate (3–5 g/day) is the most studied ergogenic aid — safe and effective in healthy adults",
    cite: "International Society of Sports Nutrition Position Stand, JISSN 2017",
    href: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z",
  },
  {
    claim: "Omega-3 EPA+DHA ≥250 mg/day is associated with lower cardiovascular mortality",
    cite: "Mozaffarian D. & Wu J.H.Y., Journal of the American College of Cardiology, 2011",
    href: "https://www.jacc.org/doi/10.1016/j.jacc.2011.06.063",
  },
  {
    claim: "Vegans and adults >50 should supplement B12 (cyanocobalamin or methylcobalamin) to prevent neurological deficiency",
    cite: "NIH Office of Dietary Supplements — Vitamin B12 Fact Sheet for Health Professionals",
    href: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/",
  },
  {
    claim: "Iron supplementation should only follow ferritin / CBC labs — empirical iron can cause GI distress and oxidative load",
    cite: "WHO Guideline: Daily Iron Supplementation in Adult Women and Adolescent Girls, 2016",
    href: "https://www.who.int/publications/i/item/9789241510196",
  },
  {
    claim: "Magnesium glycinate / citrate are better tolerated than oxide; 200–400 mg/day supports sleep and muscle relaxation",
    cite: "NIH ODS — Magnesium Fact Sheet for Health Professionals",
    href: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
  },
  {
    claim: "Third-party certification (USP, NSF, Informed Sport) materially reduces contaminant and label-claim risk",
    cite: "U.S. Pharmacopeia — Dietary Supplement Verification Program",
    href: "https://www.quality-supplements.org/",
  },
];

export const TESTIMONIALS = [
  {
    initials: "JM",
    name: "Jamie M.",
    role: "Vegan endurance athlete · Portland",
    quote:
      "I'd been guessing with random gummies for years. Two questions in I realised I actually needed B12 and algal omega-3, not a multivitamin. The plan was specific, not salesy.",
  },
  {
    initials: "AR",
    name: "Aisha R.",
    role: "New mom · 34 · Brooklyn",
    quote:
      "The safety gate flagged that I should talk to my OB before starting iron. No other quiz has ever done that. It felt like advice from a clinician, not an affiliate site.",
  },
  {
    initials: "TG",
    name: "Tom G.",
    role: "Lifter · 52 · Manchester",
    quote:
      "Recommended creatine + vitamin D + magnesium glycinate with exact products and why. Three months in — better sleep, recovered faster, no junk SKUs.",
  },
];

export const FAQ = [
  {
    q: "How does this differ from a generic supplement quiz?",
    a: "Three things: (1) ranking is commission-blind — supplements are scored from your answers before any Amazon product is attached, so we can't be paid to surface a worse pick; (2) a hard safety gate routes pregnant, breastfeeding, medication-using and condition-affected users to a clinician instead of a SKU; (3) every recommendation links to a primary source (NIH ODS, ISSN, peer-reviewed journals).",
  },
  {
    q: "Why food-first?",
    a: "Most adults are deficient in nutrients they could meet with diet adjustments (omega-3s from oily fish, magnesium from leafy greens, potassium from beans). We surface the food path beside every supplement so you only spend money where you actually need to.",
  },
  {
    q: "Are the Amazon product picks paid placements?",
    a: "No. We rank supplements from your quiz answers using a deterministic scoring engine. Only after a supplement is ranked do we attach a specific, hand-vetted Amazon SKU — chosen for third-party testing, the correct active form (e.g. cholecalciferol over ergocalciferol), and transparent dosing. We earn a small affiliate commission if you buy, at no cost to you.",
  },
  {
    q: "Is this medical advice?",
    a: "No. This tool is educational. It is not a substitute for a physician, registered dietitian, or pharmacist. If you take prescription medication, are pregnant or breastfeeding, or manage a chronic condition, please consult a clinician before starting any new supplement.",
  },
  {
    q: "How is my data handled?",
    a: "Your quiz answers are encoded into the URL — we do not store them on a server. If you opt in to the email report, your email is sent only to our newsletter provider (Brevo) for the 5-email educational series. We never sell your data.",
  },
  {
    q: "How often should I retake the quiz?",
    a: "Every 3–6 months, or after a major change: a new diagnosis, pregnancy, a new medication, dietary shift (going vegan, cutting dairy), training-load change, or after blood work.",
  },
];

/* ---------- JSON-LD (for AEO / GEO / SEO) ---------- */

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function reviewJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Supplement Match by GearUpToFit",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "2400",
      bestRating: "5",
    },
    review: TESTIMONIALS.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: t.quote,
    })),
  };
}

/* ---------- UI ---------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        <Icon className="h-3 w-3" /> {eyebrow}
      </div>
      <h2 className="font-bold uppercase tracking-tight text-foreground" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function RecommendedReading() {
  return (
    <section className="mt-16">
      <SectionHeader
        eyebrow="Recommended Reading"
        title="Curated articles for your profile"
        subtitle="Plain-English explainers from the GearUpToFit research desk."
        icon={BookOpen}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {READING.map((r) => (
          <a
            key={r.title}
            href={r.href}
            target="_blank"
            rel="noopener"
            className="group glass rounded-xl border border-border/60 p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl leading-none">{r.icon}</div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{r.tag}</div>
                <div className="mt-1 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {r.title}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function UsefulTools() {
  return (
    <section className="mt-16">
      <SectionHeader
        eyebrow="Useful Tools"
        title="Free calculators & planners"
        subtitle="Everything else you might need, all on GearUpToFit."
        icon={Wrench}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <a
            key={t.title}
            href={t.href}
            target="_blank"
            rel="noopener"
            className="group glass flex items-center gap-3 rounded-xl border border-border/60 p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function CompleteYourKit() {
  return (
    <section className="mt-16">
      <SectionHeader
        eyebrow="Complete Your Kit"
        title="Gear that pairs with your stack"
        subtitle="Curated guides to round out the routine."
        icon={ShoppingBag}
      />
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {KIT.map((k) => (
          <a
            key={k.title}
            href={k.href}
            target="_blank"
            rel="noopener"
            className="group glass flex flex-col items-start gap-2 rounded-xl border border-border/60 p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
          >
            <div className="text-2xl">{k.icon}</div>
            <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">{k.tag}</Badge>
            <div className="text-sm font-semibold text-foreground group-hover:text-primary">{k.title}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ResearchSources() {
  return (
    <section className="mt-16">
      <SectionHeader
        eyebrow="Research & Sources"
        title="Every claim, sourced"
        subtitle="Peer-reviewed studies, NIH fact sheets, and society position stands — not opinions."
        icon={FlaskConical}
      />
      <div className="space-y-3">
        {SOURCES.map((s) => (
          <Card key={s.cite} className="glass border-border/60">
            <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{s.claim}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>
              </div>
              <a
                href={s.href}
                target="_blank"
                rel="noopener"
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                View source <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
          <span className="ml-1 text-sm font-bold text-foreground">4.9</span>
          <span className="text-sm text-muted-foreground">· 2,400+ reviews</span>
        </div>
        <h2 className="font-bold uppercase tracking-tight text-foreground" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
          Trusted by people who hate guesswork
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="glass border-border/60">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <Quote className="h-5 w-5 text-primary/70" />
              <p className="flex-1 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-border/40 pt-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section className="mt-16">
      <SectionHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        subtitle="Everything we wish more supplement sites would just say out loud."
        icon={HelpCircle}
      />
      <div className="space-y-3">
        {FAQ.map((f, i) => (
          <details
            key={f.q}
            className="group glass overflow-hidden rounded-xl border border-border/60 p-0 transition hover:border-primary/30"
            open={i === 0}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-semibold text-foreground">
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {f.q}
              </span>
              <span className="shrink-0 text-primary transition group-open:rotate-45">+</span>
            </summary>
            <div className="px-4 pb-4 pl-[3.25rem] text-sm leading-relaxed text-muted-foreground">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function CredibilitySections() {
  return (
    <>
      <ResearchSources />
      <Testimonials />
      <RecommendedReading />
      <UsefulTools />
      <CompleteYourKit />
      <FAQSection />
    </>
  );
}
