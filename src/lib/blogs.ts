import { db } from "@/lib/db";
import { createSlug } from "@/lib/slug";

export async function getDefaultBlogForUser(userId: string) {
  const memberBlog = await db.blog.findFirst({
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

  if (memberBlog) {
    return memberBlog;
  }

  const ownedBlog = await db.blog.findUnique({
    where: {
      ownerId: userId,
    },
  });

  if (ownedBlog) {
    await db.blogMember.upsert({
      where: {
        blogId_userId: {
          blogId: ownedBlog.id,
          userId,
        },
      },
      update: {
        role: "OWNER",
      },
      create: {
        blogId: ownedBlog.id,
        userId,
        role: "OWNER",
      },
    });

    return ownedBlog;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("No user is available for this session.");
  }

  const blogName = `${user.name || user.email.split("@")[0]}'s Blog`;
  const slug = await createUniqueBlogSlug(blogName);

  return db.blog.create({
    data: {
      name: blogName,
      slug,
      baseUrl: "https://example.com/",
      locale: "en",
      templateKey: "editorial",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });
}

async function createUniqueBlogSlug(name: string) {
  const baseSlug = createSlug(name) || "blog";
  let slug = baseSlug;
  let suffix = 2;

  while (await db.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
