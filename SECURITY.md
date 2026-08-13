# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security reports.** Use GitHub's private vulnerability reporting instead:

- **Primary channel:** [Open a private security advisory](https://github.com/enchanter-ai/myrmex/security/advisories/new) on this repository.
- **Maintainers:** the Enchanter Labs maintainers.

We treat reports confidentially. We will acknowledge receipt within 72 hours and share a remediation timeline within 7 days. Coordinated disclosure is strongly preferred — please do not disclose publicly until a fix has shipped or we have agreed on a disclosure date together.

## What to include

A good report has:

- A clear, reproducible proof-of-concept (ideally a minimal `scoreResponse` input, as in `test/`, or a captured HTTP response saved as a corpus fixture).
- The exact module and surface (library, HTTP service, or MCP tool) involved.
- The version you observed the issue in (`npm ls @enchanter-ai/myrmex`).
- Impact assessment: what can an attacker do, and under what preconditions.
- Suggested remediation, if you have one.

Minimal reports ("there's a bug") get triaged last. Be specific.

## Supported versions

The security fix window tracks the latest minor release. Older minors receive fixes for critical issues only, at maintainer discretion.

| Version | Supported |
|---------|-----------|
| latest minor | ✅ full support |
| older | ❌ not supported |

## Scope

Myrmex is a trust-gate, so evasion of its verdict is the central concern. In scope:

- **Verdict evasion** — a soft-block, challenge, decoy, or drifted response that Myrmex scores `REAL`, letting silent-failure content reach a downstream parser.
- **False `REAL` via missing signatures** — a known anti-bot vendor whose block/challenge body Myrmex fails to recognize (fixed by adding a signature to `signatures.json`).
- **Injectability of the detector itself** — any path where the scored HTTP body influences Myrmex's own control flow beyond the documented deterministic features (the detector must stay deterministic and model-free by construction).
- **Denial of service** — an input that makes the DOM parse or feature extraction hang or exhaust memory.
- **Service surface** — request handling in the Hono service (`POST /score`, `GET /health`).

Out of scope:

- The HTTP service ships with **no authentication, no rate-limiting, and no TLS** by design — it is meant to run behind a trusted gateway or in a private network. "The service is unauthenticated" is a documented limitation, not a vulnerability.
- Vulnerabilities in the Model Context Protocol SDK, `hono`, `cheerio`, `pino`, or `zod` — report to those projects.
- Vulnerabilities in Claude Code or the Claude Agent SDK — report at [anthropics/claude-code](https://github.com/anthropics/claude-code/issues).
- The bundled fixtures are benign by construction: block/challenge bodies synthesised from public vendor markup, no live scraping.

## Safe harbor

Good-faith security research that adheres to this policy is welcomed. We will not pursue legal action against researchers who make a reasonable effort to avoid privacy violations, data destruction, or service degradation; report through the private channel above; and give us a reasonable window to remediate before public disclosure.

## Related documents

- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community behavior
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution workflow
- [SUPPORT.md](SUPPORT.md) — where to ask non-security questions
