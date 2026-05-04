import Link from "next/link";

import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PostsPage() {
  const session = await requireSession();
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
          <h1>Posts</h1>
          <p>Review converted Word posts and manage publishing status.</p>
        </div>
        <Link className="button-link" href="/dashboard/posts/upload">
          Upload Word
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Category</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                <Link href={`/dashboard/posts/${post.id}`}>{post.title}</Link>
              </td>
              <td>{post.slug}</td>
              <td>{post.category?.name ?? "Uncategorized"}</td>
              <td>{post.status}</td>
              <td>{post.updatedAt.toLocaleDateString()}</td>
            </tr>
          ))}
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5}>No posts yet.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
