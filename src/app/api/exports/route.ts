import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { db } from "@/lib/db";
import { getExportPath, getExportZipPath } from "@/lib/paths";
import { generateStaticSite } from "@/lib/static/site-generator";
import { zipDirectory } from "@/lib/static/zip";

export async function POST() {
  const session = await requireSession();
  const blog = await getDefaultBlogForUser(session.user.id);

  const exportRecord = await db.export.create({
    data: {
      blogId: blog.id,
      userId: session.user.id,
      provider: "ZIP",
      status: "PENDING",
    },
  });

  const outputDir = path.join(getExportPath(blog.id, exportRecord.id), "site");
  const zipPath = getExportZipPath(blog.id, exportRecord.id);

  try {
    const posts = await db.post.findMany({
      where: {
        blogId: blog.id,
        status: "PUBLISHED",
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const result = await generateStaticSite({
      blog: {
        name: blog.name,
        baseUrl: blog.baseUrl,
        locale: blog.locale,
      },
      posts: posts.map((post) => ({
        title: post.title,
        slug: post.slug,
        html: post.content,
        metaDescription: post.excerpt ?? "",
        updatedAt: post.updatedAt,
        category: post.category,
        tags: post.tags,
      })),
      outputDir,
    });
    const archive = await zipDirectory(outputDir);
    await fs.mkdir(path.dirname(zipPath), { recursive: true });
    await fs.writeFile(zipPath, archive);

    await db.export.update({
      where: { id: exportRecord.id },
      data: {
        status: "COMPLETED",
        resultUrl: zipPath,
        payload: JSON.stringify({ files: result.files.length }),
      },
    });

    return NextResponse.json({ exportId: exportRecord.id, files: result.files.length });
  } catch (error) {
    await db.export.update({
      where: { id: exportRecord.id },
      data: {
        status: "FAILED",
        payload: JSON.stringify({ error: error instanceof Error ? error.message : "Export failed" }),
      },
    });
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
