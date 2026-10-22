import { describe, expect, it } from "vitest";
import { isProtectedPath, splitLocale } from "./paths";

const locales = ["tr", "en"] as const;

describe("splitLocale", () => {
  it("returns no locale for the default-locale path", () => {
    expect(splitLocale("/admin", locales)).toEqual({
      locale: null,
      path: "/admin",
    });
  });

  it("splits the locale prefix from the path", () => {
    expect(splitLocale("/en/admin/dishes", locales)).toEqual({
      locale: "en",
      path: "/admin/dishes",
    });
  });

  it("maps a bare locale path to the root", () => {
    expect(splitLocale("/en", locales)).toEqual({ locale: "en", path: "/" });
  });

  it("does not treat a longer segment as a locale", () => {
    expect(splitLocale("/english", locales)).toEqual({
      locale: null,
      path: "/english",
    });
  });
});

describe("isProtectedPath", () => {
  it("protects the admin area and everything below it", () => {
    expect(isProtectedPath("/admin")).toBe(true);
    expect(isProtectedPath("/admin/dishes/new")).toBe(true);
  });

  it("leaves public pages open", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("does not match paths that only start with the same letters", () => {
    expect(isProtectedPath("/administrator")).toBe(false);
  });
});
