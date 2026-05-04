"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExportButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setError("");
    setIsExporting(true);
    const response = await fetch("/api/exports", { method: "POST" });
    setIsExporting(false);

    if (!response.ok) {
      setError("Export failed.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="stack-form">
      <button type="button" onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export Website"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
