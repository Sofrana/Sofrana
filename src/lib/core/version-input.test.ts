import { describe, expect, it } from "vitest";
import { slugify, validateVersionInput } from "./version-input";

const line = { rawText: "4 yumurta", quantity: 4, unit: "adet" };

describe("validateVersionInput", () => {
  it("accepts a complete version", () => {
    const result = validateVersionInput({
      sourceUrl: "https://example.com/menemen",
      rating: "4,6",
      voteCount: "120",
      lines: [line],
    });
    expect(result).toEqual({
      ok: true,
      value: {
        sourceUrl: "https://example.com/menemen",
        rating: 4.6,
        voteCount: 120,
        lines: [line],
      },
    });
  });

  it("allows rating and vote count to be empty", () => {
    const result = validateVersionInput({
      sourceUrl: "https://example.com/a",
      rating: "",
      voteCount: " ",
      lines: [line],
    });
    expect(result).toMatchObject({
      ok: true,
      value: { rating: null, voteCount: null },
    });
  });

  it("requires an http or https source url", () => {
    for (const sourceUrl of [
      "",
      "menemen",
      "javascript:alert(1)",
      "ftp://x.com",
    ]) {
      expect(
        validateVersionInput({
          sourceUrl,
          rating: "",
          voteCount: "",
          lines: [line],
        }),
      ).toEqual({ ok: false, error: "sourceUrl" });
    }
  });

  it("rejects a rating outside 0–5", () => {
    for (const rating of ["6", "-1", "abc"]) {
      expect(
        validateVersionInput({
          sourceUrl: "https://example.com/a",
          rating,
          voteCount: "",
          lines: [line],
        }),
      ).toEqual({ ok: false, error: "rating" });
    }
  });

  it("rejects a vote count that is not a whole number", () => {
    for (const voteCount of ["1.5", "-3", "çok"]) {
      expect(
        validateVersionInput({
          sourceUrl: "https://example.com/a",
          rating: "",
          voteCount,
          lines: [line],
        }),
      ).toEqual({ ok: false, error: "voteCount" });
    }
  });

  it("requires at least one ingredient line with text", () => {
    const base = {
      sourceUrl: "https://example.com/a",
      rating: "",
      voteCount: "",
    };
    expect(validateVersionInput({ ...base, lines: [] })).toEqual({
      ok: false,
      error: "lines",
    });
    expect(
      validateVersionInput({
        ...base,
        lines: [{ rawText: "  ", quantity: null, unit: null }],
      }),
    ).toEqual({ ok: false, error: "lines" });
  });
});

describe("slugify", () => {
  it("lowercases and transliterates Turkish letters", () => {
    expect(slugify("Hünkâr Beğendi")).toBe("hunkar-begendi");
    expect(slugify("Işıl ÇORBA")).toBe("isil-corba");
  });

  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  Kuru   Fasulye! ")).toBe("kuru-fasulye");
  });
});
