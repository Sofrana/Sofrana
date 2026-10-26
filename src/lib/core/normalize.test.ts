import { describe, expect, it } from "vitest";
import {
  canonicalName,
  normalizeText,
  toGrams,
  unitToMl,
  type DensityInfo,
} from "./normalize";

const flour: DensityInfo = { gramsPerMl: 0.5, gramsPerPiece: null };
const onion: DensityInfo = { gramsPerMl: null, gramsPerPiece: 110 };
const water: DensityInfo = { gramsPerMl: 1, gramsPerPiece: null };

describe("normalizeText", () => {
  it("lowercases with Turkish rules and strips diacritics", () => {
    expect(normalizeText("Patlıcan")).toBe("patlican");
    expect(normalizeText("İSTANBUL")).toBe("istanbul");
    expect(normalizeText("  Kırmızı   Pul  Biber ")).toBe("kirmizi pul biber");
  });
});

describe("unitToMl", () => {
  it("knows the Turkish volume units", () => {
    expect(unitToMl("su bardağı")).toBe(200);
    expect(unitToMl("çay bardağı")).toBe(100);
    expect(unitToMl("yemek kaşığı")).toBe(15);
    expect(unitToMl("tatlı kaşığı")).toBe(10);
    expect(unitToMl("çay kaşığı")).toBe(5);
    expect(unitToMl("ml")).toBe(1);
    expect(unitToMl("litre")).toBe(1000);
  });

  it("accepts case and spelling variants", () => {
    expect(unitToMl("Su Bardağı")).toBe(200);
    expect(unitToMl("yk")).toBe(15);
    expect(unitToMl("sb")).toBe(200);
  });

  it("returns null for non-volume units", () => {
    expect(unitToMl("adet")).toBeNull();
    expect(unitToMl("gr")).toBeNull();
    expect(unitToMl(null)).toBeNull();
  });
});

describe("toGrams", () => {
  it("passes weights through", () => {
    expect(toGrams(500, "gr", null)).toBe(500);
    expect(toGrams(500, "g", null)).toBe(500);
    expect(toGrams(1.5, "kg", null)).toBe(1500);
  });

  it("converts volumes with the ingredient density", () => {
    expect(toGrams(2, "su bardağı", flour)).toBe(200);
    expect(toGrams(1, "yemek kaşığı", water)).toBe(15);
  });

  it("converts pieces with the ingredient piece weight", () => {
    expect(toGrams(2, "adet", onion)).toBe(220);
    expect(toGrams(3, null, onion)).toBe(330);
  });

  it("returns null when the data to convert is missing", () => {
    expect(toGrams(2, "su bardağı", onion)).toBeNull();
    expect(toGrams(2, "adet", flour)).toBeNull();
    expect(toGrams(null, "gr", null)).toBeNull();
    expect(toGrams(2, "tutam", flour)).toBeNull();
    expect(toGrams(2, "su bardağı", null)).toBeNull();
  });
});

describe("canonicalName", () => {
  const synonyms = new Map([
    ["kirmizi pul biber", "pul-biber"],
    ["pul biber", "pul-biber"],
    ["patlican", "patlican"],
  ]);

  it("merges synonyms into one slug", () => {
    expect(canonicalName("Kırmızı Pul Biber", synonyms)).toBe("pul-biber");
    expect(canonicalName("pul biber", synonyms)).toBe("pul-biber");
  });

  it("ignores diacritics and extra spaces", () => {
    expect(canonicalName("  PATLICAN ", synonyms)).toBe("patlican");
  });

  it("strips quantities and units written inside the line", () => {
    expect(canonicalName("2 adet patlıcan", synonyms)).toBe("patlican");
  });

  it("returns null for unknown names", () => {
    expect(canonicalName("safran", synonyms)).toBeNull();
  });
});
