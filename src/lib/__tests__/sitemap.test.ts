import { describe, it, expect } from "vitest";
import { Route as SitemapRoute } from "@/routes/sitemap[.]xml";
import { TOPIC_SLUGS } from "@/lib/seo-topics";
import { COMPARE_SLUGS } from "@/lib/compare-pairs";

type Handler = (ctx: { request: Request }) => Promise<Response>;

async function fetchSitemap(): Promise<string> {
  // Reach into the TanStack file route options to invoke the GET handler directly.
  const opts = (
    SitemapRoute as unknown as {
      options: { server: { handlers: { GET: Handler } } };
    }
  ).options;
  const res = await opts.server.handlers.GET({
    request: new Request("https://gearuptofit.com/sitemap.xml"),
  });
  return await res.text();
}

describe("sitemap", () => {
  it("includes clean canonical topic URLs", async () => {
    const xml = await fetchSitemap();
    for (const slug of TOPIC_SLUGS) {
      expect(xml).toContain(`/supplement-match/${slug}/`);
    }
  });

  it("does NOT include legacy /supplement-match/topic/<slug> URLs", async () => {
    const xml = await fetchSitemap();
    for (const slug of TOPIC_SLUGS) {
      expect(xml).not.toContain(`/supplement-match/topic/${slug}<`);
      expect(xml).not.toContain(`/supplement-match/topic/${slug}/`);
    }
  });

  it("includes the topic index page", async () => {
    const xml = await fetchSitemap();
    expect(xml).toContain(`/supplement-match/topic<`);
  });

  it("includes compare pages when they exist", async () => {
    const xml = await fetchSitemap();
    for (const slug of COMPARE_SLUGS) {
      expect(xml).toContain(`/supplement-match/compare/${slug}`);
    }
  });

  it("does NOT include personalized result pages or ?d= URLs", async () => {
    const xml = await fetchSitemap();
    expect(xml).not.toMatch(/[?&]d=/);
    // No "your match" slugs (privacy-sensitive personalized URLs).
    expect(xml).not.toMatch(/supplement-match\/[a-z0-9-]+\?/);
  });

  it("returns valid XML with the sitemap urlset", async () => {
    const xml = await fetchSitemap();
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
  });
});
