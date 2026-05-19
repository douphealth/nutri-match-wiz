import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findTopic, SEO_TOPICS, type TopicCopy } from "@/lib/seo-topics";

const BASE = "https://gearuptofit.com/supplement-match";

export const Route = createFileRoute("/supplement-match/topic/$topic")({
  loader: ({ params }) => {
    const topic = findTopic(params.topic);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.topic) {
      return { meta: [{ title: "Topic not found — Supplement Match" }] };
    }
    const t = loaderData.topic;
    const url = `${BASE}/topic/${params.topic}`;
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
        {
          type: "application/ld+json",
          children: JSON.stringify(buildSchema(t, url)),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Topic not found</h1>
      <p className="mt-2 text-muted-foreground">
        We don't have a guide for that supplement yet.{" "}
        <Link to="/" className="underline">
          Take the quiz
        </Link>{" "}
        to get a personalized plan.
      </p>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </main>
  ),
  component: TopicPage,
});

function buildSchema(t: TopicCopy, url: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: t.metaTitle,
      description: t.metaDescription,
      url,
      about: {
        "@type": "Drug",
        name: t.supplement,
        nonProprietaryName: t.supplement,
      },
      audience: { "@type": "MedicalAudience", audienceType: "Patient" },
      lastReviewed: new Date().toISOString().slice(0, 10),
      reviewedBy: {
        "@type": "Organization",
        name: "GearUpToFit Supplement Match",
        url: "https://gearuptofit.com",
      },
      citation: t.citations.map((c) => ({
        "@type": "CreativeWork",
        name: c.label,
        url: c.url,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Supplement Match", item: BASE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Topics",
          item: `${BASE}/topic`,
        },
        { "@type": "ListItem", position: 3, name: t.supplement, item: url },
      ],
    },
  ];
}

function TopicPage() {
  const loaderData = Route.useLoaderData() as { topic: TopicCopy };
  const t = loaderData.topic;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Supplement Match
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Topics</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{t.supplement}</span>
      </nav>

      {/* Hero */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Evidence-based guide
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {t.h1}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t.lede}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
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

      {/* Test-first banner if applicable */}
      {t.testFirst ? (
        <aside
          role="note"
          className="mb-8 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <strong className="font-semibold">Test first.</strong> {t.testFirst}
        </aside>
      ) : null}

      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20">
        <h2>Who it may help</h2>
        <ul>
          {t.whoItMayHelp.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <h2>Who should not take it (without a clinician)</h2>
        <ul>
          {t.whoShouldAvoid.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <h2>Food first</h2>
        <p>{t.foodFirst}</p>

        <h2>What the evidence says</h2>
        <p>{t.evidenceSummary}</p>

        <h2>Conservative dosing</h2>
        <p>{t.dosing}</p>

        <h2>Quality checklist</h2>
        <ul>
          {t.qualityChecklist.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <h2>Safety and interactions</h2>
        <ul>
          {t.safety.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <h2>Frequently asked questions</h2>
        <div className="not-prose space-y-4">
          {t.faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border border-border bg-card p-4 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:hidden">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90">
                  ›
                </span>
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <h2>Sources</h2>
        <ul>
          {t.citations.map((c) => (
            <li key={c.url}>
              <a href={c.url} target="_blank" rel="noopener noreferrer nofollow">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </article>

      {/* CTA */}
      <section className="mt-12 rounded-xl border border-border bg-muted/40 p-6 md:p-8">
        <h2 className="text-xl font-semibold">Get a plan, not just a page</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A 2-minute quiz turns your diet, training, and medications into a personalized,
          safety-screened supplement plan — with food-first alternatives and a daily protocol.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Take the quiz →
        </Link>
      </section>

      {/* Related topics */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Related guides</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {t.related.map((slug) => {
            const r = SEO_TOPICS.find((x) => x.slug === slug);
            if (!r) return null;
            return (
              <li key={slug}>
                <Link
                  to="/supplement-match/topic/$topic"
                  params={{ topic: slug }}
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                >
                  <div className="text-sm font-semibold">{r.supplement}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {r.metaDescription}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-12 text-xs text-muted-foreground">
        This page is informational and not medical advice. Always consult a qualified clinician
        before starting, stopping, or changing any supplement — especially during pregnancy,
        breastfeeding, or when taking medications.
      </p>
    </main>
  );
}
