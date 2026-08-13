# Contributing to Myrmex

## Stack

TypeScript (ESM, Node ≥ 20). Runtime dependencies are deliberately few: `hono` + `@hono/node-server` (the HTTP service), `@modelcontextprotocol/sdk` (the MCP tool), `cheerio` (DOM parsing), `pino` (logging), and `zod` (validation). No other runtime deps — keep it that way. Build is `tsup`; `tsx`, `pino-pretty`, `vitest`, and `@biomejs/biome` are dev-only.

## House style — enforced by tests

`test/style.test.ts` is not decoration. It fails the build on:

1. **No comments in any source file.** Not one, anywhere under `src/` or `bench/`. The code is written to read without them.
2. **No double blank lines.** `\n\n\n` fails.

Beyond what the test enforces, the project holds these rules:

3. **One definition per file.** Each type / interface / schema / union lives in its own file, grouped in a concept folder (`core/types`, `core/vocab`, `core/config`). A barrel `index.ts` may only re-export — it never defines a symbol.
4. **Nothing hardcoded.** Verdict classes and feature names are unions in `src/core/vocab/`. HTTP status codes, routes, methods, headers, content-types, defaults, and messages are typed constants in `src/service/constants/`. Env keys are constants in `src/core/config/envKeys.ts`. No magic string or number in logic.
5. **All detection data lives in `signatures.json`.** Vendor fingerprints and every threshold are data, validated by a zod schema (`core/config`). Adding a signal edits the JSON, never a `.ts`.
6. **The detector is deterministic and model-free.** No LLM, no network, no randomness in the decision path. This is a hard invariant — a change that makes a verdict depend on a model is rejected on sight.
7. **Semicolons on, double quotes, 100-col.** `npm run format` (biome) settles the rest.

## Code quality gates

```sh
npm ci
npm run typecheck    # tsc --noEmit
npm run lint         # biome check .
npm test             # vitest run
npm run build        # tsup → dist/ (ESM + .d.ts, signatures.json bundled)
npm run bench        # confusion matrix + precision / recall + n on the fixtures
```

All must pass. Both the HTTP service and the MCP tool call the exact same `scoreResponse` — no behavior forks per surface.

## Adding a vendor signature or tuning a threshold

1. Edit `src/core/config/signatures.json` — add to `vendors` (with `bodyMarkers` / `headerMarkers` and an `implies` of `CHALLENGE` or `SOFT_BLOCK`) or adjust a `thresholds` value.
2. Add a labelled fixture under `bench/corpus/<VERDICT>/` that exercises the new signal, plus a benign `REAL` negative that must stay silent.
3. Re-run `npm run bench` and confirm the numbers in the README still hold (and update them honestly if they move).

## Adding a scoring feature

New feature extractors go in `src/core/features/` (one file each, implementing `FeatureExtractor`), are registered in `engine/score.ts`, and get a name added to the `FEATURES` union and a place in the `verdictFrom` precedence. Every feature must be deterministic and carry its `{ fired, value, threshold, detail, implies }` trace entry.

## Submitting

Before opening a PR, verify:

1. `typecheck` clean, `lint` clean, `test` green, `build` succeeds, `bench` unchanged (or updated honestly).
2. No comments and no double blank lines in any changed source file.
3. Every new name is a union or a typed constant; no hardcoded strings or numbers in logic.
4. New detection data is in `signatures.json`, not in code.
5. The detector still makes zero model / network calls in the decision path.
