import { redirect } from "next/navigation";

import { TaxonomyManager } from "@/components/dashboard/taxonomy-manager";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSlug } from "@/lib/slug";
import { deleteCategoryForBlog, deleteTagForBlog } from "@/lib/taxonomy";

export default async function TaxonomyPage() {
  const session = await requireSession();
  const blog = await getDefaultBlogForUser(session.user.id);
  const [categories, tags] = await Promise.all([
    db.category.findMany({
      where: { blogId: blog.id },
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      where: { blogId: blog.id },
      orderBy: { name: "asc" },
    }),
  ]);

  async function createCategory(formData: FormData) {
    "use server";
    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    const name = String(formData.get("name") ?? "").trim();
    await db.category.create({ data: { blogId: blog.id, name, slug: createSlug(name) } });
    redirect("/dashboard/taxonomy");
  }

  async function createTag(formData: FormData) {
    "use server";
    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    const name = String(formData.get("name") ?? "").trim();
    await db.tag.create({ data: { blogId: blog.id, name, slug: createSlug(name) } });
    redirect("/dashboard/taxonomy");
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    await deleteCategoryForBlog(blog.id, String(formData.get("id")));
    redirect("/dashboard/taxonomy");
  }

  async function deleteTag(formData: FormData) {
    "use server";
    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    await deleteTagForBlog(blog.id, String(formData.get("id")));
    redirect("/dashboard/taxonomy");
  }

  return (
    <section>
      <h1>Categories & Tags</h1>
      <TaxonomyManager
        categories={categories}
        tags={tags}
        createCategory={createCategory}
        createTag={createTag}
        deleteCategory={deleteCategory}
        deleteTag={deleteTag}
      />
    </section>
  );
}
