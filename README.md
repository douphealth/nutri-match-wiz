# Nutri-Match Wiz — Supplement Match for GearUpToFit

Premium, evidence-aware supplement matching app. Built on TanStack Start v1 (React 19, Vite 7, Tailwind v4), deployed to Cloudflare Workers, embedded as a finder tool on **gearuptofit.com**.

## What it does

A deterministic, stateless quiz that maps a user's profile (age, sex, pregnancy status, diet, goals, lifestyle, medications, allergies, budget) onto a transparent scoring engine and produces:

- A personalized stack with **per-supplement status** — `recommended`, `consider`, `food_first`, `test_first`, `clinician_only`, or `avoid`.
- A **safety gate** that escalates to a clinician when blood thinners, antidepressants, kidney/liver disease, surgery, or pregnancy are flagged.
- A **clinician-style daily protocol** (slot, dose, form, food pairing, cadence, training-day adjustments).
- A **printable PDF livebook**.
- Hand-curated **Amazon affiliate** picks (`tag=papalex-20`) ranked **commission-blind** — products are attached *after* scoring.
- 12 indexable **SEO topic pages** at `/supplement-match/topic/<slug>` with MedicalWebPage + FAQPage + BreadcrumbList JSON-LD.

## Policies

- **Safety-first.** Iron is never freely recommended without labs; melatonin is suppressed in pregnancy / under-18; high-dose D defaults to `test_first` for high-risk profiles.
- **Evidence-aware.** Every recommendation links to NIH ODS / FDA primary sources via `src/lib/evidence/evidence-matrix.ts`.
- **Affiliate-honest.** Commission-blind ranking; `rel="nofollow sponsored noopener"` on every outbound link; disclosure on the result page.
- **Privacy.** Answers are encoded in the result URL only — nothing stored server-side.

## Scripts

```bash
bun install
bun run dev          # local dev
bun run build        # production build
bun run test         # vitest (safety engine guarantees)
bun run lint
```

## Project map

```
src/
  routes/
    index.tsx                              # the quiz (home)
    supplement-match.$slug.tsx             # personalized result
    supplement-match.topic.$topic.tsx      # 12 SEO topic guides
    sitemap[.]xml.ts                       # dynamic sitemap
  lib/
    supplementEngine.ts                    # deterministic scoring + safety gates
    evidence/evidence-matrix.ts            # NIH/ODS/FDA citations per supplement
    supplement-products.ts                 # curated Amazon picks
    daily-schedule.ts                      # protocol builder
    seo-topics.ts                          # SEO content data
    pdf-report.ts                          # PDF livebook
  types/supplements.ts                     # canonical types
```

## Testing

Vitest enforces the safety engine's hard guarantees: under-18 suppression, pregnancy melatonin block, blood-thinner omega-3 escalation, iron test-first policy, deterministic scoring. Add tests under `src/**/*.test.ts`.

## License

Proprietary — GearUpToFit.
