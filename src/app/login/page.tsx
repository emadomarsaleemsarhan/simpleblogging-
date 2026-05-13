import { Suspense } from "react";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslator } from "@/lib/i18n/server";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const { locale, t } = await getTranslator();

  return (
    <main className="auth-page publisher-auth">
      <section className="auth-story">
        <Link className="platform-brand" href="/">
          <span className="platform-brand-mark">BP</span>
          <span>Blog Publisher</span>
        </Link>
        <p className="eyebrow">Publisher OS</p>
        <h1>{t("auth.signIn")}</h1>
        <p>{t("auth.subtitle")}</p>
      </section>
      <section className="auth-card editorial-panel">
        <div className="auth-card-header">
          <LocaleSwitcher currentLocale={locale} returnTo="/login" />
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
