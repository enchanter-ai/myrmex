import { describe, expect, it } from "vitest";
import { loadCorpus } from "../bench/corpus.js";
import { isVerdict } from "../src/index.js";

describe("fixture corpus", () => {
  const cases = loadCorpus();

  it("has at least 30 cases", () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
  });

  it("labels every case with a valid verdict", () => {
    for (const testCase of cases) {
      expect(
        isVerdict(testCase.label),
        `${testCase.file} has invalid label ${testCase.label}`,
      ).toBe(true);
    }
  });

  it("covers every verdict class at least twice", () => {
    const counts = new Map<string, number>();
    for (const testCase of cases) counts.set(testCase.label, (counts.get(testCase.label) ?? 0) + 1);
    for (const verdict of ["REAL", "SOFT_BLOCK", "CHALLENGE", "DECOY_EMPTY", "LAYOUT_DRIFT"]) {
      expect(
        counts.get(verdict) ?? 0,
        `verdict ${verdict} needs at least 2 corpus cases`,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});
