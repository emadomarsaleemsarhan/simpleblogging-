import { NextResponse } from "next/server";

import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { importDocxPost } from "@/lib/posts/import-docx";

export async function POST(request: Request) {
  const session = await requireSession();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Word file is required." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".docx")) {
    return NextResponse.json({ error: "Only .docx files are supported." }, { status: 400 });
  }

  const blog = await getDefaultBlogForUser(session.user.id);
  const arrayBuffer = await file.arrayBuffer();
  const result = await importDocxPost({
    blogId: blog.id,
    authorId: session.user.id,
    originalFilename: file.name,
    buffer: Buffer.from(arrayBuffer),
  });

  return NextResponse.json({
    postId: result.post.id,
    warnings: result.warnings,
  });
}
