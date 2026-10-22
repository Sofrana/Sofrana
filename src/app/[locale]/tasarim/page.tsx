import { use } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IngredientBar } from "@/components/ui/ingredient-bar";
import { Logo } from "@/components/ui/logo";
import { SectionDivider } from "@/components/ui/section-divider";
import { Tabs } from "@/components/ui/tabs";
import { recipeCount } from "@/lib/core/consensus-ring";

const SWATCHES = [
  "cream",
  "card",
  "ink",
  "muted",
  "line",
  "subtle",
  "espresso",
  "kitchen-surface",
  "saffron",
  "copper",
  "chili",
  "egg",
  "tomato",
  "pepper",
  "salt",
  "blackpepper",
  "onion",
  "olive",
] as const;

const TOTAL = 13;

export default function DesignSystemPage({
  params,
}: PageProps<"/[locale]/tasarim">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("DesignSystem");
  const tLogo = useTranslations("Logo");

  const ingredients = [
    { key: "egg", share: 100, color: "var(--color-egg)" },
    { key: "tomato", share: 100, color: "var(--color-tomato)" },
    { key: "pepper", share: 92, color: "var(--color-pepper)" },
    { key: "onion", share: 46, color: "var(--color-onion)" },
  ] as const;

  return (
    <main className="px-gutter mx-auto w-full max-w-6xl py-12 md:px-10">
      <Logo label={tLogo("label")} className="text-[2.875rem]" />
      <h1 className="text-h1 mt-10 font-extrabold">{t("title")}</h1>
      <p className="text-muted mt-3 max-w-2xl">{t("intro")}</p>

      <SectionDivider className="mt-10" />

      <section aria-labelledby="ds-colors">
        <h2 id="ds-colors" className="text-h2 font-bold">
          {t("colors")}
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((name) => (
            <li key={name} className="text-small">
              <span
                className="rounded-chip border-line block h-16 border-[1.5px]"
                style={{ background: `var(--color-${name})` }}
              />
              <code className="mt-2 block">{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ds-type" className="mt-section">
        <h2 id="ds-type" className="text-h2 font-bold">
          {t("type")}
        </h2>
        <div className="mt-6 space-y-4">
          <p className="font-display text-display font-extrabold">
            {t("displaySample")}
          </p>
          <p className="font-display text-h1 font-extrabold">{t("h1Sample")}</p>
          <p className="font-display text-h2 font-bold">{t("h2Sample")}</p>
          <p className="text-body">{t("bodySample")}</p>
          <p className="rounded-panel bg-espresso text-kitchen text-kitchen-text p-6">
            {t("kitchenSample")}
          </p>
        </div>
      </section>

      <section aria-labelledby="ds-components" className="mt-section">
        <h2 id="ds-components" className="text-h2 font-bold">
          {t("components")}
        </h2>

        <h3 className="text-h3 mt-8 font-bold">{t("buttons")}</h3>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button size="lg">{t("primary")}</Button>
          <Button variant="secondary">{t("secondary")}</Button>
          <Button variant="ghost">{t("ghost")}</Button>
        </div>

        <h3 className="text-h3 mt-10 font-bold">{t("cards")}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <p className="font-display text-h3 font-bold">{t("cardTitle")}</p>
            <p className="text-muted mt-1">{t("cardBody")}</p>
          </Card>
          <Card tone="dark">
            <p className="font-display text-h3 font-bold">
              {t("darkCardTitle")}
            </p>
            <p className="text-kitchen-muted mt-1">{t("darkCardBody")}</p>
          </Card>
        </div>

        <h3 className="text-h3 mt-10 font-bold">{t("tabs")}</h3>
        <div className="mt-4">
          <Tabs
            label={t("mealsLabel")}
            items={[
              {
                id: "breakfast",
                label: t("breakfast"),
                content: <p>{t("breakfastBody")}</p>,
              },
              {
                id: "lunch",
                label: t("lunch"),
                content: <p>{t("lunchBody")}</p>,
              },
              {
                id: "dinner",
                label: t("dinner"),
                content: <p>{t("dinnerBody")}</p>,
              },
            ]}
          />
        </div>

        <h3 className="text-h3 mt-10 font-bold">{t("ingredients")}</h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ingredients.map((ing) => (
            <li key={ing.key}>
              <IngredientBar
                name={t(ing.key)}
                amount={t(`${ing.key}Amount`)}
                share={ing.share}
                totalRecipes={TOTAL}
                color={ing.color}
                caption={t("caption", {
                  count: recipeCount(ing.share, TOTAL),
                  total: TOTAL,
                })}
              />
            </li>
          ))}
        </ul>

        <h3 className="text-h3 mt-10 font-bold">{t("divider")}</h3>
        <SectionDivider />
      </section>
    </main>
  );
}
