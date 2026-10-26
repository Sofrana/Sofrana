import { describe, expect, it } from "vitest";
import { sanitizeMatch } from "./ambiguous-match";

const slugs = new Set(["pul-biber", "patlican", "sogan"]);

describe("sanitizeMatch", () => {
  it("accepts a known slug", () => {
    expect(sanitizeMatch({ slug: "patlican" }, slugs)).toBe("patlican");
  });

  it("rejects slugs that are not in the ingredient table", () => {
    expect(sanitizeMatch({ slug: "safran" }, slugs)).toBeNull();
  });

  it("treats null and malformed answers as no match", () => {
    expect(sanitizeMatch({ slug: null }, slugs)).toBeNull();
    expect(sanitizeMatch({ slug: 3 }, slugs)).toBeNull();
    expect(sanitizeMatch("patlican", slugs)).toBeNull();
    expect(sanitizeMatch(undefined, slugs)).toBeNull();
  });

  it("trims the slug", () => {
    expect(sanitizeMatch({ slug: " sogan " }, slugs)).toBe("sogan");
  });
});
