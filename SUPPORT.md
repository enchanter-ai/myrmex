# Support

Short version: **pick the right channel, and you'll get an answer faster.**

## Where to go

| You have a… | Go to |
|-------------|-------|
| Security vulnerability | [Private security advisory](https://github.com/enchanter-ai/myrmex/security/advisories/new) — **never** a public issue. See [SECURITY.md](SECURITY.md). |
| Reproducible bug | [Bug report issue](https://github.com/enchanter-ai/myrmex/issues/new). Include the input response, surface (library / service / MCP), and exact verdict + trace output. |
| Concrete feature proposal | [Feature request issue](https://github.com/enchanter-ai/myrmex/issues/new). |
| Usage question | [Discussions → Q&A](https://github.com/enchanter-ai/myrmex/discussions) |

## Before filing

1. **Search first.** Existing issues and Discussions. Duplicates get closed without comment.
2. **Read the docs.** Most questions are answered in the [README](README.md) — overview, install, the five verdicts, the six features, the honest bench numbers, and the MCP / HTTP surfaces.
3. **Reproduce it deterministically.** Drive `scoreResponse` directly (as the tests in `test/` do) — feed the `{ status, headers, body }` and assert on the verdict and trace. No network, no model, replayable — the fastest way to isolate a scoring issue.
4. **Narrow the case.** "It sometimes misclassifies" is not reproducible. Minimize the failing response into a corpus fixture.

## Response expectations

This is a community-maintained project. We answer when we can, usually within a few days.

- **Security reports**: acknowledged within 72 hours (see [SECURITY.md](SECURITY.md)).
- **Bug reports**: triaged roughly weekly. High-signal reports (clear repro, exact versions) move fastest.
- **Feature requests**: considered at roadmap review time, not on demand.

## What we can't help with

- Questions about the Model Context Protocol itself → the [MCP project](https://modelcontextprotocol.io).
- Questions about unblocking / bypass technology → Myrmex is a downstream trust-gate, not a bypass tool.
- Questions about Claude Code or the Claude Agent SDK → [anthropics/claude-code](https://github.com/anthropics/claude-code).

Thanks for using an @enchanter-ai product.
