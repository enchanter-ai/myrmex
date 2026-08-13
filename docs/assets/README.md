# docs/assets — rendered diagrams

`architecture.svg` is **pre-rendered** so GitHub's mobile app (which does not render ` ```mermaid ` blocks) shows it correctly. The main `README.md` references it as an `<img>`.

## Files

| File | Source | Regenerate |
|------|--------|-----------|
| `architecture.svg` | `architecture.mmd` | `npx @mermaid-js/mermaid-cli -i architecture.mmd -o architecture.svg -c mermaid.config.json -p puppeteer.config.json -b "#0a1628" -w 1400 && node apply-blueprint.js architecture.svg` |

The `apply-blueprint.js` step overlays an engineering-blueprint grid (navy `#0a1628` paper, `#1e3a5f` major lines / `#16304f` minor lines) onto the rendered diagram so it reads as a CAD drawing rather than a neutral dark card — the same convention as the sibling products.

Run the command from `docs/assets/` (paths are relative). The toolchain (`node_modules/`) is gitignored; only the source `.mmd`, the rendered `.svg`, and the configs are committed.
