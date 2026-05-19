// Canonical engine barrel. All consumers should import from here.
// The deterministic implementation lives in ./core.
export {
  runEngine,
  evaluateSafetyGate,
  DEFAULT_ANSWERS,
} from "./core";
export { selectEligibleProduct, productLabelChecklist } from "./product-eligibility";
export type {
  EngineResult,
  Recommendation,
  RecommendationStatus,
  SuppressedRecommendation,
} from "@/types/supplements";
