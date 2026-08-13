import type { Config } from "../config/config.js";
import type { HttpResponse } from "../types/httpResponse.js";
import type { BlockingVerdict } from "../vocab/blockingVerdict.js";
import type { FeatureExtractor } from "./types.js";

export interface VendorMatch {
  vendor: string;
  implies: BlockingVerdict;
  markers: number;
}

export function matchVendors(response: HttpResponse, config: Config): VendorMatch[] {
  const matches: VendorMatch[] = [];
  const bodyLower = response.body.toLowerCase();
  for (const signature of config.vendors) {
    let markers = 0;
    for (const marker of signature.bodyMarkers) {
      if (bodyLower.includes(marker.toLowerCase())) markers += 1;
    }
    for (const marker of signature.headerMarkers) {
      const entry = Object.entries(response.headers).find(
        ([name]) => name.toLowerCase() === marker.name.toLowerCase(),
      );
      if (!entry) continue;
      const [, value] = entry;
      if (marker.contains === "" || value.toLowerCase().includes(marker.contains.toLowerCase()))
        markers += 1;
    }
    if (markers > 0)
      matches.push({ vendor: signature.vendor, implies: signature.implies, markers });
  }
  return matches;
}

export const vendorChallengeSignature: FeatureExtractor = (ctx) => {
  const matches = matchVendors(ctx.input.response, ctx.config);
  if (matches.length === 0) {
    return {
      feature: "vendor_challenge_signature",
      fired: false,
      value: 0,
      threshold: 1,
      detail: "no vendor signature matched",
      implies: null,
    };
  }
  const implies = matches.some((match) => match.implies === "CHALLENGE")
    ? "CHALLENGE"
    : "SOFT_BLOCK";
  const value = matches.reduce((total, match) => total + match.markers, 0);
  const vendors = matches.map((match) => match.vendor).join(", ");
  return {
    feature: "vendor_challenge_signature",
    fired: true,
    value,
    threshold: 1,
    detail: `matched vendor(s): ${vendors}`,
    implies,
  };
};
