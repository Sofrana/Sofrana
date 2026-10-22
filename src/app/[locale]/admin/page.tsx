import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AdminPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // Reading the session needs cookies, so it runs at request time inside Suspense.
  // Without this, `next build` fails while prerendering the page (cacheComponents).
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Suspense fallback={null}>
        <AdminContent locale={locale as Locale} />
      </Suspense>
    </main>
  );
}

async function AdminContent({ locale }: { locale: Locale }) {
  // The proxy already redirects, this check keeps the page safe on its own
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale });

  const t = await getTranslations({ locale, namespace: "Admin" });

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-sm opacity-70">
        {t("signedInAs", { email: user?.email ?? "" })}
      </p>
      <form action={signOut}>
        <button type="submit" className="rounded border px-3 py-2 text-sm">
          {t("signOut")}
        </button>
      </form>
    </>
  );
}
