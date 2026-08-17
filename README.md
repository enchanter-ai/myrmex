<div align="center">
  <img src="docs/assets/social-preview.png" alt="myrmex — the ant at the mouth of the nest; a deterministic, model-free scrape-trust gate" width="1280">
</div>

# myrmex

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-3fb950?style=for-the-badge"></a>
  <a href="../../actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/enchanter-ai/myrmex/ci.yml?branch=main&style=for-the-badge"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ESM-58a6ff?style=for-the-badge">
  <img alt="Model-free" src="https://img.shields.io/badge/Model--free-yes-bc8cff?style=for-the-badge">
  <img alt="0 ML calls in the verdict path" src="https://img.shields.io/badge/ML_calls_in_verdict_path-0-f85149?style=for-the-badge">
  <img alt="Tests" src="https://img.shields.io/badge/Tests-21-8957e5?style=for-the-badge">
  <a href="https://www.repostatus.org/#active"><img alt="Project Status: Active" src="https://www.repostatus.org/badges/latest/active.svg"></a>
</p>

> **An @enchanter-ai product — deterministic, model-free, MCP-native.**

**5 verdict classes. 6 deterministic features. 0 ML calls in the verdict path.**

myrmex sits between an Unblocker and an AI Parser and answers one question about a fetched HTTP response: is this real data, or a silent failure wearing an HTTP 200? A soft-block page, an anti-bot challenge, a decoy-empty shell, or a layout that has quietly drifted off the page a scraper was built for all return `status: 200`. Feed them to a parser and it does not error — it hallucinates a confident, wrong answer, and the pipeline never notices.

> Your scraper's Unblocker fetches a product page. The response comes back `200 OK`, 4KB of HTML, a `<body>` tag, even a `<div class="content">`. Everything downstream that checks "did the fetch succeed?" says yes.
>
> The body is `"Sorry, you have been blocked"` wrapped in Cloudflare's chrome. Or it is a JavaScript challenge shell with no product data at all. Or it is a real page whose template quietly changed last week, so the selectors the AI Parser relies on now point at nothing.
>
> myrmex scores the response against six deterministic features — vendor block/challenge signatures, DOM density, schema fill-rate, structural drift from a baseline — and returns a verdict with a full feature trace: which check fired, its measured value, its threshold, and what it implies. No model is asked whether the page looks blocked. The decision is arithmetic over HTML and a JSON signature file.

## TL;DR

**In plain English:** your scraper's Unblocker fetches a page and gets back a `200 OK` that is secretly a block page, a captcha wall, an empty shell, or a page whose layout drifted — myrmex catches all four before your AI Parser turns them into confidently-wrong data. Like an ant colony that turns away any stranger who does not carry the hive's scent, it refuses any response that lacks the markers of real data.

**Technically:** six ordered feature extractors run over `{status, headers, body}` plus optional `expectedSchema` and `baseline` context. `vendor_challenge_signature` and `block_body_with_200` match `signatures.json` body/header markers for known anti-bot vendors (Cloudflare, DataDome, PerimeterX, Akamai, Imperva, hCaptcha, reCAPTCHA). `decoy_empty_body` and `low_content_ratio` measure body length, DOM node count, text node count, and visible-text-to-body ratio via `cheerio`. `low_fill_rate` checks how many `expectedSchema` selectors actually resolve to sane values. `layout_drift` computes total variation distance between the response's tag-count distribution and a supplied `baseline`. `verdictFrom` applies a fixed precedence — `CHALLENGE` > `SOFT_BLOCK` > `DECOY_EMPTY` > `LAYOUT_DRIFT` > `REAL` — over the six fired/unfired hits. No step calls a model; the whole path is deterministic and replayable.

---

## Origin

**Myrmex** takes its name from **Ice and Fire** — an ant whose colony soldiers know their hive-mates by scent and turn away at the mouth of the nest anything that lacks it, no matter how convincingly it moves. myrmex stands at the mouth of the pipeline and does the same: it runs one recognition test on every response and refuses a soft-block, challenge, decoy, or drifted layout — anything without the scent of real data — before it reaches the AI Parser.

