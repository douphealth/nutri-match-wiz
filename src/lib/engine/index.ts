// Public entrypoint for the recommendation engine.
//
// The engine is intentionally kept in a single deterministic file
// (`src/lib/supplementEngine.ts`) so a snapshot of inputs always produces
// identical outputs. This barrel re-exports the engine surface plus
// purpose-specific helpers that downstream code should prefer importing
// from `@/lib/engine` rather than reaching into individual files.
//
//   safety-gates → evaluateSafetyGate
//   scoring + status-rules + suppressions → runEngine
//   explanations → reasons/safetyFlags arrays on each Recommendation
//   product-attachment + eligibility → @/lib/engine/product-eligibility
//   confidence levels (High | Moderate | Low | Blocked) → Recommendation.confidence
//
// Splitting further was evaluated but rejected: every helper is consumed only
// inside `runEngine`, and a forced split would either duplicate state buckets
// across modules or require a shared mutable type, both of which trade
// real determinism risk for cosmetic separation.

export { runEngine, evaluateSafetyGate, DEFAULT_ANSWERS } from "../supplementEngine";
export { selectEligibleProduct, productLabelChecklist } from "./product-eligibility";
export type {
  EngineResult,
  Recommendation,
  RecommendationStatus,
  SuppressedRecommendation,
} from "@/types/supplements";
