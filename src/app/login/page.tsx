import { Suspense } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslator } from "@/lib/i18n/server";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const { locale, t } = await getTranslator();

  return (
    <main className="auth-page">
      <section className="auth-card editorial-panel">
        <div className="auth-card-header">
          <LocaleSwitcher currentLocale={locale} returnTo="/login" />
          <p className="eyebrow">Blog Publisher</p>
          <h1 className="auth-brand-title">{t("auth.signIn")}</h1>
          <p>{t("auth.subtitle")}</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm
            labels={{
              email: t("auth.email"),
              password: t("auth.password"),
              signIn: t("auth.signIn"),
              signingIn: t("auth.signingIn"),
              invalidLogin: t("auth.invalidLogin"),
            }}
          />
        </Suspense>
      </section>
    </main>
  );
}
