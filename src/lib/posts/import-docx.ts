import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";
import { convertDocxToPostDraft } from "@/lib/docx/converter";
import { getPostAssetPath, getUploadPath } from "@/lib/paths";

export async function createUniqueSlug(baseSlug: string, exists: (candidate: string) => Promise<boolean>) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function importDocxPost(input: {
  blogId: string;
  authorId: string;
  originalFilename: string;
  buffer: Buffer;
}) {
  if (path.extname(input.originalFilename).toLowerCase() !== ".docx") {
    throw new Error("Only .docx files are supported.");
  }

  const postId = crypto.randomUUID();
  const uploadPath = getUploadPath(input.blogId, postId);
  await fs.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.writeFile(uploadPath, input.buffer);

  const converted = await convertDocxToPostDraft({
    filePath: uploadPath,
    originalFilename: input.originalFilename,
    assetOutputDir: getPostAssetPath(input.blogId, postId),
  });

  const slug = await createUniqueSlug(converted.slug, async (candidate) => {
    const existing = await db.post.findUnique({
      where: {
        blogId_slug: {
          blogId: input.blogId,
          slug: candidate,
        },
      },
      select: { id: true },
    });

    return Boolean(existing);
  });

  const post = await db.post.create({
    data: {
      id: postId,
      blogId: input.blogId,
      authorId: input.authorId,
      title: converted.title,
      slug,
      excerpt: converted.metaDescription,
      content: converted.html,
      status: "DRAFT",
      assets: {
        create: converted.assets.map((assetPath) => ({
          blogId: input.blogId,
          userId: input.authorId,
          type: "IMAGE",
          url: assetPath,
          filename: path.basename(assetPath),
        })),
      },
    },
  });

  return {
    post,
    warnings: converted.warnings,
  };
}
