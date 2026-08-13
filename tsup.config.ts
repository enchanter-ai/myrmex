import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "service/server": "src/service/server.ts",
    "distribution/mcp": "src/distribution/mcp.ts",
    "bin/myrmex-serve": "bin/myrmex-serve.ts",
    "bin/myrmex-mcp": "bin/myrmex-mcp.ts",
  },
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  dts: { entry: { index: "src/index.ts" } },
  clean: true,
  sourcemap: true,
  splitting: false,
  shims: false,
  loader: { ".json": "json" },
});
