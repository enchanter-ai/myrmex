import { describe, expect, it } from "vitest";
import { FEATURES, scoreResponse, verdictFrom } from "../src/index.js";
import type { FeatureHit, HttpResponse, ScoreInput } from "../src/index.js";

function response(body: string, status = 200, headers: Record<string, string> = {}): HttpResponse {
  return { status, headers, body };
}

const REAL_ARTICLE = `<html><head><title>Deep Sea Vents</title></head><body>
<header><h1>Hydrothermal Vents and Chemosynthetic Life</h1></header>
<article>
<p>Hydrothermal vents host dense communities of tube worms, clams, and shrimp that rely on
chemosynthetic bacteria rather than sunlight for primary production.</p>
<p>The bacteria oxidize hydrogen sulfide seeping from the vent fluid, fixing carbon into
biomass that supports the surrounding food web.</p>
<p>Discovered in 1977 near the Galapagos Rift, these ecosystems reshaped biology's
understanding of where life can flourish on Earth.</p>
<ul><li>Tube worms</li><li>Vent crabs</li><li>Yeti crabs</li><li>Pompeii worms</li></ul>
</article>
<footer>Published by the Ocean Science Desk.</footer>
</body></html>`;

describe("scoreResponse verdict classes", () => {
  it("returns CHALLENGE for a Cloudflare challenge page", () => {
    const input: ScoreInput = {
      response: response(
        "<html><body>Just a moment...please wait while we check your browser.</body></html>",
      ),
    };
    expect(scoreResponse(input).verdict).toBe("CHALLENGE");
  });

  it("returns SOFT_BLOCK for a Cloudflare block page", () => {
    const input: ScoreInput = {
      response: response(
        "<html><body>Sorry, you have been blocked. Cloudflare Ray ID: 8f1a2b3c</body></html>",
        403,
      ),
    };
    expect(scoreResponse(input).verdict).toBe("SOFT_BLOCK");
  });

  it("returns SOFT_BLOCK for a block body served under HTTP 200", () => {
    const input: ScoreInput = {
      response: response(
        "<html><body>Sorry, you have been blocked from accessing this page.</body></html>",
        200,
      ),
    };
    expect(scoreResponse(input).verdict).toBe("SOFT_BLOCK");
  });

  it("returns SOFT_BLOCK via low fill rate when expected fields are missing", () => {
    const body = `<html><head><title>Listing Page</title></head><body>
<header><h1>Product Listings</h1></header>
<section>
<p>Browse our catalog of hand-picked items curated by the editorial team this season.</p>
<p>Each listing below links to a longer description with sizing and shipping details.</p>
<ul><li>Item one</li><li>Item two</li><li>Item three</li><li>Item four</li></ul>
</section>
<footer>Catalog footer text goes here for context.</footer>
</body></html>`;
    const input: ScoreInput = {
      response: response(body, 200),
      expectedSchema: {
        fields: [
          { name: "title", type: "string", selector: "#product-title" },
          { name: "price", type: "number", selector: "#product-price" },
          { name: "sku", type: "string", selector: "#product-sku" },
        ],
      },
    };
    expect(scoreResponse(input).verdict).toBe("SOFT_BLOCK");
  });

  it("returns DECOY_EMPTY for a near-empty body", () => {
    const input: ScoreInput = { response: response("<html></html>") };
    expect(scoreResponse(input).verdict).toBe("DECOY_EMPTY");
  });

  it("returns LAYOUT_DRIFT when structure diverges sharply from the baseline", () => {
    const body = `<html><body>${"<p>real content sentence here.</p>".repeat(30)}</body></html>`;
    const input: ScoreInput = {
      response: response(body, 200),
      baseline: { tagCounts: { table: 200, tr: 400, td: 800 } },
    };
    expect(scoreResponse(input).verdict).toBe("LAYOUT_DRIFT");
  });

  it("returns REAL for a full article with no markers", () => {
    const input: ScoreInput = { response: response(REAL_ARTICLE) };
    expect(scoreResponse(input).verdict).toBe("REAL");
  });
});

