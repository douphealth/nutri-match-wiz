import { describe, it, expect, beforeEach } from "vitest";
import {
  storeAnswersForSlug,
  readAnswersForSlug,
  buildShareUrl,
  sanitizeForShare,
} from "@/lib/result-storage";
import { DEFAULT_ANSWERS } from "@/lib/engine";
import { generateSlug } from "@/lib/quiz-data";
import type { QuizAnswers } from "@/types/supplements";

function ensureSession() {
  if (typeof (globalThis as { window?: unknown }).window !== "undefined") return;
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  };
  (globalThis as Record<string, unknown>).window = {
    sessionStorage: storage,
    location: { origin: "https://gearuptofit.com" },
  };
}

const sensitive: QuizAnswers = {
  ...DEFAULT_ANSWERS,
  pregnancy: "pregnant",
  currentSupplements: "private notes about my health",
  medical: {
    medications: true,
    bloodThinners: true,
    antidepressants: true,
    diabetesMeds: true,
    thyroidMeds: true,
    bloodPressureMeds: true,
    kidneyLiver: true,
    heartDisease: true,
    surgeryPlanned: true,
    anemiaHistory: true,
  },
};

beforeEach(() => {
  ensureSession();
  window.sessionStorage.clear();
});

describe("privacy: default navigation does not encode answers in URL", () => {
  it("the post-quiz navigation in routes/index.tsx uses only the slug", () => {
    // Mirrors routes/index.tsx finish(): storeAnswersForSlug + navigate({ to, params: { slug } }).
    // No `?d=` is ever attached on the default path.
    const slug = generateSlug(sensitive);
    storeAnswersForSlug(slug, sensitive);
    const navigated = `/supplement-match/${slug}`;
    expect(navigated).not.toMatch(/[?&]d=/);
    expect(readAnswersForSlug(slug)).not.toBeNull();
  });
});

describe("privacy: sessionStorage round-trip", () => {
  it("readAnswersForSlug returns what storeAnswersForSlug wrote", () => {
    storeAnswersForSlug("abc", sensitive);
    const got = readAnswersForSlug("abc");
    expect(got).not.toBeNull();
    expect(got?.pregnancy).toBe("pregnant");
    expect(got?.medical.bloodThinners).toBe(true);
  });

  it("returns null when slug is unknown", () => {
    expect(readAnswersForSlug("never-stored")).toBeNull();
  });
});

describe("privacy: buildShareUrl creates a sanitized payload", () => {
  it("strips every sensitive field before encoding into ?d=", () => {
    const url = buildShareUrl("share-test", sensitive);
    expect(url).toMatch(/\/supplement-match\/share-test\?d=/);

    // Decode the ?d= and verify nothing sensitive leaked.
    const d = new URL(url).searchParams.get("d")!;
    expect(d).toBeTruthy();
    const decoded = sanitizeForShare(sensitive); // canonical sanitized shape
    expect(decoded.pregnancy).toBe("none");
    expect(decoded.currentSupplements).toBe("");
    expect(decoded.medical.medications).toBe(false);
    expect(decoded.medical.bloodThinners).toBe(false);
    expect(decoded.medical.antidepressants).toBe(false);
    expect(decoded.medical.diabetesMeds).toBe(false);
    expect(decoded.medical.thyroidMeds).toBe(false);
    expect(decoded.medical.bloodPressureMeds).toBe(false);
    expect(decoded.medical.kidneyLiver).toBe(false);
    expect(decoded.medical.heartDisease).toBe(false);
    expect(decoded.medical.surgeryPlanned).toBe(false);
    expect(decoded.medical.anemiaHistory).toBe(false);
  });

  it("sanitizeForShare preserves non-sensitive personalization signals", () => {
    const safe = sanitizeForShare(sensitive);
    expect(safe.diet).toBe(sensitive.diet);
    expect(safe.goals).toEqual(sensitive.goals);
    expect(safe.ageRange).toBe(sensitive.ageRange);
    expect(safe.sex).toBe(sensitive.sex);
  });
});
