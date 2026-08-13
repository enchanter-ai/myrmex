import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ScoreInput } from "../src/core/types/scoreInput.js";
import { isVerdict } from "../src/core/vocab/isVerdict.js";
import type { Verdict } from "../src/core/vocab/verdict.js";

const DEFAULT_CORPUS_DIR = join(dirname(fileURLToPath(import.meta.url)), "corpus");

export interface CorpusCase {
  file: string;
  label: Verdict;
  note: string;
  input: ScoreInput;
}

interface RawCase {
  label: string;
  note: string;
  input: ScoreInput;
}

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) files.push(full);
  }
  return files;
}

export function loadCorpus(dir = DEFAULT_CORPUS_DIR): CorpusCase[] {
  const files = walk(dir).sort();
  const cases: CorpusCase[] = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(file, "utf8")) as RawCase;
    if (!isVerdict(raw.label)) throw new Error(`invalid label in ${file}: ${raw.label}`);
    cases.push({ file, label: raw.label, note: raw.note, input: raw.input });
  }
  return cases;
}
