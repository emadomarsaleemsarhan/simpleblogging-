import path from "node:path";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

export function resolvePreviewFile(siteDir: string, segments: string[] | undefined, directoryRequest = false) {
  const root = path.resolve(siteDir);
  const requested = segments?.length ? path.join(...segments) : "";
  const candidate = path.resolve(root, requested);

  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  if (!requested || directoryRequest) {
    return path.join(candidate, "index.html");
  }

  if (!path.extname(candidate)) {
    return path.join(candidate, "index.html");
  }

  return candidate;
}

export function previewContentType(filePath: string) {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function parseExportPayload(payload: string | null) {
  if (!payload) {
    return {};
  }

  try {
    return JSON.parse(payload) as { files?: number; siteDir?: string };
  } catch {
    return {};
  }
}
