import { describe, it, expect, beforeEach } from "vitest";
import {
  storeAnswersForSlug,
  readAnswersForSlug,
  sanitizeForShare,
  buildShareUrl,
  decodeShareParam,
} from "@/lib/result-storage";
import { encodeAnswers } from "@/lib/quiz-data";
import { DEFAULT_ANSWERS } from "@/lib/engine";
import { TOPIC_SLUGS } from "@/lib/seo-topics";
import type { QuizAnswers } from "@/types/supplements";

// jsdom is the default vitest env in this project; if not present, polyfill.
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
    location: { origin: "https://test" },
  };
}

const sensitive: QuizAnswers = {
  ...DEFAULT_ANSWERS,
  pregnancy: "pregnant",
  currentSupplements: "secret notes",
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

describe("sessionStorage result flow", () => {
  beforeEach(() => {
    ensureSession();
    window.sessionStorage.clear();
  });

  it("round-trips answers via sessionStorage", () => {
    storeAnswersForSlug("abc", DEFAULT_ANSWERS);
    expect(readAnswersForSlug("abc")?.sex).toBe(DEFAULT_ANSWERS.sex);
  });

  it("returns null when nothing is stored (triggers Retake state)", () => {
    expect(readAnswersForSlug("missing")).toBeNull();
  });
});

describe("legacy ?d= fallback", () => {
  it("decodes a previously-encoded payload", () => {
    const encoded = encodeAnswers(DEFAULT_ANSWERS);
    const decoded = decodeShareParam(encoded);
    expect(decoded?.sex).toBe(DEFAULT_ANSWERS.sex);
  });
});

describe("sanitized share links", () => {
  beforeEach(ensureSession);

  it("strips every sensitive field", () => {
    const safe = sanitizeForShare(sensitive);
    expect(safe.pregnancy).toBe("none");
    expect(safe.currentSupplements).toBe("");
    for (const k of Object.keys(safe.medical) as Array<keyof typeof safe.medical>) {
      expect(safe.medical[k]).toBe(false);
    }
  });

  it("buildShareUrl encodes only sanitized data", () => {
    const url = buildShareUrl("slug", sensitive);
    const d = new URL(url).searchParams.get("d")!;
    const decoded = decodeShareParam(d)!;
    expect(decoded.medical.bloodThinners).toBe(false);
    expect(decoded.medical.antidepressants).toBe(false);
    expect(decoded.pregnancy).toBe("none");
    expect(decoded.currentSupplements).toBe("");
  });
});

describe("canonical SEO URLs", () => {
  it("topic slugs map to clean /supplement-match/<slug>/ canonical URLs", () => {
    for (const slug of TOPIC_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
    expect(TOPIC_SLUGS).toContain("vitamin-d");
    expect(TOPIC_SLUGS).toContain("creatine");
    expect(TOPIC_SLUGS).toContain("omega-3");
    expect(TOPIC_SLUGS).toContain("magnesium");
  });
});