describe("scoreResponse trace", () => {
  it("always includes all six features", () => {
    const result = scoreResponse({ response: response(REAL_ARTICLE) });
    expect(result.trace).toHaveLength(6);
    const names = result.trace.map((hit) => hit.feature).sort();
    expect(names).toEqual([...FEATURES].sort());
  });

  it("is deterministic across repeated calls", () => {
    const input: ScoreInput = { response: response(REAL_ARTICLE) };
    const first = scoreResponse(input);
    const second = scoreResponse(input);
    expect(second).toEqual(first);
  });
});

function hit(
  feature: FeatureHit["feature"],
  fired: boolean,
  implies: FeatureHit["implies"],
): FeatureHit {
  return { feature, fired, value: fired ? 1 : 0, threshold: 1, detail: "synthetic", implies };
}

describe("verdictFrom precedence", () => {
  it("prefers CHALLENGE over every other fired feature", () => {
    const hits: FeatureHit[] = [
      hit("vendor_challenge_signature", true, "CHALLENGE"),
      hit("block_body_with_200", true, "SOFT_BLOCK"),
      hit("decoy_empty_body", true, "DECOY_EMPTY"),
      hit("low_content_ratio", false, "DECOY_EMPTY"),
      hit("low_fill_rate", true, "SOFT_BLOCK"),
      hit("layout_drift", true, "LAYOUT_DRIFT"),
    ];
    expect(verdictFrom(hits)).toBe("CHALLENGE");
  });

  it("prefers vendor SOFT_BLOCK over a fired decoy", () => {
    const hits: FeatureHit[] = [
      hit("vendor_challenge_signature", true, "SOFT_BLOCK"),
      hit("block_body_with_200", false, "SOFT_BLOCK"),
      hit("decoy_empty_body", true, "DECOY_EMPTY"),
      hit("low_content_ratio", false, "DECOY_EMPTY"),
      hit("low_fill_rate", false, "SOFT_BLOCK"),
      hit("layout_drift", false, "LAYOUT_DRIFT"),
    ];
    expect(verdictFrom(hits)).toBe("SOFT_BLOCK");
  });

  it("prefers a fired decoy over a fired low_fill_rate", () => {
    const hits: FeatureHit[] = [
      hit("vendor_challenge_signature", false, null),
      hit("block_body_with_200", false, "SOFT_BLOCK"),
      hit("decoy_empty_body", true, "DECOY_EMPTY"),
      hit("low_content_ratio", false, "DECOY_EMPTY"),
      hit("low_fill_rate", true, "SOFT_BLOCK"),
      hit("layout_drift", false, "LAYOUT_DRIFT"),
    ];
    expect(verdictFrom(hits)).toBe("DECOY_EMPTY");
  });

  it("prefers a fired low_fill_rate over a fired layout_drift", () => {
    const hits: FeatureHit[] = [
      hit("vendor_challenge_signature", false, null),
      hit("block_body_with_200", false, "SOFT_BLOCK"),
      hit("decoy_empty_body", false, "DECOY_EMPTY"),
      hit("low_content_ratio", false, "DECOY_EMPTY"),
      hit("low_fill_rate", true, "SOFT_BLOCK"),
      hit("layout_drift", true, "LAYOUT_DRIFT"),
    ];
    expect(verdictFrom(hits)).toBe("SOFT_BLOCK");
  });

  it("falls back to LAYOUT_DRIFT when only layout_drift fires", () => {
    const hits: FeatureHit[] = [
      hit("vendor_challenge_signature", false, null),
      hit("block_body_with_200", false, "SOFT_BLOCK"),
      hit("decoy_empty_body", false, "DECOY_EMPTY"),
      hit("low_content_ratio", false, "DECOY_EMPTY"),
      hit("low_fill_rate", false, "SOFT_BLOCK"),
      hit("layout_drift", true, "LAYOUT_DRIFT"),
    ];
    expect(verdictFrom(hits)).toBe("LAYOUT_DRIFT");
  });

  it("falls back to REAL when nothing fires", () => {
    const hits: FeatureHit[] = [
      hit("vendor_challenge_signature", false, null),
      hit("block_body_with_200", false, "SOFT_BLOCK"),
      hit("decoy_empty_body", false, "DECOY_EMPTY"),
      hit("low_content_ratio", false, "DECOY_EMPTY"),
      hit("low_fill_rate", false, "SOFT_BLOCK"),
      hit("layout_drift", false, "LAYOUT_DRIFT"),
    ];
    expect(verdictFrom(hits)).toBe("REAL");
  });
});
