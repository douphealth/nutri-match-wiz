import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as canonical from "@/lib/engine";
import * as legacy1 from "@/lib/supplementEngine";
import * as legacy2 from "@/lib/recommendation-engine";

describe("deprecated engine wrappers", () => {
  it("supplementEngine.ts re-exports runEngine / evaluateSafetyGate / DEFAULT_ANSWERS from @/lib/engine", () => {
    expect(legacy1.runEngine).toBe(canonical.runEngine);
    expect(legacy1.evaluateSafetyGate).toBe(canonical.evaluateSafetyGate);
    expect(legacy1.DEFAULT_ANSWERS).toBe(canonical.DEFAULT_ANSWERS);
  });

  it("recommendation-engine.ts re-exports runEngine / evaluateSafetyGate / DEFAULT_ANSWERS from @/lib/engine", () => {
    expect(legacy2.runEngine).toBe(canonical.runEngine);
    expect(legacy2.evaluateSafetyGate).toBe(canonical.evaluateSafetyGate);
    expect(legacy2.DEFAULT_ANSWERS).toBe(canonical.DEFAULT_ANSWERS);
  });

  it("wrapper files contain no scoring logic — they are pure re-exports", () => {
    const root = process.cwd();
    for (const f of ["src/lib/supplementEngine.ts", "src/lib/recommendation-engine.ts"]) {
      const src = readFileSync(join(root, f), "utf8");
      // No function bodies, no scoring math, no safety rules — only re-exports.
      expect(src).not.toMatch(/\bfunction\s+\w+\s*\(/);
      expect(src).toMatch(/from\s+["']\.\/engine["']/);
    }
  });

  it("all non-wrapper consumers import scoring from @/lib/engine, not the legacy files", () => {
    const root = join(process.cwd(), "src");
    const offenders: string[] = [];

    function walk(dir: string) {
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(ent.name)) continue;
        // Skip the wrappers themselves.
        if (
          full.endsWith("/lib/supplementEngine.ts") ||
          full.endsWith("/lib/recommendation-engine.ts")
        )
          continue;
        const src = readFileSync(full, "utf8");
        if (
          /from\s+["']@\/lib\/supplementEngine["']/.test(src) ||
          /from\s+["']@\/lib\/recommendation-engine["']/.test(src)
        ) {
          offenders.push(full);
        }
      }
    }

    walk(root);
    expect(offenders).toEqual([]);
  });
});
