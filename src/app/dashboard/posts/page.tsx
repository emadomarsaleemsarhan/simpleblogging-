import Link from "next/link";

import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";
import { statusLabel } from "@/lib/i18n/locales";

export default async function PostsPage() {
  const [session, translator] = await Promise.all([requireSession(), getTranslator()]);
  const blog = await getDefaultBlogForUser(session.user.id);
  const posts = await db.post.findMany({
    where: { blogId: blog.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>{translator.t("posts.title")}</h1>
          <p>{translator.t("posts.subtitle")}</p>
        </div>
        <Link className="button-link" href="/dashboard/posts/upload">
          {translator.t("posts.upload")}
        </Link>
      </div>
      <div className="table-frame editorial-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>{translator.t("table.title")}</th>
              <th>{translator.t("table.slug")}</th>
              <th>{translator.t("table.category")}</th>
              <th>{translator.t("table.status")}</th>
              <th>{translator.t("table.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/dashboard/posts/${post.id}`}>{post.title}</Link>
                </td>
                <td>{post.slug}</td>
                <td>{post.category?.name ?? translator.t("posts.uncategorized")}</td>
                <td>
                  <span className="status-chip" data-status={post.status}>
                    {statusLabel(post.status, translator.locale)}
                  </span>
                </td>
                <td>{post.updatedAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5}>{translator.t("posts.empty")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
