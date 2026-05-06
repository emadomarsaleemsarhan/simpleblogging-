"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExportButton({
  labels,
}: {
  labels: {
    exportWebsite: string;
    exporting: string;
    failed: string;
    completed: string;
    preview: string;
    downloadZip: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [exportId, setExportId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setError("");
    setExportId("");
    setIsExporting(true);
    const response = await fetch("/api/exports", { method: "POST" });
    setIsExporting(false);

    if (!response.ok) {
      setError(labels.failed);
      return;
    }

    const payload = (await response.json()) as { exportId: string };
    setExportId(payload.exportId);
    router.refresh();
  }

  return (
    <div className="stack-form">
      <button type="button" onClick={handleExport} disabled={isExporting}>
        {isExporting ? labels.exporting : labels.exportWebsite}
      </button>
      {error ? <p role="alert">{error}</p> : null}
      {exportId ? (
        <p role="status" className="export-success editorial-panel">
          {labels.completed}{" "}
          <a href={`/dashboard/export/${exportId}/preview`}>{labels.preview}</a>{" "}
          <a href={`/api/exports/${exportId}/download`}>{labels.downloadZip}</a>
        </p>
      ) : null}
    </div>
  );
}
