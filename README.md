# Supplement Match by GearUpToFit

Premium, evidence-aware supplement matching app. Built on TanStack Start v1 (React 19, Vite 7, Tailwind v4), deployed to Cloudflare Workers, embedded as a finder tool on **gearuptofit.com**.

## What it does

A deterministic quiz that maps a user's profile (age, sex, pregnancy status, diet, goals, lifestyle, medications, allergies, budget) onto a transparent scoring engine and produces:

- A personalized stack with **per-supplement status** — `recommended`, `consider`, `food_first`, `test_first`, `clinician_only`, or `avoid`.
- A **safety gate** that escalates to a clinician when blood thinners, antidepressants, kidney/liver disease, surgery, or pregnancy are flagged.
- A **clinician-style daily protocol** (slot, dose, form, food pairing, cadence, training-day adjustments).
- A **printable PDF livebook** (lazy-loaded — not in the initial bundle).
- Hand-curated **Amazon affiliate** picks (`tag=papalex-20`) ranked **commission-blind** — products are attached *after* scoring and filtered by an eligibility layer.
- 12 indexable **SEO topic guides** at the clean canonical URL `/supplement-match/<topic-slug>/`.

## Privacy model

Personal answers never appear in URLs by default.

- **Default flow.** When the quiz completes, answers are written to `sessionStorage` keyed by the generated slug. The browser is navigated to `/supplement-match/<slug>` — no `?d=` payload, no medical data in browser history, referrer headers, or server access logs.
- **Result page.** Reads from `sessionStorage`. If the slug is not in the current session (e.g. a bookmark in a new tab) the user is asked to retake the quiz.
- **Opt-in share links.** The result page has a "Create shareable link" button. It opens a privacy notice and, only on confirm, encodes a **sanitized** payload into `?d=`. Sanitization strips: pregnancy status, every medical/medication flag (blood thinners, antidepressants, diabetes / thyroid / blood-pressure meds, kidney/liver disease, heart disease, planned surgery, anemia history) and the free-text supplement notes. The receiver still gets a useful (if less precise) recommendation.
- **Legacy `?d=` links.** Old encoded URLs continue to work as a read-only fallback for back-compat. They are never *generated* by the app any more.
- **Result pages are `noindex, nofollow`** and excluded from the sitemap.

Nothing is stored server-side.

## SEO URL architecture

- **Canonical topic URL:** `/supplement-match/<topic-slug>/` (e.g. `/supplement-match/vitamin-d/`). These are the URLs listed in the sitemap and emitted as `rel="canonical"`.
- **Topic index:** `/supplement-match/topic` lists every guide.
- **Legacy compatibility:** `/supplement-match/topic/<slug>` still resolves to the same content for old inbound links, but its canonical points to the clean URL and it is **not** in the sitemap.
- **Personalized results:** `/supplement-match/<slug>` for any non-topic slug. Marked `noindex` and excluded from the sitemap.
- **Comparisons:** `/supplement-match/compare/<pair>` listed in the sitemap.

## Engine

`src/lib/engine/` is the single canonical scoring + safety engine. All consumers import from `@/lib/engine`. The old entry points are thin back-compat shims that re-export from the same barrel:

- `src/lib/supplementEngine.ts` → wrapper
- `src/lib/recommendation-engine.ts` → wrapper

## Policies

- **Safety-first.** Iron is never freely recommended without labs; melatonin is suppressed in pregnancy / under-18; high-dose D defaults to `test_first` for high-risk profiles.
- **Evidence-aware.** Every recommendation links to NIH ODS / FDA primary sources via `src/lib/evidence/evidence-matrix.ts`, with `lastChecked` and `supports` metadata per citation.
- **Affiliate-honest.** Commission-blind ranking; `rel="nofollow sponsored noopener"` on every outbound link; disclosure on the result page.

## Scripts

```bash
bun install
bun run dev          # local dev
bun run build        # production build
bun run test         # vitest (engine, safety gates, privacy, SEO)
bun run lint
```

## Project map

```
src/
  routes/
    index.tsx                              # the quiz (home)
    supplement-match.$slug.tsx             # dispatcher: topic page or private result
    supplement-match.topic.index.tsx       # /supplement-match/topic listing
    supplement-match.topic.$topic.tsx      # legacy /topic/<slug> (canonical → clean URL)
    supplement-match.compare.$slug.tsx     # comparison pages
    sitemap[.]xml.ts                       # dynamic sitemap (clean URLs only)
  lib/
    engine/                                # canonical scoring + safety engine
    result-storage.ts                      # sessionStorage flow + sanitized share links
    evidence/evidence-matrix.ts            # NIH/ODS/FDA citations per supplement
    supplement-products.ts                 # curated Amazon picks
    daily-schedule.ts                      # protocol builder
    seo-topics.ts                          # SEO content data
    pdf-report.ts                          # PDF livebook (lazy-loaded)
  types/supplements.ts                     # canonical types
```

## Testing

Vitest test suites (`src/lib/__tests__/`):

- `safety-engine.test.ts` — under-18, pregnancy, blood thinner, antidepressant, kidney/liver, iron test-first gates.
- `golden-fixtures.test.ts` — 8 deterministic profile fixtures (vegan athlete, pregnant, under-18, blood thinner, antidepressant, kidney disease, runner heavy sweater, older low-protein).
- `engine-extras.test.ts` — secondary scoring paths and edge cases.
- `evidence-traceability.test.ts` — every supplement has citations with `lastChecked` + `supports` metadata.
- `result-flow.test.ts` — sessionStorage round-trip, legacy `?d=` decode fallback, canonical topic slugs.
- `privacy.test.ts` — default navigation emits no `?d=`, sessionStorage round-trip, `buildShareUrl` strips every sensitive field individually.
- `sitemap.test.ts` — clean topic URLs included, legacy `/topic/<slug>` excluded, no personalized result pages.
- `engine-wrappers.test.ts` — `supplementEngine.ts` and `recommendation-engine.ts` are pure re-export shims of `@/lib/engine`.

## Dependency audit

```bash
bun run deps:audit   # knip
```

Configured in `knip.json`. Shadcn UI files are ignored (their Radix deps are real, knip can't infer dynamic re-exports).

## License

Proprietary — GearUpToFit.
