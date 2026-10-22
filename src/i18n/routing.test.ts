import { describe, expect, it } from "vitest";
import { routing } from "./routing";

describe("i18n routing", () => {
  it("uses Turkish as the default locale", () => {
    expect(routing.defaultLocale).toBe("tr");
  });

  it("supports Turkish and English", () => {
    expect(routing.locales).toEqual(["tr", "en"]);
  });
});
