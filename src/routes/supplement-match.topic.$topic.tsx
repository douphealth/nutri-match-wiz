import { createFileRoute, notFound } from "@tanstack/react-router";
import { findTopic } from "@/lib/seo-topics";
import { TopicView, buildTopicSchema, topicCanonicalUrl } from "@/components/topic/TopicView";

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
    // Canonical now points to the clean /supplement-match/<slug>/ URL.
    const url = topicCanonicalUrl(params.topic);
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
        { type: "application/ld+json", children: JSON.stringify(buildTopicSchema(t, url)) },
      ],
    };
  },
  component: TopicRouteComponent,
});

function TopicRouteComponent() {
  const { topic } = Route.useLoaderData() as { topic: ReturnType<typeof findTopic> };
  if (!topic) return null;
  return <TopicView topic={topic} />;
}
