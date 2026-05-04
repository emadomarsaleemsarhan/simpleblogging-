import { redirect } from "next/navigation";

import { BlogSettingsForm } from "@/components/dashboard/blog-settings-form";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeBaseUrl } from "@/lib/settings";
import { createSlug } from "@/lib/slug";

export default async function SettingsPage() {
  const session = await requireSession();
  const blog = await getDefaultBlogForUser(session.user.id);

  async function updateSettings(formData: FormData) {
    "use server";
    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    const name = String(formData.get("name") ?? "").trim();
    const slug = createSlug(String(formData.get("slug") ?? name));
    const baseUrl = normalizeBaseUrl(String(formData.get("baseUrl") ?? ""));

    await db.blog.update({
      where: { id: blog.id },
      data: {
        name,
        slug,
        baseUrl,
      },
    });

    redirect("/dashboard/settings");
  }

  return (
    <section>
      <h1>Settings</h1>
      <BlogSettingsForm action={updateSettings} blog={blog} />
    </section>
  );
}
