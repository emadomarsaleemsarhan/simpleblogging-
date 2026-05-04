"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/posts/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Upload failed.");
      return;
    }

    router.push(`/dashboard/posts/${payload.postId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="stack-form">
      <label>
        <span>Word file</span>
        <input name="file" type="file" accept=".docx" required />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Converting..." : "Convert Word file"}
      </button>
    </form>
  );
}
