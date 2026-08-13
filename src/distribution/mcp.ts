import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { scoreInputShape } from "../core/validation/scoreInput.js";
import { scoreResponse } from "../index.js";
import type { ScoreInput } from "../index.js";
import { env } from "../service/env.js";

export function buildServer(): McpServer {
  const server = new McpServer({ name: "myrmex", version: env.version });

  server.registerTool(
    "scrape-trust",
    {
      title: "Scrape Trust",
      description:
        "Decides whether a fetched HTTP response is REAL data or a silent failure " +
        "(SOFT_BLOCK, CHALLENGE, DECOY_EMPTY, LAYOUT_DRIFT). Model-free: heuristics, " +
        "vendor signatures, and schema/DOM math only, with a full explainable feature trace.",
      inputSchema: scoreInputShape,
    },
    (args) => {
      const input: ScoreInput = {
        response: args.response,
        expectedSchema: args.expectedSchema,
        baseline: args.baseline,
      };
      const result = scoreResponse(input);
      const fired = result.trace.filter((hit) => hit.fired).map((hit) => hit.feature);
      const summary = `${result.verdict} — ${fired.length ? fired.join(", ") : "no features fired"}`;
      return {
        content: [
          { type: "text", text: summary },
          { type: "text", text: JSON.stringify(result, null, 2) },
        ],
        structuredContent: { verdict: result.verdict, trace: result.trace },
      };
    },
  );

  return server;
}

export async function main(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
