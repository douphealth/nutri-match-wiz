import { describe, it, expect } from "vitest";
import { EVIDENCE_MATRIX } from "@/lib/evidence/evidence-matrix";

describe("evidence traceability", () => {
  const entries = Object.values(EVIDENCE_MATRIX);

  it("has at least one supplement entry", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries.map((e) => [e.supplementId, e] as const))(
    "%s has citations with valid lastChecked",
    (_id, entry) => {
      expect(entry.citations.length).toBeGreaterThan(0);
      expect(entry.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const c of entry.citations) {
        expect(c.url).toMatch(/^https?:\/\//);
        expect(c.label.length).toBeGreaterThan(0);
        expect(c.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    },
  );

  it("iron requires test_first or clinician_only labRequirement", () => {
    const iron = EVIDENCE_MATRIX.iron;
    expect(iron).toBeDefined();
    expect(
      iron.labRequirement === "required_before_use" || iron.labRequirement === "clinician_directed",
    ).toBe(true);
  });
});
