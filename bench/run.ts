import { pathToFileURL } from "node:url";
import { VERDICTS } from "../src/core/vocab/verdict.js";
import { scoreResponse } from "../src/index.js";
import type { Verdict } from "../src/index.js";
import { loadCorpus } from "./corpus.js";

interface ConfusionRow {
  actual: Verdict;
  predicted: Verdict;
}

interface ClassStats {
  label: Verdict;
  tp: number;
  fp: number;
  fn: number;
  support: number;
}

function computeClassStats(rows: ConfusionRow[]): ClassStats[] {
  return VERDICTS.map((label) => {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let support = 0;
    for (const row of rows) {
      if (row.actual === label) support += 1;
      if (row.actual === label && row.predicted === label) tp += 1;
      if (row.actual !== label && row.predicted === label) fp += 1;
      if (row.actual === label && row.predicted !== label) fn += 1;
    }
    return { label, tp, fp, fn, support };
  });
}

function precisionOf(stats: ClassStats): number {
  const denom = stats.tp + stats.fp;
  return denom === 0 ? 0 : stats.tp / denom;
}

function recallOf(stats: ClassStats): number {
  const denom = stats.tp + stats.fn;
  return denom === 0 ? 0 : stats.tp / denom;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

export function runEval(dir?: string): number {
  const corpus = loadCorpus(dir);
  const rows: ConfusionRow[] = [];
  const misclassifications: string[] = [];
  for (const testCase of corpus) {
    const result = scoreResponse(testCase.input);
    rows.push({ actual: testCase.label, predicted: result.verdict });
    if (result.verdict !== testCase.label) {
      misclassifications.push(`${testCase.file}: expected ${testCase.label} got ${result.verdict}`);
    }
  }
  const classStats = computeClassStats(rows);
  const correct = rows.filter((row) => row.actual === row.predicted).length;
  const accuracy = corpus.length === 0 ? 0 : correct / corpus.length;
  const usedClasses = classStats.filter((stats) => stats.support > 0);
  const macroPrecision =
    usedClasses.length === 0
      ? 0
      : usedClasses.reduce((sum, stats) => sum + precisionOf(stats), 0) / usedClasses.length;
  const macroRecall =
    usedClasses.length === 0
      ? 0
      : usedClasses.reduce((sum, stats) => sum + recallOf(stats), 0) / usedClasses.length;

  console.log("myrmex eval report");
  console.log(`n = ${corpus.length}`);
  console.log("");
  console.log(`${pad("class", 14)}${pad("support", 9)}${pad("precision", 11)}recall`);
  for (const stats of classStats) {
    console.log(
      pad(stats.label, 14) +
        pad(String(stats.support), 9) +
        pad(pct(precisionOf(stats)), 11) +
        pct(recallOf(stats)),
    );
  }
  console.log("");
  console.log(`macro precision: ${pct(macroPrecision)}`);
  console.log(`macro recall:    ${pct(macroRecall)}`);
  console.log(`accuracy:        ${pct(accuracy)}`);
  console.log("");
  if (misclassifications.length === 0) {
    console.log("misclassifications: none");
  } else {
    console.log(`misclassifications: ${misclassifications.length}`);
    for (const line of misclassifications) console.log(`  ${line}`);
  }
  return misclassifications.length === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runEval());
}
