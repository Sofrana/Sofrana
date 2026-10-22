const PROTECTED_PREFIXES = ["/admin"];

export function splitLocale(
  pathname: string,
  locales: readonly string[],
): { locale: string | null; path: string } {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) };
    }
  }
  return { locale: null, path: pathname };
}

export function isProtectedPath(path: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
