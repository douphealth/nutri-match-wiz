// Product eligibility filter — runs AFTER ranking is frozen, BEFORE any
// affiliate link is attached. Enforces label-quality + safety + allergen
// rules. If no product passes, the UI shows a label checklist instead of
// a product card.

import type { QuizAnswers } from "@/types/supplements";
import { productFor, productsFor, type AmazonProduct } from "@/lib/supplement-products";
import { evidenceFor } from "@/lib/evidence/evidence-matrix";

export interface ProductEligibilityResult {
  product?: AmazonProduct;
  /** Why no product was attached, if `product` is undefined. */
  reason?: string;
}

const ATHLETE_PROFILE = (a: QuizAnswers) =>
  a.trainingFrequency === "5_plus" ||
  (a.trainingFrequency === "3_4" && a.allergies.thirdPartyTestedOnly);

function hasAthleteSeal(p: AmazonProduct): boolean {
  return (p.badges ?? []).some((b) => /nsf|informed (choice|sport)|banned[- ]substance/i.test(b));
}

function hasThirdPartySeal(p: AmazonProduct): boolean {
  return (p.badges ?? []).some((b) => /usp|nsf|informed|gmp|cgmp|third[- ]party/i.test(b));
}

function isAllergenCompatible(p: AmazonProduct, a: QuizAnswers): boolean {
  const badges = (p.badges ?? []).join(" ").toLowerCase();
  if (a.allergies.vegan && p.fit && !["vegan", "lactose_free"].includes(p.fit)) {
    // Allow if explicitly vegan-badged
    if (!/vegan/.test(badges)) return false;
  }
  if (a.allergies.lactoseFree && /whey|casein|dairy/i.test(p.title)) return false;
  if (a.allergies.gelatinFree && /gelatin/i.test(p.title)) return false;
  return true;
}

export function selectEligibleProduct(
  supplementId: string,
  answers: QuizAnswers,
): ProductEligibilityResult {
  const candidates = productsFor(supplementId);
  if (candidates.length === 0) {
    return { reason: "No vetted product on file for this supplement." };
  }

  const ev = evidenceFor(supplementId);
  // Hard block if the supplement is in an avoid-state for this user.
  if (ev?.labRequirement === "required_before_use") {
    return {
      reason:
        "This requires a baseline blood test and clinician guidance — we don't attach a product before labs.",
    };
  }
  if (ev?.labRequirement === "clinician_directed") {
    return {
      reason: "Your clinician should choose the specific product/dose — we don't pre-pick one.",
    };
  }

  // Start from preferred match (existing variant-picking logic),
  // then filter through eligibility rules.
  const preferred = productFor(supplementId, answers);
  const ordered = preferred
    ? [preferred, ...candidates.filter((p) => p.asin !== preferred.asin)]
    : candidates;

  const wantsAthlete = ATHLETE_PROFILE(answers);
  const wantsThirdParty = answers.allergies.thirdPartyTestedOnly;

  for (const p of ordered) {
    if (!isAllergenCompatible(p, answers)) continue;
    if (wantsAthlete && !hasAthleteSeal(p)) continue;
    if (wantsThirdParty && !hasThirdPartySeal(p)) continue;
    return { product: p };
  }

  // Fall through: nothing passed strict eligibility.
  return {
    reason: wantsAthlete
      ? "No NSF Certified for Sport / Informed Sport option available — see label checklist below before choosing."
      : wantsThirdParty
        ? "No third-party-tested option matched your preferences — see label checklist below."
        : "Allergen/diet filters excluded all candidates — see label checklist below.",
  };
}

export function productLabelChecklist(supplementId: string): string[] {
  const ev = evidenceFor(supplementId);
  const base = [
    "Exact mg/mcg dose printed per serving — never a 'proprietary blend'",
    "Third-party seal on the label: USP Verified, NSF, or Informed Choice/Sport",
    "Dose at or below the daily upper limit for this nutrient",
    "Allergen flags match your profile (vegan/gluten/lactose/gelatin)",
    "Conservative per-capsule dose so you can titrate, not mega-dose",
  ];
  if (ev?.maxSafeDefaultDose) {
    base.unshift(`Stay at or below ~${ev.maxSafeDefaultDose}`);
  }
  return base;
}
