import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCAN_ROOTS = [join(__dirname, "..", "src"), join(__dirname, "..", "bench")];

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (entry.endsWith(".ts")) files.push(full);
  }
  return files;
}

function findComment(text: string): number {
  type State = "normal" | "single" | "double" | "template";
  let state: State = "normal";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (state === "single") {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === "'") state = "normal";
      continue;
    }
    if (state === "double") {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === '"') state = "normal";
      continue;
    }
    if (state === "template") {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === "`") state = "normal";
      continue;
    }
    if (ch === "'") {
      state = "single";
      continue;
    }
    if (ch === '"') {
      state = "double";
      continue;
    }
    if (ch === "`") {
      state = "template";
      continue;
    }
    if (ch === "/" && next === "/") return i;
    if (ch === "/" && next === "*") return i;
  }
  return -1;
}

describe("house style guard", () => {
  const files = SCAN_ROOTS.flatMap((root) => walk(root));

  it("finds source files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("has no comments outside string and template literals", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const index = findComment(text);
      expect(index, `unexpected comment in ${file} at offset ${index}`).toBe(-1);
    }
  });

  it("has no double blank lines", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text.includes("\n\n\n"), `double blank line in ${file}`).toBe(false);
    }
  });
});
