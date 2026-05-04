import type { PostStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { PostForm } from "@/components/dashboard/post-form";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canTransitionPostStatus } from "@/lib/posts/status";

export default async function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
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

  async function updatePost(formData: FormData) {
    "use server";

    const session = await requireSession();
    const blog = await getDefaultBlogForUser(session.user.id);
    const { postId } = await params;
    const currentPost = await db.post.findFirst({
      where: {
        id: postId,
        blogId: blog.id,
      },
    });

    if (!currentPost) {
      notFound();
    }

    const nextStatus = String(formData.get("status")) as PostStatus;
    if (nextStatus !== currentPost.status && !canTransitionPostStatus(currentPost.status, nextStatus)) {
      throw new Error(`Cannot move post from ${currentPost.status} to ${nextStatus}.`);
    }

    await db.post.update({
      where: { id: currentPost.id },
      data: {
        title: String(formData.get("title") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        excerpt: String(formData.get("excerpt") ?? ""),
        content: String(formData.get("content") ?? ""),
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" ? new Date() : currentPost.publishedAt,
      },
    });

    redirect(`/dashboard/posts/${currentPost.id}`);
  }

  return (
    <section>
      <h1>Edit post</h1>
      <PostForm action={updatePost} post={post} />
    </section>
  );
}
