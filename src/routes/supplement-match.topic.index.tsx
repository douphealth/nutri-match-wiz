import { createFileRoute, Link } from "@tanstack/react-router";
import { SEO_TOPICS } from "@/lib/seo-topics";
import { COMPARE_PAIRS } from "@/lib/compare-pairs";

const BASE = "https://gearuptofit.com/supplement-match";
const URL = `${BASE}/topic`;
const TITLE = "Evidence-Based Supplement Guides — Supplement Match";
const DESCRIPTION =
  "Browse 12 conservative, evidence-aware supplement guides — vitamin D, B12, omega-3, magnesium, iron, creatine, and more. Food-first, safety-screened, and citation-backed.";

export const Route = createFileRoute("/supplement-match/topic/")({
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
        children: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: TITLE,
            description: DESCRIPTION,
            url: URL,
            isPartOf: { "@type": "WebSite", name: "Supplement Match", url: BASE },
            hasPart: SEO_TOPICS.map((t) => ({
              "@type": "MedicalWebPage",
              name: t.metaTitle,
              url: `${BASE}/topic/${t.slug}`,
              about: { "@type": "Drug", name: t.supplement },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Supplement Match", item: BASE },
              { "@type": "ListItem", position: 2, name: "Guides", item: URL },
            ],
          },
        ]),
      },
    ],
  }),
  component: TopicIndex,
});

function TopicIndex() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Supplement Match
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">Guides</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Evidence-based library
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Supplement guides, written conservatively
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every guide is food-first, safety-screened, and cited to NIH ODS, FDA, ACOG, or ISSN. No
          hype, no proprietary blends, no fear-marketing.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Get my personalized plan →
          </Link>
          <Link
            to="/methodology"
            className="inline-flex items-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            How we score
          </Link>
        </div>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SEO_TOPICS.map((t) => (
          <li key={t.slug}>
            <Link
              to="/supplement-match/topic/$topic"
              params={{ topic: t.slug }}
              className="group block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.testFirst ? "Test first" : "Guide"}
              </div>
              <div className="mt-1 text-base font-semibold text-foreground group-hover:text-primary">
                {t.supplement}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.metaDescription}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">Side-by-side comparisons</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Common decisions, framed in a 30-second checklist — food first, safety screen, then a
          match to your actual profile.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARE_PAIRS.map((p) => (
            <li key={p.slug}>
              <Link
                to="/supplement-match/compare/$slug"
                params={{ slug: p.slug }}
                className="block h-full rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="text-sm font-semibold capitalize text-foreground">
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
        This library is informational and not medical advice. Always consult a qualified clinician
        before starting, stopping, or changing any supplement.
      </p>
    </main>
  );
}
