import { load } from "cheerio";
import type { CheerioAPI } from "cheerio";

export function parseDom(html: string): {
  dom: CheerioAPI;
  domNodeCount: number;
  textNodeCount: number;
  visibleText: string;
} {
  const dom = load(html);
  const domNodeCount = dom("*").length;
  const clone = load(html);
  clone("script, style, noscript, template").remove();
  const pieces: string[] = [];
  let textNodeCount = 0;
  clone
    .root()
    .find("*")
    .addBack()
    .contents()
    .each((_, node) => {
      if (node.type !== "text") return;
      const text = node.data.trim();
      if (text.length === 0) return;
      textNodeCount += 1;
      pieces.push(text);
    });
  const visibleText = pieces.join(" ").replace(/\s+/g, " ").trim();
  return { dom, domNodeCount, textNodeCount, visibleText };
}
