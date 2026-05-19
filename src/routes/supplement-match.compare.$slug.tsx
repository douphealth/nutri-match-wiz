import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  resolveComparePair,
  COMPARE_PAIRS,
  type ResolvedPair,
} from "@/lib/compare-pairs";
import type { TopicCopy } from "@/lib/seo-topics";

const BASE = "https://gearuptofit.com/supplement-match";

export const Route = createFileRoute("/supplement-match/compare/$slug")({
  loader: ({ params }) => {
    const resolved = resolveComparePair(params.slug);
    if (!resolved) throw notFound();
    return { resolved };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.resolved) {
      return { meta: [{ title: "Comparison not found — Supplement Match" }] };
    }
    const { a, b, pair } = loaderData.resolved;
    const url = `${BASE}/compare/${params.slug}`;
    const title = `${a.supplement} vs ${b.supplement}: Which Should You Take?`;
    const description = `${pair.decisionFrame} Side-by-side evidence, dosing, and safety — cited to NIH ODS and FDA.`;
    return {
      meta: [
        { title: `${title} | Supplement Match` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(buildSchema(loaderData.resolved, url, title, description)),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Comparison not found</h1>
      <p className="mt-2 text-muted-foreground">
        We don&apos;t have that side-by-side yet.{" "}
        <Link to="/supplement-match/topic/" className="underline">
          Browse all guides
        </Link>{" "}
        or{" "}
        <Link to="/" className="underline">
          take the quiz
        </Link>
        .
      </p>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </main>
  ),
  component: ComparePage,
});

function buildSchema(
  resolved: ResolvedPair,
  url: string,
  title: string,
  description: string,
) {
  const { a, b } = resolved;
  return [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: title,
      description,
      url,
      audience: { "@type": "MedicalAudience", audienceType: "Patient" },
      lastReviewed: new Date().toISOString().slice(0, 10),
      reviewedBy: {
        "@type": "Organization",
        name: "GearUpToFit Supplement Match",
        url: "https://gearuptofit.com",
      },
      about: [
        { "@type": "Drug", name: a.supplement },
        { "@type": "Drug", name: b.supplement },
      ],
      citation: [...a.citations, ...b.citations].map((c) => ({
        "@type": "CreativeWork",
        name: c.label,
        url: c.url,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Supplement Match", item: BASE },
        { "@type": "ListItem", position: 2, name: "Compare", item: `${BASE}/compare` },
        { "@type": "ListItem", position: 3, name: `${a.supplement} vs ${b.supplement}`, item: url },
      ],
    },
  ];
}

function Column({ t, accent }: { t: TopicCopy; accent: "primary" | "muted" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div
        className={
          accent === "primary"
            ? "text-xs font-semibold uppercase tracking-wider text-primary"
            : "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        }
      >
        Option {accent === "primary" ? "A" : "B"}
      </div>
      <h3 className="mt-1 text-xl font-bold">{t.supplement}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{t.lede}</p>

      <dl className="mt-5 space-y-4 text-sm">
        <Row label="Best fit for">
          <ul className="list-disc pl-5 space-y-1">
            {t.whoItMayHelp.slice(0, 3).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Row>
        <Row label="Avoid / use caution">
          <ul className="list-disc pl-5 space-y-1">
            {t.whoShouldAvoid.slice(0, 2).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Row>
        <Row label="Conservative dose">{t.dosing}</Row>
        <Row label="Food first">{t.foodFirst}</Row>
        {t.testFirst ? <Row label="Test first?">{t.testFirst}</Row> : null}
      </dl>

      <Link
        to="/supplement-match/topic/$topic"
        params={{ topic: t.slug }}
        className="mt-5 inline-flex items-center text-sm font-semibold text-primary hover:underline"
      >
        Read the full {t.supplement} guide →
      </Link>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  );
}

function ComparePage() {
  const { resolved } = Route.useLoaderData() as { resolved: ResolvedPair };
  const { a, b, pair } = resolved;
  const otherPairs = COMPARE_PAIRS.filter((p) => p.slug !== pair.slug).slice(0, 4);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Supplement Match
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Compare</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">
          {a.supplement} vs {b.supplement}
        </span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Side-by-side comparison
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {a.supplement} vs {b.supplement}: Which Should You Take?
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{pair.decisionFrame}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Neither comparison replaces a clinician&apos;s judgment. Use this page to frame the
          question, then take the quiz for a personalized, safety-screened plan.
        </p>
      </header>

      <section
        aria-label="Comparison"
        className="grid gap-5 md:grid-cols-2"
      >
        <Column t={a} accent="primary" />
        <Column t={b} accent="muted" />
      </section>

      <section className="mt-12 rounded-xl border border-border bg-muted/40 p-6 md:p-8">
        <h2 className="text-xl font-semibold">A 30-second decision framework</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="font-semibold text-foreground">Start with food.</strong> If diet
            already covers the gap, no supplement is the right answer.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Check the safety screen.</strong>{" "}
            Pregnancy, medications, age under 18, and key conditions can make either option a no
            today.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Match to your actual profile.</strong>{" "}
            Don&apos;t buy the trending one — buy the one that matches your labs, diet, training,
            and stage of life.
          </li>
        </ol>
        <Link
          to="/"
          className="mt-5 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Get my personalized plan →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Other comparisons</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {otherPairs.map((p) => (
            <li key={p.slug}>
              <Link
                to="/supplement-match/compare/$slug"
                params={{ slug: p.slug }}
                className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <div className="text-sm font-semibold capitalize">
                  {p.slug.replaceAll("-", " ")}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {p.decisionFrame}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-xs text-muted-foreground">
        Informational only — not medical advice. Always consult a qualified clinician before
        starting, stopping, or changing any supplement, especially during pregnancy, breastfeeding,
        or when taking medications.
      </p>
    </main>
  );
}
