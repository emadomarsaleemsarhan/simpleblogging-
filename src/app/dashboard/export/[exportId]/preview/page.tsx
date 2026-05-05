import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { getDefaultBlogForUser } from "@/lib/blogs";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";

export default async function ExportPreviewPage({ params }: { params: Promise<{ exportId: string }> }) {
  const [session, translator, routeParams] = await Promise.all([requireSession(), getTranslator(), params]);
  const blog = await getDefaultBlogForUser(session.user.id);
  const exportRecord = await db.export.findFirst({
    where: {
      id: routeParams.exportId,
      blogId: blog.id,
      status: "COMPLETED",
    },
  });

  if (!exportRecord) {
    notFound();
  }

  return (
    <section className="preview-page">
      <div className="page-title-row">
        <div>
          <h1>{translator.t("export.preview")}</h1>
          <p>{blog.name}</p>
        </div>
        <Link className="button-link" href="/dashboard/export">
          {translator.t("export.title")}
        </Link>
      </div>
      <iframe
        className="site-preview-frame"
        src={`/api/exports/${exportRecord.id}/preview/`}
        title={translator.t("export.preview")}
      />
    </section>
  );
}
