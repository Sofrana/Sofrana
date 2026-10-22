import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isProtectedPath, splitLocale } from "./lib/auth/paths";
import { getUser } from "./lib/supabase/proxy";

const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);
  const { locale, path } = splitLocale(
    request.nextUrl.pathname,
    routing.locales,
  );

  // Public pages only get the locale handling
  if (!isProtectedPath(path)) return response;

  const user = await getUser(request, response);
  if (user) return response;

  const prefix = locale && locale !== routing.defaultLocale ? `/${locale}` : "";
  const redirect = NextResponse.redirect(
    new URL(`${prefix}/login`, request.url),
  );
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  // Run on everything except API routes, Next.js internals and files with an extension.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
