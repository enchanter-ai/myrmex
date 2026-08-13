# Changelog

All notable changes to `@enchanter-ai/myrmex` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — deterministic, model-free soft-block / silent-scrape oracle

The initial release (renamed from an internal prototype; scoring behavior is byte-for-byte identical). See [README.md](README.md) for the complete surface.

### Highlights

- **Five verdicts, six deterministic features, zero ML calls in the verdict path.** Scores a single `{ status, headers, body }` (plus optional `expectedSchema` and `baseline`) into `REAL`, `SOFT_BLOCK`, `CHALLENGE`, `DECOY_EMPTY`, or `LAYOUT_DRIFT`, always with a full feature trace.
- **Nothing hardcoded outside `signatures.json`.** Ten vendor fingerprints (Cloudflare, DataDome, PerimeterX, Akamai, Imperva, hCaptcha, reCAPTCHA) and every threshold are data, validated by a zod schema at load.
- **Two surfaces, one engine.** A `scrape-trust` MCP tool (stdio) and a Hono HTTP service (`POST /score`, `GET /health`) both call the exact same `scoreResponse` — no behavior forks per surface.
- **Honest numbers.** `npm run bench` scores 41 labelled fixtures through the real detector: 100% precision / recall on a small, hand-authored corpus — the method is the value, not the headline percentage.

### Architecture

- **One definition per file.** `core/types`, `core/vocab`, and `core/config` split every type, union, and schema into its own file under a concept folder; barrels only re-export.
- **Typed constants.** HTTP status codes, routes, methods, headers, content-types, defaults, and log/error messages live in `src/service/constants/`; env keys in `src/core/config/envKeys.ts`. No magic literals in logic.
- **Shared validation.** A single zod score-input schema in `src/core/validation/` is consumed by both the service and the MCP tool.

### Libraries

- **Hono** + **@hono/node-server** for the HTTP service.
- **pino** for structured logging (boot, per-request, error); `pino-pretty` is a dev-only nicety.
- **zod** for the shared score-input schema and the signatures config schema (the `Config` type is derived via `z.infer`).
- **tsup** for the ESM + `.d.ts` build; `signatures.json` is bundled (inlined) so there is no runtime fs read and no copy-assets step. Default config load is memoized and zero-setup; `MYRMEX_SIGNATURES_PATH` overrides with an fs-read + zod-validated file, failing fast on invalid input.

### Governance

- Tier-1 docs: `LICENSE`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CITATION.cff`, `CLAUDE.md`.
- CI (`.github/workflows/ci.yml`) on Node 20 + 22: typecheck, lint, test, build, bench, and a smoke step that boots the compiled service and curls `/health` and `/score`.
- Multi-stage `Dockerfile` (`node:22` → `node:22-slim`, non-root, runs the compiled `dist`).

### Known limitations (roadmap)

- The HTTP service has **no authentication, rate-limiting, or TLS** — run it behind a trusted gateway or in a private network.
- `n = 41` is a small, hand-authored corpus. Thresholds in `signatures.json` are self-consistent with the corpus that calibrated them; re-derive them from a larger labelled sample before a production deployment.
- Soft-block body synthesis, per-domain streaming baselines, and baseline-derived expected schemas are documented but deliberately out of scope for this slice.

[0.1.0]: https://github.com/enchanter-ai/myrmex/releases/tag/v0.1.0
