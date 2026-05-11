import fs from "node:fs/promises";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ exportId: string }> }) {
  const session = await requireSession();
  const blog = await getDefaultBlogForUser(session.user.id);
  const { exportId } = await params;
  const exportRecord = await db.export.findFirst({
    where: {
      id: exportId,
      blogId: blog.id,
      status: "COMPLETED",
    },
  });

  if (!exportRecord?.resultUrl) {
    return NextResponse.json({ error: "Export not found." }, { status: 404 });
  }

  if (isRemoteUrl(exportRecord.resultUrl)) {
    return NextResponse.redirect(exportRecord.resultUrl);
  }

  const archive = await fs.readFile(exportRecord.resultUrl);
  return new NextResponse(archive, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${blog.slug}-website.zip"`,
    },
  });
}

function isRemoteUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://");
}
