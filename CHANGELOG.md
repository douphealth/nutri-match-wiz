# Changelog

## Phase 4 — Tests + repo quality
- Vitest with 5 safety-engine guarantees (under-18, pregnancy, blood thinners, iron test-first, determinism).
- `bun run test` / `test:watch` scripts.
- README, CHANGELOG, SECURITY.

## Phase 3 — Product quality + privacy
- Quality checklist panel on result page (third-party tested, no prop blends, disclosed form, allergen fit, conservative dose, honest claims).
- Privacy disclosure: answers live in URL only, never stored server-side.
- Commission-blind ranking disclosure.

## Phase 2 — SEO landing pages
- 12 indexable topic guides at `/supplement-match/topic/<slug>` with MedicalWebPage + FAQPage + BreadcrumbList JSON-LD.
- Sitemap auto-includes topic routes.

## Phase 1 — Safety engine + evidence matrix
- `RecommendationStatus` hierarchy with hard gates: under-18, pregnancy, blood thinners, antidepressants, kidney/liver, surgery.
- Evidence matrix linking every supplement to NIH ODS / FDA primary sources.
- Iron forced `test_first`/`clinician_only`; melatonin suppressed in pregnancy / under-18; conservative D defaults.
- Result UI: status badges, clinician callouts, "not recommended today" transparency, sources block.
