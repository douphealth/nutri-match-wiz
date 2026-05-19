import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Supplement Match — GearUpToFit" },
      {
        name: "description",
        content:
          "Why GearUpToFit built a safety-first supplement quiz: deterministic scoring, no diagnosis, no commission-weighted ranking, food-first by default.",
      },
      { property: "og:title", content: "About Supplement Match — GearUpToFit" },
      {
        property: "og:description",
        content: "Evidence-aware, commission-blind supplement recommendations by GearUpToFit.",
      },
      { property: "og:url", content: "https://gearuptofit.com/supplement-match/about" },
    ],
    links: [{ rel: "canonical", href: "https://gearuptofit.com/supplement-match/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>About Supplement Match</h1>
      <p>
        Supplement Match is a free tool from{" "}
        <a href="https://gearuptofit.com" rel="noopener">
          GearUpToFit
        </a>{" "}
        that turns a short evidence-aware quiz into a personalized, safety-first list of vitamins
        and supplements that actually fit your diet, training, lifestyle, and medications.
      </p>
      <h2>What we built</h2>
      <ul>
        <li>A catalog of 15+ supplements rated for evidence strength and safety.</li>
        <li>A deterministic scoring engine — the same answers always produce the same ranking.</li>
        <li>
          Safety gates for pregnancy, blood thinners, antidepressants, kidney/liver disease, and
          more.
        </li>
        <li>Food-first alternatives surfaced before any pill recommendation.</li>
      </ul>
      <h2>What we don't do</h2>
      <ul>
        <li>We do not diagnose, treat, cure, or prevent any disease.</li>
        <li>We never recommend iron without lab testing.</li>
        <li>We do not weight rankings by affiliate commission. Links are added after scoring.</li>
      </ul>
      <p>
        Want the methodology? Read <Link to="/methodology">how the score is calculated</Link>.
      </p>
    </article>
  );
}
