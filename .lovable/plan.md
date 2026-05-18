# Supplement Match — Full Parity Build

Bring the Supplement Match app up to the same shape as **Watch Finder** / **Shoe Finder** on gearuptofit.com, so it can be embedded into the WordPress site as a third "finder" tool.

## Outcome

A standalone TanStack Start app at `/` that:

- Runs as the entire site (Supplement Match IS the home page, not a sub-route), matching the Watch Finder pattern.
- Embeds cleanly inside the WordPress page on gearuptofit.com (transparent background, no own header/footer, iframe-friendly).
- Captures the user's email via a Brevo-powered email gate before revealing full results.
- Generates a downloadable PDF report of their personalized supplement plan.
- Surfaces Amazon affiliate product cards for each recommended supplement (commission-blind ranking).
- Lets users compare two supplements side-by-side at `/compare/$slug`.
- Has stable shareable result URLs at `/supplement-match/$slug?d=...`.
- Has proper SEO: per-route `head()`, JSON-LD (WebApplication + FAQPage + Product/BreadcrumbList where appropriate), sitemap.xml, robots.
- Includes supporting pages: `/about`, `/methodology`, `/affiliate-disclosure`.

## Stages

Work proceeds in 4 stages. Each stage ends in a working, deployable state so the user can preview progress.

### Stage 1 — Shell & quiz UX parity (no integrations yet)

- Replace placeholder `src/routes/index.tsx` with the Supplement Match quiz as the homepage (hero + step UI matching Watch Finder's `QuizHero` / `QuizProgress` / `QuizStepContent` / `QuizNavigation` pattern, with framer-motion transitions and AI Confidence meter).
- Port the existing 15+ supplement database, scoring engine, and safety gate from `src/lib/supplementData.ts` + `src/lib/supplementEngine.ts` into the new structure — `quiz-data.ts`, `recommendation-engine.ts`, `supplement-database.ts`.
- Add iframe-friendly root shell: transparent background, no internal header/footer chrome, viewport-fit, postMessage height reporter for WordPress embedding.
- Strip the standalone marketing homepage; remove the old `/supplement-match/` sub-route.
- Add `/about`, `/methodology`, `/affiliate-disclosure` static routes with their own `head()`.
- Add `src/routes/sitemap[.]xml.ts` and `robots.txt`.

### Stage 2 — Result routes, compare, share URLs

- Add `src/routes/supplement-match.$slug.tsx` — slug + base64 `d` search param encoding of answers; deterministic re-score on load; renders the full personalized report.
- Add `src/routes/supplement.$slug.tsx` — per-supplement detail page (educational + safety info + Amazon product card).
- Add `src/routes/compare.$slug.tsx` — two supplements side-by-side (slug = `vitamin-d-vs-magnesium`).
- Each route gets unique `head()` derived from loader data, including JSON-LD (Product / BreadcrumbList).

### Stage 3 — Brevo email gate + Amazon affiliate

- Connect the Brevo standard connector (`standard_connectors--connect`) so `BREVO_API_KEY` is injected.
- Build `EmailGate.tsx` (matches Watch Finder pattern) that blurs the full report until email submitted.
- `src/routes/api/public/brevo-subscribe.ts` — server route, Zod-validates email + UTM, calls Brevo via gateway, tags lead with `supplement-match-lead`.
- `src/lib/brevo-supplement-sequence.ts` — 5-email drip definitions (welcome, food-first, safety primer, top picks, deeper dive).
- Add Amazon affiliate tag handling — `src/lib/amazon.ts` builds tagged URLs from ASINs stored in supplement DB; product cards render after the email gate; commission-blind (links added after scoring).
- Optional Amazon PA-API server fn `amazon-product.functions.ts` for live price/title/image if `AMAZON_PAAPI_KEY` provided.

### Stage 4 — PDF report + polish

- `src/lib/supplement-report-pdf.ts` — generate branded PDF (pdf-lib, edge-safe) with logo, user inputs summary, ranked recommendations, food-first plan, safety warnings, disclosures.
- `src/lib/report-expiry.functions.ts` — 30-day expiry badge.
- Download-PDF CTA on the result page (after email gate).
- UTM capture (`src/lib/utm.ts`), web vitals (`src/lib/vitals.ts`).
- Final SEO pass: canonical hrefs to `https://gearuptofit.com/supplement-match/...`, OG images, structured data audit.

## Technical Notes

- **Stack**: TanStack Start v1 + React 19 + Vite 7 + Tailwind v4. No Supabase / Lovable Cloud needed — quiz is deterministic and stateless; the only backend touch is Brevo via the connector gateway and (optionally) Amazon PA-API. Skip enabling Cloud.
- **Brevo**: called server-side from `src/routes/api/public/brevo-subscribe.ts` via `https://connector-gateway.lovable.dev/brevo/...` with `Authorization: Bearer ${LOVABLE_API_KEY}` + `X-Connection-Api-Key: ${BREVO_API_KEY}`. Email validated with Zod. Rate-limited in-memory per-IP.
- **Amazon**: ASINs stored in `supplement-database.ts`. Default link builder uses `?tag=${AMAZON_AFFILIATE_TAG}` (publishable, can live in code or as a runtime secret). PA-API key only required for live product enrichment — graceful fallback to static data if absent.
- **Embed mode**: a `?embed=1` search param on the root sets a `data-embed` attribute that switches CSS to transparent bg and emits `postMessage({ type: 'supplementMatchHeight', height })` on resize so the WordPress iframe can auto-grow.
- **Slug + share URL**: `generateSlug(answers)` builds something like `vegan-endurance-female-30s`; the canonical answers are encoded into `?d=<base64url JSON>` so the page can re-score from URL alone.

## Out of scope (this round)

- User accounts / saving history (no Cloud)
- Practitioner directory
- Multi-language

## Files (Stage 1 only — listed for transparency)

```text
src/routes/index.tsx                       (rewrite — quiz homepage)
src/routes/__root.tsx                      (update — embed mode shell, no chrome)
src/routes/about.tsx                       (new)
src/routes/methodology.tsx                 (new)
src/routes/affiliate-disclosure.tsx        (new)
src/routes/sitemap[.]xml.ts                (new)
src/components/quiz/QuizHero.tsx           (new)
src/components/quiz/QuizProgress.tsx       (new)
src/components/quiz/QuizStepContent.tsx    (new)
src/components/quiz/QuizNavigation.tsx     (new)
src/lib/quiz-data.ts                       (new — steps + slug + encode helpers)
src/lib/recommendation-engine.ts           (port from supplementEngine.ts)
src/lib/supplement-database.ts             (port from supplementData.ts, add ASINs)
src/lib/utm.ts                             (new)
src/lib/vitals.ts                          (new)
src/lib/embed.ts                           (new — postMessage height reporter)
public/robots.txt                          (new)
# delete src/routes/supplement-match/*, src/components/supplement/*
```

Stages 2–4 add per-stage file lists once Stage 1 is approved.
