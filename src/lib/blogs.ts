import { db } from "@/lib/db";

export async function getDefaultBlogForUser(userId: string) {
  const blog = await db.blog.findFirst({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!blog) {
    throw new Error("No blog is available for this user.");
  }

  return blog;
}
