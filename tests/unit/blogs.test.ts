import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDefaultBlogForUser } from "../../src/lib/blogs";
import { db } from "../../src/lib/db";

vi.mock("../../src/lib/db", () => ({
  db: {
    blog: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    blogMember: {
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const mockedDb = vi.mocked(db);

describe("getDefaultBlogForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an existing member blog", async () => {
    const blog = { id: "blog_1", name: "Existing" };
    mockedDb.blog.findFirst.mockResolvedValue(blog as never);

    await expect(getDefaultBlogForUser("user_1")).resolves.toBe(blog);
    expect(mockedDb.blog.create).not.toHaveBeenCalled();
  });

  it("repairs missing membership for an owned blog", async () => {
    const blog = { id: "blog_1", name: "Owned" };
    mockedDb.blog.findFirst.mockResolvedValue(null);
    mockedDb.blog.findUnique.mockResolvedValue(blog as never);
    mockedDb.blogMember.upsert.mockResolvedValue({} as never);

    await expect(getDefaultBlogForUser("user_1")).resolves.toBe(blog);
    expect(mockedDb.blogMember.upsert).toHaveBeenCalledWith({
      where: {
        blogId_userId: {
          blogId: "blog_1",
          userId: "user_1",
        },
      },
      update: {
        role: "OWNER",
      },
      create: {
        blogId: "blog_1",
        userId: "user_1",
        role: "OWNER",
      },
    });
  });

  it("creates a default blog when the user has none", async () => {
    mockedDb.blog.findFirst.mockResolvedValue(null);
    mockedDb.blog.findUnique.mockResolvedValue(null);
    mockedDb.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "owner@example.com",
      name: "Owner",
    } as never);
    mockedDb.blog.create.mockResolvedValue({ id: "blog_1", name: "Owner's Blog" } as never);

    await getDefaultBlogForUser("user_1");

    expect(mockedDb.blog.create).toHaveBeenCalledWith({
      data: {
        name: "Owner's Blog",
        slug: "owners-blog",
        baseUrl: "https://example.com/",
        locale: "en",
        templateKey: "editorial",
        ownerId: "user_1",
        members: {
          create: {
            userId: "user_1",
            role: "OWNER",
          },
        },
      },
    });
  });
});
