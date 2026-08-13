# Myrmex — Agent Contract

Audience: Claude. Myrmex is a deterministic, model-free soft-block / silent-scrape oracle. It scores a single HTTP response (status, headers, body) and returns a verdict — `REAL`, `SOFT_BLOCK`, `CHALLENGE`, `DECOY_EMPTY`, or `LAYOUT_DRIFT` — plus an explainable feature trace. It is the trust-gate between a scraper's Unblocker and its AI Parser.

## Hard invariants

1. **Model-free decision path.** No LLM, no embeddings, no ML inference, no network, no randomness decides a verdict. Only heuristics, vendor signatures, and schema/DOM math. This determinism and explainability is the entire wedge.
2. **Nothing hardcoded.** Verdict classes and feature names are unions in `src/core/vocab/`. Every vendor fingerprint and threshold lives in `src/core/config/signatures.json`, validated by a zod schema at load. Adding a fingerprint edits the JSON, never a `.ts`. HTTP status codes, routes, methods, headers, and messages are typed constants in `src/service/constants/`.
3. **Every verdict carries its trace.** A `ScoreResult` is `{ verdict, trace }`; the trace lists every feature, whether it fired, its measured value, its threshold, and what it implies.
4. **House style.** No comments in any `src/**/*.ts` or `bench/**/*.ts` file. No double blank lines. Both enforced by `test/style.test.ts`. Semicolons on; run `npm run format`.
5. **One definition per file.** Each type / interface / schema / union lives in its own file under a concept folder (`core/types`, `core/vocab`, `core/config`). Barrels (`index.ts`) only re-export — they never define a symbol.
6. **Honest credit.** The soft-block / silent-scrape *problem* is the field's (Ficstar, webscraper.io, context.dev, ScrapeOps). Myrmex's contribution is the deterministic, explainable, MCP-native trust-gate — never the discovery of the problem.
7. **Honest numbers.** The precision/recall committed to the README is what `npm run bench` prints on the committed fixtures. Never fabricate. n = 41 is a small hand-authored corpus — say so.

## Layout

```
src/
  core/
    vocab/       Verdict + BlockingVerdict + FeatureName unions, guards, assertNever
    types/       HttpResponse, ScoreInput, FeatureHit, ScoreResult, ... (one per file)
    config/      signatures.json (data) + zod schemas (one per file) + load.ts
    validation/  shared zod score-input schema (service + MCP consume one contract)
    dom/         cheerio parse helpers (deterministic, no headless browser)
    features/    the six deterministic extractors + FeatureContext contract
    engine/      verdict precedence + score orchestration
  service/       Hono HTTP surface — server.ts (boot), app.ts (routes), env, logger, constants/
  distribution/  scrape-trust MCP tool (@modelcontextprotocol/sdk)
  index.ts       library barrel
bin/             dist shims → myrmex-serve, myrmex-mcp
bench/           corpus proof suite (confusion matrix + P/R + n)
test/            vitest suites incl. the style guard
```

## Libraries

- **Hono** + **@hono/node-server** — the HTTP service (`POST /score`, `GET /health`).
- **zod** — one shared score-input schema (`core/validation`) and the signatures config schema (`core/config`, type via `z.infer`).
- **pino** — structured logging (boot, per-request, error). `pino-pretty` is a dev-only nicety.
- **tsup** — ESM + `.d.ts` build; bundles `signatures.json` (no runtime fs read, no copy-assets step). `tsx` is dev-only; `tsc --noEmit` is the typecheck gate.

## Config loading

`signatures.json` loads **once** (memoized). Default is a direct `import` so the bundler inlines it — zero setup, no runtime fs read. If `MYRMEX_SIGNATURES_PATH` is set, that file is fs-read and zod-validated instead. Validation failure fails fast with a clear error.

## Ship bar

`tsc --noEmit` clean, `biome check` clean, `vitest run` green, `npm run build` produces `dist/`, and `npm run bench` prints precision/recall + n on the committed fixtures. A change that breaks any of these does not ship. Author field everywhere = "Enchanter Labs".
