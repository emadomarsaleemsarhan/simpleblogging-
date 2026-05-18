import fs from "node:fs/promises";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { db } from "@/lib/db";
import { parseExportPayload, previewContentType, resolvePreviewFile, rewritePreviewHtmlLinks } from "@/lib/static/preview";

export async function GET(request: Request, { params }: { params: Promise<{ exportId: string; path?: string[] }> }) {
  const session = await requireSession();
  const blog = await getDefaultBlogForUser(session.user.id);
  const { exportId, path } = await params;
  const exportRecord = await db.export.findFirst({
    where: {
      id: exportId,
      blogId: blog.id,
      status: "COMPLETED",
    },
  });

  const payload = parseExportPayload(exportRecord?.payload ?? null);
  if (!payload.siteDir) {
    return NextResponse.json({ error: "Preview not found." }, { status: 404 });
  }

  const directoryRequest = new URL(request.url).pathname.endsWith("/");
  const filePath = resolvePreviewFile(payload.siteDir, path, directoryRequest);
  if (!filePath) {
    return NextResponse.json({ error: "Preview path is invalid." }, { status: 400 });
  }

  try {
    const file = await fs.readFile(filePath);
    const contentType = previewContentType(filePath);
    const body = contentType.startsWith("text/html")
      ? rewritePreviewHtmlLinks({
          html: file.toString("utf8"),
          currentSegments: path,
          directoryRequest,
          previewRootPath: `/api/exports/${exportId}/preview`,
        })
      : file;

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Preview file not found." }, { status: 404 });
  }
}
