import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  categoryDeleteMany: vi.fn(),
  tagDeleteMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    category: {
      deleteMany: mocks.categoryDeleteMany,
    },
    tag: {
      deleteMany: mocks.tagDeleteMany,
    },
  },
}));

import { deleteCategoryForBlog, deleteTagForBlog } from "../../src/lib/taxonomy";

describe("taxonomy deletion", () => {
  beforeEach(() => {
    mocks.categoryDeleteMany.mockReset();
    mocks.tagDeleteMany.mockReset();
  });

  it("scopes category deletion to the current blog", async () => {
    await deleteCategoryForBlog("blog-1", "category-1");

    expect(mocks.categoryDeleteMany).toHaveBeenCalledWith({
      where: {
        id: "category-1",
        blogId: "blog-1",
      },
    });
  });

  it("scopes tag deletion to the current blog", async () => {
    await deleteTagForBlog("blog-1", "tag-1");

    expect(mocks.tagDeleteMany).toHaveBeenCalledWith({
      where: {
        id: "tag-1",
        blogId: "blog-1",
      },
    });
  });
});
