import { redirect } from "next/navigation";

import { BlogSettingsForm } from "@/components/dashboard/blog-settings-form";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { parseLocale } from "@/lib/i18n/locales";
import { normalizeBaseUrl } from "@/lib/settings";
import { createSlug } from "@/lib/slug";
import { normalizeStaticTheme, parseTemplateKey, staticTemplateOptions } from "@/lib/static/templates";

export default async function SettingsPage() {
  const [session, translator] = await Promise.all([requireSession(), getTranslator()]);
  const blog = await getDefaultBlogForUser(session.user.id);

  async function updateSettings(formData: FormData) {
    "use server";
    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    const name = String(formData.get("name") ?? "").trim();
    const slug = createSlug(String(formData.get("slug") ?? name));
    const baseUrl = normalizeBaseUrl(String(formData.get("baseUrl") ?? ""));
    const locale = parseLocale(String(formData.get("locale") ?? ""));
    const templateKey = parseTemplateKey(String(formData.get("templateKey") ?? ""));
    const theme = normalizeStaticTheme({
      themePrimaryColor: String(formData.get("themePrimaryColor") ?? ""),
      themeSecondaryColor: String(formData.get("themeSecondaryColor") ?? ""),
      themeBackgroundColor: String(formData.get("themeBackgroundColor") ?? ""),
      themeHeadingStyle: String(formData.get("themeHeadingStyle") ?? ""),
    });

    await db.blog.update({
      where: { id: blog.id },
      data: {
        name,
        slug,
        baseUrl,
        locale,
        templateKey,
        themePrimaryColor: theme.primaryColor,
        themeSecondaryColor: theme.secondaryColor,
        themeBackgroundColor: theme.backgroundColor,
        themeHeadingStyle: theme.headingStyle,
      },
    });

    redirect("/dashboard/settings");
  }

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>{translator.t("settings.title")}</h1>
          <p>{translator.t("settings.templateHelp")}</p>
        </div>
      </div>
      <BlogSettingsForm
        action={updateSettings}
        blog={{
          name: blog.name,
          slug: blog.slug,
          baseUrl: blog.baseUrl,
          locale: blog.locale,
          templateKey: blog.templateKey,
          themePrimaryColor: blog.themePrimaryColor,
          themeSecondaryColor: blog.themeSecondaryColor,
          themeBackgroundColor: blog.themeBackgroundColor,
          themeHeadingStyle: blog.themeHeadingStyle,
        }}
        labels={{
          blogName: translator.t("settings.blogName"),
          slug: translator.t("settings.slug"),
          baseUrl: translator.t("settings.baseUrl"),
          siteLanguage: translator.t("settings.siteLanguage"),
          template: translator.t("settings.template"),
          futureProviders: translator.t("settings.futureProviders"),
          githubRepository: translator.t("settings.githubRepository"),
          githubReserved: translator.t("settings.githubReserved"),
          templateHelp: translator.t("settings.templateHelp"),
          save: translator.t("settings.save"),
        }}
        templates={staticTemplateOptions}
      />
    </section>
  );
}
