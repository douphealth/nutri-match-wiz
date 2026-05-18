// Re-export of the deterministic scoring engine under the Watch-Finder-style
// filename so downstream code (quiz UI, result routes, PDF report) imports
// from a single canonical module.
export { runEngine, evaluateSafetyGate, DEFAULT_ANSWERS } from "./supplementEngine";
export type {
  QuizAnswers,
  Recommendation,
  EngineResult,
  Frequency,
  Goal,
  Diet,
  Sex,
  Supplement,
} from "@/types/supplements";
