import { notFound } from "next/navigation";

import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizePostHtml } from "@/lib/html";

export default async function PreviewPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const session = await requireSession();
  const blog = await getDefaultBlogForUser(session.user.id);
  const { postId } = await params;
  const post = await db.post.findFirst({
    where: {
      id: postId,
      blogId: blog.id,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="post-preview">
      <h1>{post.title}</h1>
      {post.excerpt ? <p>{post.excerpt}</p> : null}
      <div dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }} />
    </article>
  );
}
