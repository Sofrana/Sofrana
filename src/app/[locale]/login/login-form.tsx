"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form
      action={action}
      className="flex w-full max-w-sm flex-col gap-4 text-left"
    >
      <label className="flex flex-col gap-1 text-sm">
        {t("email")}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t("password")}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border px-3 py-2"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm">
          {t(
            state.error === "invalid" ? "invalidCredentials" : "missingFields",
          )}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded border px-3 py-2 font-medium disabled:opacity-50"
      >
        {pending ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
