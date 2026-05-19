import { describe, it, expect } from "vitest";
import { runEngine, DEFAULT_ANSWERS } from "@/lib/supplementEngine";
import type { QuizAnswers } from "@/types/supplements";

function answers(patch: Partial<QuizAnswers> = {}): QuizAnswers {
  return { ...DEFAULT_ANSWERS, ...patch };
}

describe("safety engine — hard gates", () => {
  it("under-18 users get a safety gate and no adult-only supplements", () => {
    const r = runEngine(answers({ ageRange: "under_18" }));
    expect(r.safetyGate.triggered).toBe(true);
    const ids = r.recommendations.map((x) => x.supplement.id);
    expect(ids).not.toContain("creatine");
    expect(ids).not.toContain("melatonin");
  });

  it("pregnancy suppresses melatonin", () => {
    const r = runEngine(answers({ pregnancy: "pregnant", sleepQuality: "poor" }));
    const melatonin = r.recommendations.find((x) => x.supplement.id === "melatonin");
    expect(melatonin).toBeUndefined();
    const suppressed = (r.notRecommended ?? []).find((x) => x.supplementId === "melatonin");
    expect(suppressed?.status === "avoid" || suppressed?.status === "clinician_only").toBe(true);
  });

  it("blood thinners flag omega-3 for clinician review", () => {
    const r = runEngine(
      answers({
        medical: { ...DEFAULT_ANSWERS.medical, medications: true, bloodThinners: true },
        foodIntake: { ...DEFAULT_ANSWERS.foodIntake, oilyFish: "never" },
      }),
    );
    expect(r.safetyGate.triggered).toBe(true);
    const omega = r.recommendations.find((x) => x.supplement.id === "omega3");
    const suppressedOmega = (r.notRecommended ?? []).find((x) => x.supplementId === "omega3");
    expect(omega?.status === "clinician_only" || suppressedOmega).toBeTruthy();
  });
});

describe("safety engine — test-first policy", () => {
  it("iron is never freely recommended without labs", () => {
    const r = runEngine(
      answers({
        sex: "female",
        foodIntake: { ...DEFAULT_ANSWERS.foodIntake, redMeat: "never", legumes: "rarely" },
      }),
    );
    const iron = r.recommendations.find((x) => x.supplement.id === "iron");
    if (iron) {
      expect(["test_first", "clinician_only"]).toContain(iron.status);
    }
  });
});

describe("engine basics", () => {
  it("returns a deterministic match score in [0,100]", () => {
    const a = answers({ goals: ["energy", "sleep"] });
    const r1 = runEngine(a);
    const r2 = runEngine(a);
    expect(r1.matchScore).toBe(r2.matchScore);
    expect(r1.matchScore).toBeGreaterThanOrEqual(0);
    expect(r1.matchScore).toBeLessThanOrEqual(100);
  });
});
