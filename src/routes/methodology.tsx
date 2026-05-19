import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — How Supplement Match Scores Recommendations" },
      {
        name: "description",
        content:
          "The deterministic scoring engine behind Supplement Match: how diet, training, lifestyle, and medication signals turn into a personalized supplement plan.",
      },
      { property: "og:title", content: "Methodology — Supplement Match" },
      {
        property: "og:description",
        content:
          "Transparent, deterministic scoring. Safety gates. Confidence levels. Food-first alternatives. No commission bias.",
      },
      { property: "og:url", content: "https://gearuptofit.com/supplement-match/methodology" },
    ],
    links: [{ rel: "canonical", href: "https://gearuptofit.com/supplement-match/methodology" }],
  }),
  component: MethodologyPage,
});

function MethodologyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Methodology</h1>

      <h2>1. Catalog</h2>
      <p>
        Each supplement in the catalog carries an <em>evidence level</em> (Strong, Moderate,
        Limited, Situational) and a <em>safety level</em> (Low, Moderate, High caution), plus
        contraindications, common drug interactions, and food-first alternatives. These are
        populated from public references such as NIH ODS fact sheets and position stands from the
        ISSN, ACSM, AGA, ACOG, and Endocrine Society.
      </p>

      <h2>2. Scoring</h2>
      <p>
        Every supplement starts at zero points. Specific quiz answers add points (e.g. low sun
        exposure adds points to Vitamin D; vegan diet adds points to B12). The same answers always
        produce the same ranking — the engine is deterministic and stateless.
      </p>

      <h2>3. Safety gates</h2>
      <p>
        Pregnancy, breastfeeding, age &lt; 18, blood thinners, antidepressants, diabetes medication,
        thyroid medication, blood pressure medication, kidney/liver disease, heart disease, planned
        surgery, and history of anemia all trigger explicit clinician-review warnings. High-caution
        supplements (iron, calcium, melatonin) have additional gates — iron, for example, is never
        recommended without lab testing.
      </p>

      <h2>4. Confidence</h2>
      <p>
        Each recommendation carries a confidence level (Low, Moderate, High) that combines the
        supplement's evidence level with how strongly your answers point to it. If the safety gate
        is triggered, confidence on non-low-risk items is downgraded.
      </p>

      <h2>5. Commission-blind ranking</h2>
      <p>
        Affiliate links (Amazon, third-party-tested brands) are added <em>after</em> scoring
        finishes. The engine has no knowledge of payouts and cannot reorder by them.
      </p>

      <p>
        Ready? <Link to="/">Take the quiz</Link>.
      </p>
    </article>
  );
}
