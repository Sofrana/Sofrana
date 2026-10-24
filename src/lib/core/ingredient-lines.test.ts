import { describe, expect, it } from "vitest";
import {
  MAX_INGREDIENT_LINES,
  parseQuantity,
  sanitizeParsedLines,
  splitIngredientLines,
} from "./ingredient-lines";

describe("splitIngredientLines", () => {
  it("splits on newlines and trims each line", () => {
    expect(splitIngredientLines("  4 yumurta \n\n3 domates\r\n")).toEqual([
      "4 yumurta",
      "3 domates",
    ]);
  });

  it("strips bullet markers", () => {
    expect(
      splitIngredientLines("- 1 su bardağı un\n• 2 yemek kaşığı yağ"),
    ).toEqual(["1 su bardağı un", "2 yemek kaşığı yağ"]);
  });

  it("returns an empty list for blank input", () => {
    expect(splitIngredientLines("  \n \n")).toEqual([]);
  });

  it("caps the number of lines", () => {
    const text = Array.from({ length: 200 }, (_, i) => `malzeme ${i}`).join(
      "\n",
    );
    expect(splitIngredientLines(text)).toHaveLength(MAX_INGREDIENT_LINES);
  });
});

describe("parseQuantity", () => {
  it("reads plain and decimal numbers, with a comma or a dot", () => {
    expect(parseQuantity("3")).toBe(3);
    expect(parseQuantity("1,5")).toBe(1.5);
    expect(parseQuantity("0.25")).toBe(0.25);
  });

  it("reads fractions and mixed numbers", () => {
    expect(parseQuantity("1/2")).toBe(0.5);
    expect(parseQuantity("1 1/2")).toBe(1.5);
  });

  it("returns null for empty or unreadable input", () => {
    expect(parseQuantity("")).toBeNull();
    expect(parseQuantity("biraz")).toBeNull();
    expect(parseQuantity("1/0")).toBeNull();
    expect(parseQuantity("-2")).toBeNull();
  });
});

describe("sanitizeParsedLines", () => {
  const source = ["4 yumurta", "tuz"];

  it("keeps valid lines in order", () => {
    const result = sanitizeParsedLines(
      [
        { rawText: "4 yumurta", quantity: 4, unit: "adet" },
        { rawText: "tuz", quantity: null, unit: null },
      ],
      source,
    );
    expect(result).toEqual([
      { rawText: "4 yumurta", quantity: 4, unit: "adet" },
      { rawText: "tuz", quantity: null, unit: null },
    ]);
  });

  it("replaces invalid quantities and units with null", () => {
    const result = sanitizeParsedLines(
      [
        { rawText: "4 yumurta", quantity: -1, unit: 5 },
        { rawText: "tuz", quantity: "az", unit: "  " },
      ],
      source,
    );
    expect(result.map((l) => [l.quantity, l.unit])).toEqual([
      [null, null],
      [null, null],
    ]);
  });

  it("falls back to the pasted line when the model drops or blanks the text", () => {
    const result = sanitizeParsedLines(
      [{ rawText: "", quantity: 4, unit: null }, { quantity: null }],
      source,
    );
    expect(result.map((l) => l.rawText)).toEqual(source);
  });

  it("returns every pasted line unparsed when the output is not a list", () => {
    expect(sanitizeParsedLines("oops", source)).toEqual([
      { rawText: "4 yumurta", quantity: null, unit: null },
      { rawText: "tuz", quantity: null, unit: null },
    ]);
  });

  it("fills missing trailing lines from the pasted text", () => {
    const result = sanitizeParsedLines(
      [{ rawText: "4 yumurta", quantity: 4, unit: "adet" }],
      source,
    );
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ rawText: "tuz", quantity: null, unit: null });
  });

  it("drops extra lines the model invented", () => {
    const result = sanitizeParsedLines(
      [
        { rawText: "4 yumurta", quantity: 4, unit: "adet" },
        { rawText: "tuz", quantity: null, unit: null },
        { rawText: "uydurma", quantity: 1, unit: "adet" },
      ],
      source,
    );
    expect(result).toHaveLength(2);
  });
});
