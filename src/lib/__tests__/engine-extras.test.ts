import { describe, it, expect } from "vitest";
import { runEngine, DEFAULT_ANSWERS } from "@/lib/supplementEngine";
import { buildDailySchedule } from "@/lib/daily-schedule";
import { encodeAnswers, decodeAnswers, generateSlug } from "@/lib/quiz-data";
import { citationsFor } from "@/lib/evidence/evidence-matrix";
import type { QuizAnswers } from "@/types/supplements";

function answers(patch: Partial<QuizAnswers> = {}): QuizAnswers {
  return { ...DEFAULT_ANSWERS, ...patch };
}

describe("answer encoding round-trip", () => {
  it("decodes what it encodes", () => {
    const a = answers({ ageRange: "30_44", sex: "female", goals: ["energy", "sleep"] });
    const decoded = decodeAnswers(encodeAnswers(a));
    expect(decoded).not.toBeNull();
    expect(decoded?.ageRange).toBe("30_44");
    expect(decoded?.goals).toEqual(["energy", "sleep"]);
  });

  it("returns null for garbage", () => {
    expect(decodeAnswers("not-base64")).toBeNull();
  });

  it("generateSlug returns a kebab-case, non-empty string", () => {
    const slug = generateSlug(answers({ goals: ["muscle_recovery"] }));
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(0);
  });
});

describe("daily schedule", () => {
  it("produces zero doses when there are no recommendations", () => {
    const schedule = buildDailySchedule([], answers());
    expect(schedule.totalDoses).toBe(0);
  });

  it("produces at least one slot when supplements are recommended", () => {
    const result = runEngine(
      answers({
        goals: ["energy", "general_wellness"],
        sunExposure: "low",
        foodIntake: { ...DEFAULT_ANSWERS.foodIntake, oilyFish: "never" },
      }),
    );
    if (result.recommendations.length > 0) {
      const schedule = buildDailySchedule(result.recommendations, result.answers ?? answers());
      expect(schedule.totalDoses).toBeGreaterThan(0);
      expect(schedule.bySlot.length).toBeGreaterThan(0);
    }
  });
});

describe("evidence matrix", () => {
  it("provides citations for core supplements", () => {
    for (const id of ["vitamin_d", "b12", "omega3", "magnesium", "iron"]) {
      const cites = citationsFor(id);
      expect(cites.length).toBeGreaterThan(0);
      for (const c of cites) {
        expect(c.url).toMatch(/^https?:\/\//);
        expect(c.label.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("engine never returns duplicates", () => {
  it("recommendation ids are unique", () => {
    const r = runEngine(answers({ goals: ["energy", "sleep", "immune"] }));
    const ids = r.recommendations.map((x) => x.supplement.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
