import { getDefaultBlogForUser } from "@/lib/blogs";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { ExportButton } from "./export-button";

export default async function ExportPage() {
  const session = await requireSession();
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
      <h1>Export</h1>
      <p>Generate a static website ZIP for the published posts in this blog.</p>
      <ExportButton />
      <h2>Recent exports</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Updated</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {exports.map((exportRecord) => (
            <tr key={exportRecord.id}>
              <td>{exportRecord.status}</td>
              <td>{exportRecord.updatedAt.toLocaleString()}</td>
              <td>
                {exportRecord.status === "COMPLETED" ? (
                  <a href={`/api/exports/${exportRecord.id}/download`}>Download ZIP</a>
                ) : (
                  "Unavailable"
                )}
              </td>
            </tr>
          ))}
          {exports.length === 0 ? (
            <tr>
              <td colSpan={3}>No exports yet.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
