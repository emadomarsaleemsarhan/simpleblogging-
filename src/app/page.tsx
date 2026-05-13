import Link from "next/link";
import { redirect } from "next/navigation";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { getCurrentSession } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/locales";

const featureKeys: MessageKey[] = [
  "public.features.docx",
  "public.features.review",
  "public.features.templates",
  "public.features.static",
];

export default async function Home() {
  const [session, translator] = await Promise.all([getCurrentSession(), getTranslator()]);

  if (session?.user?.id) {
    redirect("/dashboard/posts");
  }

  return (
    <main className="platform-page">
      <nav className="platform-nav" aria-label="Platform">
        <Link className="platform-brand" href="/">
          <span className="platform-brand-mark">BP</span>
          <span>Blog Publisher</span>
        </Link>
        <div className="platform-nav-links">
          <a href="#features">{translator.t("public.nav.features")}</a>
          <a href="#template">{translator.t("public.nav.templates")}</a>
          <LocaleSwitcher currentLocale={translator.locale} returnTo="/" />
        </div>
      </nav>

      <section className="platform-hero">
        <div className="platform-hero-copy">
          <p className="eyebrow">{translator.t("public.hero.kicker")}</p>
          <h1>{translator.t("public.hero.title")}</h1>
          <p>{translator.t("public.hero.subtitle")}</p>
          <div className="platform-actions">
            <Link className="primary-action" href="/login">
              {translator.t("public.hero.signIn")}
            </Link>
            <a className="secondary-action" href="#template">
              {translator.t("public.hero.preview")}
            </a>
          </div>
        </div>

        <aside className="platform-flow-card" aria-label={translator.t("public.flow.title")}>
          <h2>{translator.t("public.flow.title")}</h2>
          <ol>
            <li>{translator.t("public.flow.upload")}</li>
            <li>{translator.t("public.flow.review")}</li>
            <li>{translator.t("public.flow.export")}</li>
          </ol>
        </aside>
      </section>

      <section id="features" className="platform-feature-grid" aria-label={translator.t("public.nav.features")}>
        {featureKeys.map((key) => (
          <article key={key} className="platform-feature-card">
            <span className="feature-marker" />
            <h2>{translator.t(key)}</h2>
          </article>
        ))}
      </section>

      <section id="template" className="platform-template-preview">
        <div className="template-masthead">Editorial static site</div>
        <div className="template-preview-grid">
          <div>
            <p className="eyebrow">Published website</p>
            <h2>Content-first, portable, fast</h2>
          </div>
          <div className="template-preview-stack" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}
