import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate Disclosure — Supplement Match by GearUpToFit" },
      {
        name: "description",
        content:
          "How GearUpToFit handles affiliate links in Supplement Match: commission-blind ranking, no extra cost to you, full FTC compliance.",
      },
      { property: "og:title", content: "Affiliate Disclosure — Supplement Match" },
      {
        property: "og:description",
        content: "Affiliate links never influence rankings. Full FTC-compliant disclosure.",
      },
      {
        property: "og:url",
        content: "https://gearuptofit.com/supplement-match/affiliate-disclosure",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://gearuptofit.com/supplement-match/affiliate-disclosure",
      },
    ],
  }),
  component: AffiliateDisclosurePage,
});

function AffiliateDisclosurePage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Affiliate Disclosure</h1>
      <p>
        GearUpToFit is a participant in the Amazon Services LLC Associates Program and
        other affiliate programs. When you click a product link inside Supplement Match
        and make a purchase, we may earn a small commission — at no additional cost to you.
      </p>
      <h2>How affiliate links interact with our ranking</h2>
      <p>
        Our scoring engine is <strong>commission-blind</strong>. Affiliate links are added
        only <em>after</em> the recommendation list is calculated. If the top-ranked
        supplement earns us nothing and the fourth-ranked supplement earns us a commission,
        the top-ranked supplement still wins.
      </p>
      <h2>Product selection</h2>
      <p>
        We prioritize products that are independently verified by third parties (USP, NSF,
        Informed Sport, Informed Choice, ConsumerLab) when those options exist. We do not
        accept payment from brands to be featured in the catalog.
      </p>
      <h2>Questions</h2>
      <p>
        Reach the team at{" "}
        <a href="mailto:hello@gearuptofit.com">hello@gearuptofit.com</a>.
      </p>
    </article>
  );
}
