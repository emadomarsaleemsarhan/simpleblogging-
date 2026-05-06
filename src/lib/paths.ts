import path from "node:path";

const storageRoot = process.env.BLOG_PUBLISHER_STORAGE_ROOT
  ? path.resolve(process.env.BLOG_PUBLISHER_STORAGE_ROOT)
  : path.join(process.cwd(), "storage");

export function getBlogStoragePath(blogId: string) {
  return path.join(storageRoot, "blogs", blogId);
}

export function getUploadPath(blogId: string, postId: string) {
  return path.join(getBlogStoragePath(blogId), "uploads", `${postId}.docx`);
}

export function getPostAssetPath(blogId: string, postId: string) {
  return path.join(getBlogStoragePath(blogId), "assets", "posts", postId);
}

export function getExportPath(blogId: string, exportId: string) {
  return path.join(getBlogStoragePath(blogId), "exports", exportId);
}

export function getExportZipPath(blogId: string, exportId: string) {
  return path.join(getExportPath(blogId, exportId), "website.zip");
}
