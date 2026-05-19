// Privacy-first result storage.
//
// Previously, the full QuizAnswers object (including medical/medication
// flags, pregnancy status, etc.) was base64-encoded into the result URL
// `?d=...`. That payload leaked sensitive health info through browser
// history, referrer headers, server access logs, and anywhere the URL was
// shared.
//
// New flow:
//   1. On quiz completion, answers are stored in sessionStorage keyed by
//      slug. The result URL contains only the slug — no `?d=`.
//   2. The result page reads from sessionStorage. Cold links (e.g. a
//      bookmark in a new tab) fall back to `?d=` if present, otherwise
//      prompt the user to retake the quiz.
//   3. The "Create shareable link" button explicitly opts in to a sanitized
//      payload that strips medical / medication / pregnancy / anemia
//      fields before encoding.

import type { QuizAnswers } from "@/types/supplements";
import { encodeAnswers, decodeAnswers } from "./quiz-data";

const KEY_PREFIX = "supplement-match:result:";

export function storeAnswersForSlug(slug: string, answers: QuizAnswers) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY_PREFIX + slug, JSON.stringify(answers));
  } catch {
    /* storage disabled or full — fall through */
  }
}

export function readAnswersForSlug(slug: string): QuizAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY_PREFIX + slug);
    if (!raw) return null;
    return JSON.parse(raw) as QuizAnswers;
  } catch {
    return null;
  }
}

/**
 * Strip sensitive fields from quiz answers before encoding them into a
 * shareable URL. The receiver still gets a meaningful (if less precise)
 * recommendation, but no medical history, no medications, no pregnancy
 * status, and no free-text supplement notes are exposed.
 */
export function sanitizeForShare(answers: QuizAnswers): QuizAnswers {
  return {
    ...answers,
    pregnancy: "none",
    currentSupplements: "",
    medical: {
      medications: false,
      bloodThinners: false,
      antidepressants: false,
      diabetesMeds: false,
      thyroidMeds: false,
      bloodPressureMeds: false,
      kidneyLiver: false,
      heartDisease: false,
      surgeryPlanned: false,
      anemiaHistory: false,
    },
  };
}

export function buildShareUrl(slug: string, answers: QuizAnswers): string {
  const safe = sanitizeForShare(answers);
  const d = encodeAnswers(safe);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://gearuptofit.com";
  return `${origin}/supplement-match/${slug}?d=${d}`;
}

/** Server/loader-safe decode fallback for inbound `?d=` links (back-compat). */
export function decodeShareParam(d: string | undefined): QuizAnswers | null {
  if (!d) return null;
  return decodeAnswers(d);
}
