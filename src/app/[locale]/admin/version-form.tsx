"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  parseQuantity,
  type IngredientLine,
} from "@/lib/core/ingredient-lines";
import { parseIngredients, saveVersion, type DishChoice } from "./actions";

export interface DishOption {
  id: string;
  name: string;
}

const MEALS = ["breakfast", "soup", "main", "side", "dessert"] as const;

// Quantity is edited as text so "1/2" and "1,5" can be typed
interface Row {
  rawText: string;
  quantity: string;
  unit: string;
}

const toRow = (line: IngredientLine): Row => ({
  rawText: line.rawText,
  quantity: line.quantity === null ? "" : String(line.quantity),
  unit: line.unit ?? "",
});

const toLine = (row: Row): IngredientLine => ({
  rawText: row.rawText,
  quantity: parseQuantity(row.quantity),
  unit: row.unit.trim() === "" ? null : row.unit.trim(),
});

const field =
  "h-11 w-full rounded-card border-[1.5px] border-line bg-card px-3 text-body text-ink";

export function VersionForm({ dishes }: { dishes: DishOption[] }) {
  const t = useTranslations("AdminForm");
  const [pending, startTransition] = useTransition();

  const [dishId, setDishId] = useState(dishes[0]?.id ?? "new");
  const [nameTr, setNameTr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [meal, setMeal] = useState<(typeof MEALS)[number]>("main");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rating, setRating] = useState("");
  const [voteCount, setVoteCount] = useState("");
  const [pasted, setPasted] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const isNew = dishId === "new";

  function split() {
    setMessage(null);
    startTransition(async () => {
      const result = await parseIngredients(pasted);
      if (result.ok) setRows(result.lines.map(toRow));
      else setMessage({ ok: false, text: t(`errors.${result.error}`) });
    });
  }

  function save() {
    setMessage(null);
    const dish: DishChoice = isNew
      ? { kind: "new", nameTr, nameEn, meal }
      : { kind: "existing", dishId };

    startTransition(async () => {
      const result = await saveVersion({
        dish,
        sourceUrl,
        rating,
        voteCount,
        lines: rows.map(toLine),
      });
      if (!result.ok) {
        setMessage({ ok: false, text: t(`errors.${result.error}`) });
        return;
      }
      setMessage({ ok: true, text: t("saved") });
      setSourceUrl("");
      setRating("");
      setVoteCount("");
      setPasted("");
      setRows([]);
      if (isNew) {
        setNameTr("");
        setNameEn("");
      }
    });
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 text-left">
      <Card className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">{t("dish")}</h2>
        <label className="text-small flex flex-col gap-1.5 font-bold">
          {t("dishSelect")}
          <select
            className={field}
            value={dishId}
            onChange={(e) => setDishId(e.target.value)}
          >
            {dishes.map((dish) => (
              <option key={dish.id} value={dish.id}>
                {dish.name}
              </option>
            ))}
            <option value="new">{t("newDish")}</option>
          </select>
        </label>
        {isNew && (
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-small flex flex-col gap-1.5 font-bold">
              {t("nameTr")}
              <input
                className={field}
                value={nameTr}
                onChange={(e) => setNameTr(e.target.value)}
              />
            </label>
            <label className="text-small flex flex-col gap-1.5 font-bold">
              {t("nameEn")}
              <input
                className={field}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </label>
            <label className="text-small flex flex-col gap-1.5 font-bold">
              {t("meal")}
              <select
                className={field}
                value={meal}
                onChange={(e) =>
                  setMeal(e.target.value as (typeof MEALS)[number])
                }
              >
                {MEALS.map((m) => (
                  <option key={m} value={m}>
                    {t(`meals.${m}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">{t("version")}</h2>
        <label className="text-small flex flex-col gap-1.5 font-bold">
          {t("sourceUrl")}
          <input
            className={field}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-small flex flex-col gap-1.5 font-bold">
            {t("rating")}
            <input
              className={field}
              inputMode="decimal"
              placeholder="4,6"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </label>
          <label className="text-small flex flex-col gap-1.5 font-bold">
            {t("voteCount")}
            <input
              className={field}
              inputMode="numeric"
              value={voteCount}
              onChange={(e) => setVoteCount(e.target.value)}
            />
          </label>
        </div>
        <p className="text-small opacity-70">{t("copyrightNote")}</p>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-h2 font-semibold">{t("ingredients")}</h2>
        <label className="text-small flex flex-col gap-1.5 font-bold">
          {t("pasteLabel")}
          <textarea
            className={`${field} h-40 py-2`}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
        </label>
        <div>
          <Button
            variant="secondary"
            onClick={split}
            disabled={pending || pasted.trim() === ""}
          >
            {pending ? t("working") : t("split")}
          </Button>
        </div>

        {rows.length > 0 && (
          <ul className="flex flex-col gap-3">
            {rows.map((row, index) => (
              <li
                key={index}
                className="grid grid-cols-[1fr_5rem_8rem_auto] items-center gap-2"
              >
                <input
                  className={field}
                  aria-label={t("rowText")}
                  value={row.rawText}
                  onChange={(e) =>
                    updateRow(index, { rawText: e.target.value })
                  }
                />
                <input
                  className={field}
                  aria-label={t("rowQuantity")}
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(e) =>
                    updateRow(index, { quantity: e.target.value })
                  }
                />
                <input
                  className={field}
                  aria-label={t("rowUnit")}
                  value={row.unit}
                  onChange={(e) => updateRow(index, { unit: e.target.value })}
                />
                <Button
                  variant="ghost"
                  aria-label={t("removeRow")}
                  onClick={() =>
                    setRows((current) => current.filter((_, i) => i !== index))
                  }
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={pending || rows.length === 0}>
          {t("save")}
        </Button>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={message.ok ? "text-small" : "text-small font-bold"}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
