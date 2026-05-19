import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { TOPIC_SLUGS } from "@/lib/seo-topics";
import { COMPARE_SLUGS } from "@/lib/compare-pairs";

const BASE_URL = "https://gearuptofit.com/supplement-match";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/methodology", changefreq: "monthly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/affiliate-disclosure", changefreq: "yearly", priority: "0.3" },
          { path: "/topic", changefreq: "weekly", priority: "0.7" },
          // Clean canonical topic URLs (e.g. /supplement-match/vitamin-d/).
          // The legacy /topic/<slug> URLs still resolve but are not listed here.
          ...TOPIC_SLUGS.map((slug) => ({
            path: `/${slug}/`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...COMPARE_SLUGS.map((slug) => ({
            path: `/compare/${slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          // Personalized result pages are intentionally excluded — noindex + private.
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
