import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslator } from "@/lib/i18n/server";

import { ExportButton } from "./export-button";

export default async function ExportPage() {
  const [session, translator] = await Promise.all([requireSession(), getTranslator()]);
  const blog = await getDefaultBlogForUser(session.user.id);
  const exports = await db.export.findMany({
    where: {
      blogId: blog.id,
      provider: "ZIP",
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  return (
    <section>
      <h1>{translator.t("export.title")}</h1>
      <p>{translator.t("export.description")}</p>
      <ExportButton
        labels={{
          exportWebsite: translator.t("export.exportWebsite"),
          exporting: translator.t("export.exporting"),
          failed: translator.t("export.failed"),
          completed: translator.t("export.completed"),
          preview: translator.t("export.preview"),
          downloadZip: translator.t("export.downloadZip"),
        }}
      />
      <h2>{translator.t("export.recent")}</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>{translator.t("export.status")}</th>
            <th>{translator.t("export.updated")}</th>
            <th>{translator.t("export.preview")}</th>
            <th>{translator.t("export.downloadZip")}</th>
          </tr>
        </thead>
        <tbody>
          {exports.map((exportRecord) => (
            <tr key={exportRecord.id}>
              <td>{exportRecord.status}</td>
              <td>{exportRecord.updatedAt.toLocaleString()}</td>
              <td>
                {exportRecord.status === "COMPLETED" ? (
                  <a href={`/dashboard/export/${exportRecord.id}/preview`}>{translator.t("export.preview")}</a>
                ) : (
                  translator.t("export.unavailable")
                )}
              </td>
              <td>
                {exportRecord.status === "COMPLETED" ? (
                  <a href={`/api/exports/${exportRecord.id}/download`}>{translator.t("export.downloadZip")}</a>
                ) : (
                  translator.t("export.unavailable")
                )}
              </td>
            </tr>
          ))}
          {exports.length === 0 ? (
            <tr>
              <td colSpan={4}>{translator.t("export.empty")}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
