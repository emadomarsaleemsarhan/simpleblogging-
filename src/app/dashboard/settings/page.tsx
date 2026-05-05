import { redirect } from "next/navigation";

import { BlogSettingsForm } from "@/components/dashboard/blog-settings-form";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { parseLocale } from "@/lib/i18n/locales";
import { normalizeBaseUrl } from "@/lib/settings";
import { createSlug } from "@/lib/slug";

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

    await db.blog.update({
      where: { id: blog.id },
      data: {
        name,
        slug,
        baseUrl,
        locale,
      },
    });

    redirect("/dashboard/settings");
  }

  return (
    <section>
      <h1>{translator.t("settings.title")}</h1>
      <BlogSettingsForm
        action={updateSettings}
        blog={blog}
        labels={{
          blogName: translator.t("settings.blogName"),
          slug: translator.t("settings.slug"),
          baseUrl: translator.t("settings.baseUrl"),
          siteLanguage: translator.t("settings.siteLanguage"),
          futureProviders: translator.t("settings.futureProviders"),
          githubRepository: translator.t("settings.githubRepository"),
          githubReserved: translator.t("settings.githubReserved"),
          save: translator.t("settings.save"),
        }}
      />
    </section>
  );
}
