import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("HomePage");
  const otherLocale: Locale = locale === "tr" ? "en" : "tr";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Sofrana</h1>
      <p className="text-lg">{t("tagline")}</p>
      <p className="text-sm opacity-70">{t("status")}</p>
      <Link href="/" locale={otherLocale} className="text-sm underline">
        {t("switchLanguage")}
      </Link>
    </main>
  );
}
