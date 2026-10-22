import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo } from "@/components/ui/logo";

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("HomePage");
  const tLogo = useTranslations("Logo");
  const otherLocale: Locale = locale === "tr" ? "en" : "tr";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1>
        <Logo label={tLogo("label")} className="text-[3.5rem]" />
      </h1>
      <p className="text-body">{t("tagline")}</p>
      <p className="text-small text-muted">{t("status")}</p>
      <Link href="/" locale={otherLocale} className="text-small underline">
        {t("switchLanguage")}
      </Link>
    </main>
  );
}
