# Repo Audit & Optimization Plan

Comprehensive refactor of nutri-match-wiz across efficiency, safety, SEO, privacy, and maintainability. Sequenced so existing quiz/result flow keeps working at every step.

## Phase 1 — Foundation (low risk, no behavior change)

1. **Rename package** — `package.json` name → `gearuptofit-supplement-match`. Scripts/deploy unaffected (name is metadata only; `wrangler.jsonc` uses its own name).
2. **Remove unused deps** — audit with `depcheck`/grep; drop anything not imported. Verify build after.
3. **Lazy-load PDF + result-only chunks** — `pdf-report.ts` (jsPDF is heavy) becomes dynamic `import()` inside the download handler. Result-page subcomponents (`CredibilitySections`, charts) → `React.lazy` where safe.

## Phase 2 — Engine refactor (preserve determinism)

Split `src/lib/supplementEngine.ts` (933 lines) into pure modules under `src/lib/engine/`:

```
engine/
  safety-gates.ts        # age<18, pregnancy, meds, organ disease → block/downgrade
  scoring.ts             # deterministic base scoring
  status-rules.ts        # core / secondary / not-recommended assignment
  suppressions.ts        # mutual exclusions, redundancy
  explanations.ts        # human-readable "why" strings
  product-attachment.ts  # runs LAST, post-ranking, with eligibility filter
  confidence.ts          # high/medium/low/blocked
  index.ts               # public API, re-exports, single entrypoint
```

Old `supplementEngine.ts` becomes a thin re-export shim so existing imports (route, tests) keep working. All existing tests must pass unchanged.

**Minimum effective stack**: cap 3 core + 2 secondary; everything else under "Not recommended today" with reason.

## Phase 3 — Safety & evidence

- Extend `EvidenceEntry` with `lastChecked`, `avoidWhen[]`, `clinicianOnlyWhen[]`, `downgradeWhen[]`, `maxSafeDefaultDose`, `notUsefulFor[]`. Populate all 15 entries.
- Wire `safety-gates.ts` to read these fields → no more hand-coded conditions duplicated across files.
- Result UI: every recommendation already shows citations; add per-claim source mapping (`supports` field already exists, surface it).

## Phase 4 — Privacy-first result flow

**Current**: full quiz answers base64'd into `?d=…` URL → sensitive medical data leaks via referrer/logs/share.

**New**:
- Quiz completion stores answers in `sessionStorage` keyed by a random slug, navigates to `/supplement-match/<slug>` with NO `?d=` param.
- Result page reads from sessionStorage. If absent (cold link), shows "This result has expired — retake the quiz".
- **"Create shareable link"** button → modal with privacy warning → strips medical/medication/pregnancy fields → encodes the safe subset into `?d=…` and copies URL.
- Backwards compat: existing `?d=…` links still decode and render (so currently-shared URLs don't 404).
- Result pages keep `noindex, follow`.

## Phase 5 — Adaptive quiz branching

- Annotate `quizSteps` with `showWhen(answers)` predicate.
- Skip irrelevant follow-ups: e.g. pregnancy questions only if `sex=female` and `ageRange` in childbearing range; training-detail questions only if `trainingFrequency > 0`; medication detail only if `medications=true`.
- Safety-screen questions remain mandatory and early.
- Target 8–11 steps for typical users; full 19 retained for edge cases.
- Early **safety guidance interstitial** when under-18 / pregnant / high-risk meds / organ disease detected → can still continue, but recommendations downgrade.

## Phase 6 — Product eligibility layer

New `engine/product-eligibility.ts` runs before affiliate attachment:
- Requires: explicit dose, no proprietary blend flag, dose ≤ `maxSafeDefaultDose`, third-party seal when available, allergen compatibility (vegan/gluten/lactose flags), NSF Certified for Sport when athlete profile.
- If 0 products pass → render a **label checklist** card ("look for X mg, USP/NSF seal, no proprietary blends") instead of a product card.
- Attachment runs strictly after ranking is frozen — already the case, but enforce via module boundary.

## Phase 7 — SEO URL architecture

New static topic pages under `/supplement-match/`:

```
vitamin-d, creatine, omega-3, magnesium, b12, iron, electrolytes,
protein-powder, vegan-supplements, running-supplements, supplements-for-over-50
```

- Each is a real route file with unique `head()` meta, H1, evidence summary, citations, internal links to related topics, CTA back to quiz.
- Existing `/supplement-match/topic/<slug>` → 301 redirect to new clean URL (server-side 308 via route handler returning Response).
- Sitemap: include only the 11 new topic pages + `/`, `/about`, `/faq`, `/methodology`, `/affiliate-disclosure`. Exclude personalized result pages and compare pages (noindex).

## Phase 8 — Tests

Golden fixtures under `src/lib/__tests__/fixtures/`:
- vegan-athlete, pregnant, under-18, blood-thinner, antidepressant, kidney-disease, runner-heavy-sweater, older-low-protein

Each fixture asserts: deterministic ranking snapshot, expected safety gates fire, blocked supplements excluded, product eligibility filter results, share-link payload omits sensitive fields. Plus sitemap inclusion/exclusion test and malformed `?d=` payload rejection test.

## Phase 9 — Verify

- `bun run test` — all green (existing 12 + new fixtures)
- `bun run lint` — clean
- `bun run build` — succeeds, report bundle delta

## Intentionally NOT changed

- Visual design / Tailwind theme — untouched.
- `supplementData.ts` catalog content — untouched (only evidence matrix grows).
- Quiz copy/questions — only `showWhen` added; no rewording.
- Cloud/Supabase — not enabled (no backend needed for these changes).
- `routeTree.gen.ts` — regenerated by plugin, never hand-edited.

## Risk checklist

| Risk | Mitigation |
|---|---|
| Engine split changes ranking output | Keep `supplementEngine.ts` as shim; run existing tests before/after each split |
| Privacy migration breaks shared links | Keep `?d=` decoder as fallback path |
| Adaptive flow hides required questions | Safety questions hard-coded as always-shown |
| SEO redirects break Google indexing | 301 (permanent) only on `/topic/<slug>` → new path; old URLs in sitemap removed |
| Lazy-loading PDF causes UX delay | Show spinner on click; preload on hover |
| Bundle changes break SSR | Test `bun run build` after each lazy boundary |

## Rough order of file changes

1. `package.json` (rename, remove deps)
2. `src/lib/engine/*` (new), `src/lib/supplementEngine.ts` (shim)
3. `src/lib/evidence/evidence-matrix.ts` (extend schema + populate)
4. `src/lib/quiz-data.ts` (add `showWhen`)
5. `src/lib/result-storage.ts` (new — session storage + safe-share encoding)
6. `src/routes/index.tsx` (use new storage on finish)
7. `src/routes/supplement-match.$slug.tsx` (read storage, lazy children, share modal)
8. `src/routes/supplement-match.<topic>.tsx` × 11 (new static pages)
9. `src/routes/supplement-match.topic.$topic.tsx` (301 redirect)
10. `src/routes/sitemap[.]xml.ts` (curate entries)
11. `src/lib/__tests__/fixtures/*` (new golden tests)
