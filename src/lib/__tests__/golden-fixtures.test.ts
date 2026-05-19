import { describe, it, expect } from "vitest";
import { runEngine, DEFAULT_ANSWERS } from "@/lib/engine";
import { selectEligibleProduct } from "@/lib/engine/product-eligibility";
import {
  sanitizeForShare,
  decodeShareParam,
} from "@/lib/result-storage";
import { encodeAnswers } from "@/lib/quiz-data";
import type { QuizAnswers } from "@/types/supplements";

function a(patch: Partial<QuizAnswers> = {}): QuizAnswers {
  return { ...DEFAULT_ANSWERS, ...patch };
}

const fixtures: Record<string, QuizAnswers> = {
  veganAthlete: a({
    diet: "vegan",
    sex: "male",
    ageRange: "30_44",
    goals: ["muscle_recovery", "energy"],
    trainingFrequency: "5_plus",
    foodIntake: { ...DEFAULT_ANSWERS.foodIntake, oilyFish: "never", dairy: "never", redMeat: "never" },
  }),
  pregnant: a({
    sex: "female",
    ageRange: "30_44",
    pregnancy: "pregnant",
    goals: ["general_wellness", "sleep"],
    sleepQuality: "poor",
  }),
  under18: a({ ageRange: "under_18", goals: ["energy"] }),
  bloodThinner: a({
    medical: { ...DEFAULT_ANSWERS.medical, medications: true, bloodThinners: true },
    foodIntake: { ...DEFAULT_ANSWERS.foodIntake, oilyFish: "never" },
    goals: ["general_wellness"],
  }),
  antidepressant: a({
    medical: { ...DEFAULT_ANSWERS.medical, medications: true, antidepressants: true },
    goals: ["sleep", "general_wellness"],
  }),
  kidneyDisease: a({
    medical: { ...DEFAULT_ANSWERS.medical, kidneyLiver: true },
    goals: ["muscle_recovery"],
  }),
  runnerHeavySweater: a({
    sex: "male",
    ageRange: "30_44",
    trainingFrequency: "5_plus",
    goals: ["energy", "muscle_recovery"],
  }),
  olderLowProtein: a({
    ageRange: "60_plus",
    goals: ["general_wellness", "muscle_recovery"],
    foodIntake: { ...DEFAULT_ANSWERS.foodIntake, redMeat: "never", legumes: "rarely", dairy: "rarely" },
  }),
};

describe("golden fixtures — deterministic output", () => {
  it.each(Object.entries(fixtures))("%s produces stable ranking", (_name, ans) => {
    const r1 = runEngine(ans);
    const r2 = runEngine(ans);
    expect(r1.recommendations.map((x) => x.supplement.id)).toEqual(
      r2.recommendations.map((x) => x.supplement.id),
    );
  });

  it("caps minimum effective stack at 3 core + 2 secondary", () => {
    for (const ans of Object.values(fixtures)) {
      const r = runEngine(ans);
      const core = r.recommendations.filter((x) => x.tier === "core");
      const secondary = r.recommendations.filter((x) => x.tier === "secondary");
      expect(core.length).toBeLessThanOrEqual(3);
      expect(secondary.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("safety gates fire correctly", () => {
  it("under-18 triggers safety gate", () => {
    expect(runEngine(fixtures.under18).safetyGate.triggered).toBe(true);
  });
  it("pregnant triggers safety gate", () => {
    expect(runEngine(fixtures.pregnant).safetyGate.triggered).toBe(true);
  });
  it("blood thinner triggers safety gate", () => {
    expect(runEngine(fixtures.bloodThinner).safetyGate.triggered).toBe(true);
  });
  it("antidepressant triggers safety gate", () => {
    expect(runEngine(fixtures.antidepressant).safetyGate.triggered).toBe(true);
  });
  it("kidney disease triggers safety gate", () => {
    expect(runEngine(fixtures.kidneyDisease).safetyGate.triggered).toBe(true);
  });
});

describe("product eligibility filtering", () => {
  it("either attaches an eligible product or explains why none was attached", () => {
    const r = runEngine(fixtures.veganAthlete);
    for (const rec of r.recommendations) {
      const result = selectEligibleProduct(rec.supplement.id, fixtures.veganAthlete);
      // Must always return a structured result — never throw, never undefined.
      expect(result).toBeDefined();
      expect(
        typeof result.product !== "undefined" || typeof result.reason === "string",
      ).toBe(true);
    }
  });
});

describe("share link privacy", () => {
  const sensitive = fixtures.bloodThinner;

  it("strips medical, medications, pregnancy from shared payload", () => {
    const sanitized = sanitizeForShare(sensitive);
    expect(sanitized.medical.bloodThinners).toBe(false);
    expect(sanitized.medical.medications).toBe(false);
    expect(sanitized.medical.antidepressants).toBe(false);
    expect(sanitized.pregnancy).toBe("none");
    expect(sanitized.currentSupplements).toBe("");
  });

  it("round-trips through encode/decode without restoring sensitive data", () => {
    const encoded = encodeAnswers(sanitizeForShare(sensitive));
    const decoded = decodeShareParam(encoded);
    expect(decoded?.medical.bloodThinners).toBe(false);
    expect(decoded?.pregnancy).toBe("none");
  });
});

describe("malformed payload validation", () => {
  it("rejects garbage ?d= input", () => {
    expect(decodeShareParam("this-is-not-valid-base64-$$$")).toBeNull();
  });
  it("rejects empty ?d=", () => {
    expect(decodeShareParam(undefined)).toBeNull();
    expect(decodeShareParam("")).toBeNull();
  });
});