The question this project answers: *Is this response real data, or a silent failure dressed as HTTP 200?*

## Contents

- [The Numbers](#the-numbers)
- [Why This Exists](#why-this-exists)
- [How It Works](#how-it-works)
- [The Five Verdicts](#the-five-verdicts)
- [The Features](#the-features)
- [Architecture](#architecture)
- [HTTP Service](#http-service)
- [Deploy](#deploy)
- [The Numbers (eval)](#the-numbers-eval)
- [MCP Tool](#mcp-tool)
- [Install / Quickstart](#install--quickstart)
- [Design Invariants](#design-invariants)
- [Roadmap](#roadmap)
- [Acknowledgments](#acknowledgments)
- [Citation](#citation)
- [License](#license)

## The Numbers

| | Count |
|---|---|
| **Verdict classes** | 5 |
| **Deterministic features** | 6 |
| **ML calls in the verdict path** | 0 |
| **Runtime dependencies** | 6 (`hono`, `@hono/node-server`, `@modelcontextprotocol/sdk`, `cheerio`, `pino`, `zod`) |
| **Language** | TypeScript (ESM, Node 20+) |
| **Tests** | 21 |
| **Fixtures** | 41 |

A complete soft-block / silent-scrape oracle with nothing hardcoded outside `signatures.json` and no model in the loop.

---

## Why This Exists

The soft-block / silent-scrape problem is well known in the scraping industry — myrmex did not discover it. Vendors and practitioners have written about the gap between "the request succeeded" and "the data is real" for years.

| Work | What | myrmex's relevance |
|------|------|---------------------|
| **Ficstar** | Documents soft-blocks and decoy pages as a distinct failure mode from hard blocks (403/429) | myrmex formalizes the same distinction as a verdict class, `SOFT_BLOCK` vs a clean fetch failure |
| **webscraper.io** | Anti-bot/CAPTCHA detection guidance for scraper builders | myrmex encodes vendor-specific markers deterministically instead of manual inspection |
| **context.dev** | Discusses silent scraping failures where pipelines ingest garbage without erroring | the exact failure mode myrmex's `DECOY_EMPTY` and `LAYOUT_DRIFT` verdicts target |
| **ScrapeOps** | Anti-bot bypass and detection tooling for production scraping stacks | myrmex is a downstream trust-gate, not a bypass tool — it verifies what got through |

myrmex's contribution is narrow and named honestly: a **deterministic, explainable, MCP-native trust-gate** that any agentic scraping pipeline can call as a tool — not the discovery of the soft-block problem, and not a replacement for unblocking technology.

## How It Works

<p align="center">
  <a href="docs/assets/architecture.mmd" title="View architecture source (Mermaid)">
    <img src="docs/assets/architecture.svg"
         alt="myrmex scrape-trust gate blueprint — title block, fetched response, three surface doors (library, HTTP, MCP), the deterministic scoreResponse core (DOM parse then six extractors then verdictFrom), the five verdict classes, and a verdict-class legend"
         width="100%" style="max-width: 1100px;">
  </a>
</p>

<sub align="center">

Source: [docs/assets/architecture.mmd](docs/assets/architecture.mmd) · Regeneration command in [docs/assets/README.md](docs/assets/README.md).

</sub>

Every response is scored once, against every feature, every time — the trace always lists all six, fired or not. The verdict is the first class whose precedence condition is met; the trace is what makes the "why" auditable instead of a black box.

## The Five Verdicts

| Verdict | What it means | Which feature fires | Example |
|---------|----------------|----------------------|---------|
| `CHALLENGE` | A known anti-bot vendor served a JS/CAPTCHA challenge, not content | `vendor_challenge_signature` (implies `CHALLENGE`) | Cloudflare's `"Just a moment..."` interstitial |
| `SOFT_BLOCK` | A vendor block page, a block body under HTTP 200, or too few expected fields resolved | `vendor_challenge_signature` (implies `SOFT_BLOCK`), `block_body_with_200`, or `low_fill_rate` | `"Sorry, you have been blocked"` served with `status: 200` |
| `DECOY_EMPTY` | The body is too small, too sparse, or mostly non-text to be real content | `decoy_empty_body` or `low_content_ratio` | `<html></html>` — technically a 200, technically HTML |
| `LAYOUT_DRIFT` | The response's tag-structure has drifted far from a known-good baseline | `layout_drift` | A product page whose template swapped from a `<table>` grid to `<div>` cards overnight |
| `REAL` | No feature fired — the response looks like genuine content | none | A full article page with matching schema fields and no vendor markers |

## The Features

| # | Feature | File | Model-free | Data source |
|---|---------|------|------------|--------------|
| 1 | `vendor_challenge_signature` | `src/core/features/vendor.ts` | yes | `signatures.json` body/header markers |
| 2 | `block_body_with_200` | `src/core/features/blockBody.ts` | yes | `signatures.json` + `successStatus` threshold |
| 3 | `decoy_empty_body` | `src/core/features/decoy.ts` | yes | `minContentLength` / `minDomNodes` / `minTextNodes` thresholds |
| 4 | `low_content_ratio` | `src/core/features/contentRatio.ts` | yes | `minContentRatio` threshold |
| 5 | `low_fill_rate` | `src/core/features/fillRate.ts` | yes | caller-supplied `expectedSchema` + `minFillRate` threshold |
| 6 | `layout_drift` | `src/core/features/layoutDrift.ts` | yes | caller-supplied `baseline` + `maxLayoutDrift` threshold |

Every threshold and every vendor fingerprint lives in `src/core/config/signatures.json` — adding or tuning a signal edits the JSON, never a `.ts` file.

## Architecture

myrmex is layered into **production code** (`src/`, compiled to `dist/`), a **proof suite** (`bench/`), and **hygiene tests** (`test/`). Every type, union, and schema lives in its own file under a concept folder; barrels only re-export.

```
src/
├── core/              pure deterministic scoring engine
│   ├── vocab/         Verdict · BlockingVerdict · FeatureName unions, guards, assertNever
│   ├── types/         HttpResponse · ScoreInput · FeatureHit · ScoreResult · ... (one per file)
│   ├── config/        signatures.json (data) + zod schemas (one per file) + load.ts (memoized)
│   ├── validation/    shared zod score-input schema (service + MCP share one contract)
│   ├── dom/           cheerio parse helpers (deterministic, no headless browser)
│   ├── features/      the six deterministic extractors + FeatureContext
│   └── engine/        verdict precedence + score orchestration
├── service/           Hono HTTP surface — server.ts (boot) · app.ts (routes) · env · logger · constants/
├── distribution/      the scrape-trust MCP tool (stdio)
└── index.ts           library barrel — scoreResponse, verdictFrom, vocab, types, loadConfig
bin/                   dist shims → myrmex-serve, myrmex-mcp
bench/                 proof suite — run.ts (confusion matrix + P/R + n), corpus/ (41 labelled fixtures)
test/                  detector, style-guard, and corpus tests
Dockerfile             multi-stage build → node dist/service/server.js on a non-root slim runtime
```

- **PRODUCTION** — `core` is the engine; `service` wraps it in a Hono HTTP surface; `distribution` wraps it in an MCP tool. Both surfaces validate with the same zod schema and call the exact same `scoreResponse` — no behavior forks per surface. Signatures load **once** (memoized): the default is a direct `import` of `signatures.json` (bundled into `dist` by tsup — no runtime fs read), or the file at `MYRMEX_SIGNATURES_PATH` if that env var is set (fs-read + zod-validated, fail-fast on invalid input).
- **PROOF** — `bench/` is not shipped in the package, but it is the honest-numbers proof; CI runs it on every push.
- **HYGIENE** — `test/` enforces the no-comments / no-double-blank-line style guard over `src/` and `bench/`, the corpus label integrity, and determinism.

## HTTP Service

`myrmex-serve` (or `node dist/service/server.js`) starts a **Hono** service on `PORT` (default `8080`), `HOST` (default `0.0.0.0`), served by `@hono/node-server`, with `zod` request validation and structured `pino` logging (boot, per-request, error). It boot-loads `signatures.json` once and **fails fast** (exit 1, clear log) if a `MYRMEX_SIGNATURES_PATH` override is missing or invalid.

| Route | Method | Request | Response |
|-------|--------|---------|----------|
| `/score` | POST | `{ response: { status, headers, body }, expectedSchema?, baseline? }` | `200 {verdict, trace}` · `400 {error}` on invalid body |
| `/health` | GET | — | `200 {status, version, signatures: {vendors, thresholds}}` |

Wrong method on a known route returns `405`; any other path returns `404`. The `/score` body is the same shape (and the same zod schema) the `scrape-trust` MCP tool accepts.

```sh
curl -s localhost:8080/health
curl -s -X POST localhost:8080/score -H 'content-type: application/json' \
  -d '{"response":{"status":200,"headers":{},"body":"<html><body>Sorry, you have been blocked. Cloudflare Ray ID: 8f1</body></html>"}}'
```

**Gaps (honest).** The service ships with **no authentication, no rate-limiting, and no TLS** — it is intended to run behind a trusted gateway or inside a private network. Add an auth/rate-limit layer before exposing it publicly.

## Deploy

```sh
docker build -t myrmex .
docker run --rm -p 8080:8080 myrmex          # CMD node dist/service/server.js, non-root, EXPOSE 8080

node dist/service/server.js                  # from a local build (npm run build first)
```

> **Not published to npm.** `myrmex-serve` is unclaimed on the public npm
> registry (404) — do **not** run `npx myrmex-serve`, it will not resolve
> to this project. Build from source and run the local build instead:
>
> ```sh
> git clone https://github.com/enchanter-ai/myrmex.git
> cd myrmex
> npm install
> npm run build
> node dist/service/server.js
> ```

## The Numbers (eval)

`npm run bench` scores every labelled response in `bench/corpus/` through the real detector and prints a confusion matrix. These are the actual numbers from that run — not aspirational targets:

| Class | Support | Precision | Recall |
|---|---|---|---|
| REAL | 12 | 100.0% | 100.0% |
| SOFT_BLOCK | 10 | 100.0% | 100.0% |
| CHALLENGE | 7 | 100.0% | 100.0% |
| DECOY_EMPTY | 7 | 100.0% | 100.0% |
| LAYOUT_DRIFT | 5 | 100.0% | 100.0% |
| **macro / accuracy** | **n = 41** | **100.0%** | **100.0%** |

**Read this honestly.** n = 41 is a *small, hand-authored* corpus: benign block/challenge bodies synthesised from public vendor markup, plus realistic REAL pages and structural decoys — no live scraping. Perfect precision/recall on 41 curated cases means the deterministic rules and thresholds are *self-consistent with the corpus that calibrated them*, not that myrmex is proven at scale. The thresholds in `signatures.json` (`minContentLength 300`, `minDomNodes 8`, `minTextNodes 2`, `minContentRatio 0.03`, …) were calibrated against this corpus; a production deployment should re-derive them from a larger labelled sample of the target domains. The value here is the *method* — model-free, explainable, every verdict carrying its feature trace — not the headline 100%.

## MCP Tool

myrmex exposes one MCP tool, `scrape-trust`, over stdio (`myrmex-mcp`, or `npm run mcp` in dev).

**Input:**

```json
{
  "response": { "status": 200, "headers": {}, "body": "<html>...</html>" },
  "expectedSchema": { "fields": [{ "name": "price", "type": "number", "selector": "#price" }] },
  "baseline": { "tagCounts": { "div": 40, "p": 12 } }
}
```

`expectedSchema` and `baseline` are optional — omitting them simply leaves `low_fill_rate` and `layout_drift` unfired.

**Output** (verdict + full feature trace):

```json
{
  "verdict": "SOFT_BLOCK",
  "trace": [
    {
      "feature": "vendor_challenge_signature",
      "fired": true,
      "value": 1,
      "threshold": 1,
      "detail": "matched vendor(s): cloudflare-block",
      "implies": "SOFT_BLOCK"
    }
  ]
}
```

## Install / Quickstart

```sh
npm install
npm run build            # tsup → dist (ESM + .d.ts), signatures.json bundled
npm run serve            # build, then boot the HTTP service (node dist/service/server.js)
npm run dev:serve        # boot the HTTP service from source via tsx (no build)
npm run mcp              # start the scrape-trust MCP server over stdio (dev)
npm run bench            # run the corpus proof suite (precision / recall / n)
npm test                 # vitest — detector, style guard, corpus checks
npm run typecheck        # tsc --noEmit
npm run lint             # biome check .
```

## Design Invariants

Not suggestions — contracts, enforced by tests and review.

| Invariant | Enforced by |
|-----------|-------------|
| **Model-free verdict path** — no LLM, embedding, network call, or randomness decides a verdict | review; `test/detector.test.ts` proves determinism across repeated calls |
| **Nothing hardcoded** — verdict classes and feature names are unions in `src/core/vocab/`; every fingerprint and threshold lives in `src/core/config/signatures.json`; HTTP/route/message literals are typed constants in `src/service/constants/` | `src/core/config` zod schema; `src/service/constants` |
| **One definition per file** — each type, union, and schema is its own file under a concept folder; barrels only re-export | review |
| **Every verdict carries its trace** — a `ScoreResult` is always `{ verdict, trace }` with all six features present | `test/detector.test.ts` |
| **No comments, no double blank lines** in any `src/**/*.ts` or `bench/**/*.ts` file | `test/style.test.ts` |
| **Honest credit** — the soft-block / silent-scrape problem belongs to the field (Ficstar, webscraper.io, context.dev, ScrapeOps) | this README, `CLAUDE.md` |

## Roadmap

Documented but deliberately out of scope for this slice:

- **Soft-block body generator** — synthesize realistic vendor block/challenge bodies for expanded fixture coverage. Not yet built.
- **Per-domain streaming baseline** — maintain a rolling `LayoutBaseline` per domain instead of a caller-supplied static snapshot. Not yet built.
- **Baseline-derived expected schema** — infer `expectedSchema` selectors from historical successful fetches instead of requiring the caller to hand-author them. Not yet built.

## Acknowledgments

myrmex builds on work by others:

- **[Ficstar](https://ficstar.com/)**, **[webscraper.io](https://webscraper.io/)**, **[context.dev](https://context.dev/)**, **[ScrapeOps](https://scrapeops.io/)** — named and mapped the soft-block / silent-scrape problem this project detects at fetch time.
- **[Model Context Protocol](https://modelcontextprotocol.io/)** — the tool boundary myrmex exposes `scrape-trust` through.
- **[Hono](https://hono.dev/)** — the HTTP framework behind the service surface.
- **[cheerio](https://cheerio.js.org/)** — the DOM parsing engine behind every structural feature.
- **[pino](https://getpino.io/)**, **[zod](https://zod.dev/)**, **[tsup](https://tsup.egoist.dev/)** — logging, validation, and the ESM build.
- **[Keep a Changelog](https://keepachangelog.com/)**, **[Semantic Versioning](https://semver.org/)**, **[Contributor Covenant](https://www.contributor-covenant.org/)**, **[repostatus.org](https://www.repostatus.org/)** — project conventions.

## Citation

```bibtex
@software{myrmex_2026,
  title  = {Myrmex},
  author = {{Enchanter Labs}},
  year   = {2026},
  url    = {https://github.com/enchanter-ai/myrmex}
}
```

## License

MIT — see [LICENSE](LICENSE).
