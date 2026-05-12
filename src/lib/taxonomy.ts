import { db } from "@/lib/db";

export async function deleteCategoryForBlog(blogId: string, categoryId: string) {
  return db.category.deleteMany({
    where: {
      id: categoryId,
      blogId,
    },
  });
}

export async function deleteTagForBlog(blogId: string, tagId: string) {
  return db.tag.deleteMany({
    where: {
      id: tagId,
      blogId,
    },
  });
}
